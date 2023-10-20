"use strict";

async function _sitemap() {
  // console.log('fetching sitemap');
  let sitemap = [];
  const resp = await fetch('http://localhost:3001/tools/importer/data/sitemap.json');
  if (resp.ok) {
    const text = await resp.text();
    // console.log('Parsing sitemap to JSON');
    sitemap = JSON.parse(text);
    // console.log('Parsed sitemap');
  } else {
    console.error(`Unable to get sitemap. Response status ${resp.status}`);
  }
  return sitemap;
}

const sitemap = await _sitemap();

function mapToFranklinPath(path) {
  let newPath = path.replace(/\/content\/golfdigest-com\/en/, '').replace('\.html', '');
  newPath = WebImporter.FileUtils.sanitizePath(newPath);
  return newPath;
}

function findLongUrlInSitemap(path) {
  const map = sitemap.find(map => map.hasOwnProperty(path));
  if (map) {
    return map[path];
  }
  return null;
}

async function getRedirect(url) {
  try {
    const resp = await fetch(url);
    if (resp.redirected) {
      return resp.url;
    }
  } catch(err) {
    console.error(`Unable to fetch ${url}. ${err.message}.`, err);
  }
  return false;
}

async function parseHTML(text) {
  // DOMParser not present in Node
  if (typeof DOMParser === 'undefined') {
    const jsdom = new JSDOM(text);
    return jsdom.window.document;
  } else {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/html');
  }
}

async function fetchDocument(url) {
  const resp = await fetch(url);
  if (resp.ok) {
    const text = await resp.text();
    return await parseHTML(text);
  } else {
    console.log(`Unable to fetch ${url}. Response status: ${resp.status}`);
    throw new Error(resp.status);
  }
}

async function fetchLongPath(url) {
  // console.log(`fetching long path from ${url}`);
  const doc = await fetchDocument(url);
  if (doc) {
    return doc.body.getAttribute('data-page-path');
  }
}

function shouldRewriteLink(href) {
  return (href.startsWith('https://www.golfdigest.com/') || href.startsWith('http://www.golfdigest.com/') ||
    href.startsWith('//www.golfdigest.com/') ||
    href.startsWith('https://www.golfdigest.golf-prod.sports.aws.discovery.com/') ||
    href.startsWith('http://www.golfdigest.golf-prod.sports.aws.discovery.com/') ||
    href.startsWith('//www.golfdigest.golf-prod.sports.aws.discovery.com/') ||
    (href.startsWith('/') && !href.startsWith('//')));
}

async function updateLink(el, url, rewrites, err) {
  let href = el.href;
  let hostname = new URL(url).hostname;
  let port = new URL(url).port;
  
  // is this an internal link?
  if (shouldRewriteLink(href)) {
    // console.log(`rewriting ${href} to franklin url`);
    href = href.replace('https:','').replace('http:', '').replace('\/\/www.golfdigest.com', '').replace('\/\/www.golfdigest.golf-prod.sports.aws.discovery.com','');
    let oldPath = href;
    if (!href.startsWith('/content/golfdigest-com/en/')) {
      href = findLongUrlInSitemap(href);
    }
    if (href) {
      href = mapToFranklinPath(href);
      // console.log(`Replacing internal link ${el.href} with ${href}`);
      rewrites.old.push(`${el.href}`);
      rewrites.new.push(`${href}`);
      el.setAttribute('href', href);
    } else {
      let proxyUrl = (port === 80) ? `//${hostname}${oldPath}` : `//${hostname}:${port}${oldPath}`;
      if (hostname === 'localhost') {
        proxyUrl = `http://${proxyUrl}?host=https%3A%2F%2Fwww.golfdigest.golf-prod.sports.aws.discovery.com`;
      } else {
        proxyUrl = `https://${proxyUrl}`;
      }
      const redirect = await getRedirect(proxyUrl);
      if (redirect) {
        // console.log(`${oldPath} redirected to ${redirect}`);
        err.push(`Redirect: [${el.innerHTML}](${el.href}) to ${redirect}`);
        el.setAttribute('href', redirect);
        updateLink(el, url, rewrites, err);
      } else {
        console.warn(`Unable to replace link ${el.href} with Franklin path. Item not found in sitemap.`);
        try {
          href = await fetchLongPath(proxyUrl);
        } catch(error) {
          err.push(`Unble to map: [${el.innerHTML}](${el.href}) ${error.message}`);
          console.warn(`${url}: Unable to map ${el.href} to Franklin path. ${error}`);
          return;
        }
        if (href) {
          href = mapToFranklinPath(href);
          // console.log(`Replacing internal link ${el.href} with ${href}`);
          rewrites.old.push(`${el.href}`);
          rewrites.new.push(`${href}`);
          el.setAttribute('href', href);
        } else {
          console.warn(`${url}: Unable to map ${el.href} Franklin path. Item not found in sitemap or as data-page-path body attribute.`);
          err.push(`Unble to map: [${el.innerHTML}](${el.href})`);
        }
      }
    }
  }
}

async function updateInternalLinks(dom, url, report) {
  const err = [];
  const rewrites = {
    text: [],
    old: [],
    new: []
  };
  const f = async (el) => {
    await updateLink(el, url, rewrites, err);
  };
  const links = dom.querySelectorAll('a');
  for (let el of links) {
    await f(el);
  }
  if (report && rewrites.text.length > 0) {
    report.linkRewritesOld = rewrites.old.join('\n');
    report.linkRewritesNew = rewrites.new.join('\n');
  }
  if (report && err.length > 0) {
    report.linkRewriteErrors = err.join('\n');
  }
}

function getAttributionName(document) {
  let ret = '';
  document.querySelectorAll('.o-Attribution__a-Name').forEach((el) => {
    let val = el.innerHTML.trim();
    const link = el.querySelector('a');
    if (link) {
      val = link.innerHTML.trim();
    }
    if (ret.length === 0) {
      ret = val;
    } else if (!ret.includes(val)) {
      ret = `${ret},${val}`;
    }
  });
  return ret;
}

function getAttributionURL(document) {
  let ret = '';
  document.querySelectorAll('.o-Attribution__a-Name').forEach((el) => {
    let val = '';
    const link = el.querySelector('a');
    if (link) {
      val = link.href;
    }
    if (ret.length === 0) {
      ret = val;
    } else if (!ret.includes(val)) {
      ret = `${ret},${val}`;
    }
  });
  return ret;
}

function getPublicationDate(document) {
  const el = document.querySelector('.o-AssetPublishDate');
  if (el) return el.innerHTML.trim();
  return '';
}

function getRubric(document) {
  const el = document.querySelector('.a-Rubric');
  if (el) {
    const text = el.innerHTML.trim();
    el.remove();
    return text;
  } else {
    // try getting rubric from page meta tag 
    const metaTag = document.querySelector('meta[name="parsely-metadata"]');
    if (metaTag) {
      const val = metaTag.getAttribute('content');
      const json = JSON.parse(val);
      if (json.golfRubric) {
        return json.golfRubric;
      }
    }
  }
  return '';
}

function getOrCreateMetadataBlock(document, main) {
  let metaDataBlock = main.querySelector('.page-metadata');
  if (!metaDataBlock) {
    /* eslint-disable no-undef */
    metaDataBlock = WebImporter.Blocks.getMetadataBlock(document, {});
    metaDataBlock.classList.add('page-metadata');
    main.append(metaDataBlock);
  }
  return metaDataBlock;
}

function appendMetadata(metadata, key, value) {
  const row = `<tr><td>${key}</td><td>${value}</td></tr>`;
  metadata.insertAdjacentHTML('beforeend', row);
}

function appendPageMetadata(document, metadata) {
  /*
  const pageTitle = document.querySelector('title');
  if (pageTitle) {
    appendMetadata(metadata, 'PageTitle', pageTitle.innerHTML);
  }*/

  const metaMatchFilter = ['description', 'keywords', 'news_keywords', 'og:title', 'og:description', 'og:type'];

  document.querySelectorAll('meta').forEach((metaEl) => {
    let key = metaEl.getAttribute('name');
    if (!key) key = metaEl.getAttribute('property');
    const name = metaMatchFilter.find((m) => { if (m.match(key)) { return m; } });
    const value = metaEl.getAttribute('content');
    if (name && value) appendMetadata(metadata, name, value);
  });

  // add og:image
  const ogImageMetaEL = document.querySelector('meta[property="og:image"]');
  if (ogImageMetaEL) {
    const imgPath = ogImageMetaEL.getAttribute('content');
    const imgSrc = (imgPath.includes('.rend.')) ? imgPath.split('.rend.')[0] : imgPath;
    const metaVal = `<img src="${imgSrc}"/>`
    appendMetadata(metadata, "og:image", metaVal);
  }
}

function addEl(main, el) {
  if (el) {
    main.append(el);
  }
}

function createBlockTable(document, main, blockName) {
  const table = document.createElement('table');
  table.innerHTML = `<tr><th colspan="2">${blockName}</th></tr>`;
  main.append(table);
  return table;
}

function replaceEmbed(document, el, url, textEl, main) {
  if (textEl) {
    const embedBlock = createBlockTable(document, main, 'Embed');
    appendToBlock(embedBlock, null, `<a href=${url}>${url}</a>`);
    appendElementToBlock(embedBlock, null, textEl);
    el.insertAdjacentElement('beforebegin', embedBlock);
  } else {
    el.insertAdjacentHTML('beforebegin', `<a href=${url}>${url}</a>`);
  }
  el.remove();
}

function createSectionMetadata(document, main) {
  return createBlockTable(document, main, 'Section Metadata');
}

function appendToBlock(block, key, value) {
  const row = (key) ? `<tr><td>${key}</td><td>${value}</td></tr>` : `<tr><td colspan="2">${value}</td></tr>`;
  block.insertAdjacentHTML('beforeend', row);
}

function appendElementToBlock(block, key, el) {
  const val = (el && el.innerHTML) ? el.innerHTML.trim().replace(/\n/g, '') : '';
  appendToBlock(block, key, val);
}

function copyElementToBlock(block, docEl, selector, blockKey) {
  const el = docEl.querySelector(selector);
  appendElementToBlock(block, blockKey, el);
}

function getGallerySlideImage(slide) {
  const host = 'https://golfdigest.sports.sndimg.com';

  const el = slide.querySelector('.m-ResponsiveImage');
  if (el) {
    const dataAttr = el.getAttribute('data-photo-box-params');
    /* eslint-disable no-console */
    // console.log(`Parsing data attribute '${dataAttr}'`);
    const json = JSON.parse(dataAttr);
    const sourcePath = json.assetId;
    const sourceUrl = `${host}${sourcePath}`;
    const image = document.createElement('img');
    image.setAttribute('src', sourceUrl);
    const div = document.createElement('div');
    div.append(image);
    return div;
  }
}

function isGDPlusArticle(document) {
  const rubricContainer = document.querySelector('.a-Rubric');
  if (rubricContainer) {
    const svgEl = rubricContainer.querySelector('svg');
    if (svgEl) {
      const label = svgEl.getAttribute('aria-label');
      return label === 'GD Plus Logo';
    }
  }
  return false;
}

function getImgName(imgSrc) {
  const parts = imgSrc.split('/');
  return parts[parts.length-1];
}

function fixImg(img) {
  let imgSrc = img.getAttribute('src');
  // remove AEM generated rendition
  imgSrc = (imgSrc.includes('.rend.')) ? imgSrc.split('.rend.')[0] : imgSrc;
  // add protocol and host name if needed.
  if (imgSrc.startsWith('//')) {
    imgSrc = `https:${imgSrc}`;
  } else if (imgSrc.startsWith('/')) {
    imgSrc = `https://golfdigest.sports.sndimg.com${imgSrc}`;
  }
  img.setAttribute('src', imgSrc);
  let altText = img.getAttribute('alt');
  if (!altText || !isNaN(altText)) {
    altText = getImgName(imgSrc);
    img.setAttribute('alt', altText);
  }
  let title = img.getAttribute('title');
  if (!title) {
    title = altText;
    img.setAttribute('title', title);
  }
}

function updateImage(el) {
  const img = (el.tagName === 'IMG') ? el : el.querySelector('img');
  if (img) {
    fixImg(img);
  }
}

function processEmbeds(document, main, container) {
  // Create a section for each image embed with it's own section metadata
  container.querySelectorAll('.imageEmbed').forEach(imageEmbed => {
    const imageEmbedCredit = imageEmbed.querySelector('.o-ImageEmbed__a-Credit');
    const imageEmbedCaption = imageEmbed.querySelector('.o-ImageEmbed__a-Caption');
    if (imageEmbedCredit || imageEmbedCaption) {
      let sectionBlock = createSectionMetadata(document, main);
      if (imageEmbedCredit) {
        let heroImageCreditTxt = (imageEmbedCredit) ? imageEmbedCredit.innerHTML : '';
        if (heroImageCreditTxt.includes('Photo By:')) {
          heroImageCreditTxt = heroImageCreditTxt.replace('Photo By:','').trim();
        }
        imageEmbedCredit.remove();
        appendToBlock(sectionBlock, 'Photo Credit', heroImageCreditTxt);
      }
      if (imageEmbedCaption) {
        const imageEmbedCaptionTxt = (imageEmbedCaption.querySelector('p')) ? imageEmbedCaption.querySelector('p').innerHTML : imageEmbedCaption.innerHTML;
        appendToBlock(sectionBlock, 'Photo Caption', imageEmbedCaptionTxt);
        imageEmbedCaption.remove()
      }
    
      imageEmbed.insertAdjacentHTML('beforebegin', '<hr/>');
      imageEmbed.insertAdjacentElement('afterend', sectionBlock);
      sectionBlock.insertAdjacentHTML('afterend', '<hr/>');
    }
  });

  const tweets = container.querySelectorAll('.tweetEmbed');
  tweets.forEach((tweet) => {
    const embedData = tweet.querySelector('[data-module="tweet-embed"]');
    if (embedData) {
      const tweetURL = embedData.getAttribute('data-tweet-url');
      replaceEmbed(document, tweet, tweetURL);
    }
  });

  container.querySelectorAll('.iframe, .youtubeEmbed').forEach((el) => {
    const frame = el.querySelector('iframe');
    if (frame && frame.src.toLowerCase().includes('youtube.')) {
      const textEl = el.querySelector('.o-StoryFeature__m-TextWrap');
      const src = frame.src;
      if (textEl) {
        replaceEmbed(document, el, src, textEl, main);
      } else {
        replaceEmbed(document, el, src);
      }
    }
  });

  container.querySelectorAll('.brightcoveVideoEmbed').forEach((el) => {
    const videoEl = el.querySelector('video-js');
    const acct = videoEl.getAttribute('data-account');
    const player = videoEl.getAttribute('data-player');
    const videoId = videoEl.getAttribute('data-video-id');
    const playlistId = videoEl.getAttribute('data-playlist-id');
    const param = (videoId) ? `videoId=${videoId}` : `playlistId=${playlistId}`;
    const src = `https://players.brightcove.net/${acct}/${player}_default/index.html?${param}`;
    const textEl = el.querySelector('.o-StoryFeature__m-TextWrap');
    if (textEl) {
      replaceEmbed(document, el, src, textEl, main);
    } else {
      replaceEmbed(document, el, src);
    }
  });

  // Issue https://github.com/headwirecom/helix-sportsmagazine/issues/128
  // replace all other iframes with an embed block
  container.querySelectorAll('.iframe').forEach((el) => {
    const frame = el.querySelector('iframe');
    const url = frame.src;
    const embedBlock = createBlockTable(document, main, 'Embed');
    appendToBlock(embedBlock, null, `<a href=${url}>${url}</a>`);
    el.insertAdjacentElement('beforebegin', embedBlock);
    el.remove();
  });
}

function transformArticleDOM(document, templateConfig) {
  let articleTemplate = templateConfig.template;

  const articleHero = document.querySelector('.o-ArticleHero');
  const imageEmbed = document.querySelector('.o-ImageEmbed');
  const imageEmbedCredit = document.querySelector('.o-ImageEmbed__a-Credit') ? 
      document.querySelector('.o-ImageEmbed__a-Credit') : 
      document.querySelector('.o-ArticleHero .o-ArticleInfo .a-Credit');
  const imageEmbedCaption = document.querySelector('.o-ImageEmbed .o-ImageEmbed__a-Caption');
  const articleTitle = document.querySelector('.o-AssetTitle');
  const articleDescription = document.querySelector('.o-AssetDescription__a-Description');
  const articleBody = document.querySelector('.articleBody');
  const main = document.createElement('main');

  const author = getAttributionName(document);
  const authorURL = getAttributionURL(document);
  const publicationDate = getPublicationDate(document);
  /* eslint-disable no-console */
  // console.log(`Author: ${author}. Publication Date: ${publicationDate}`);

  const isGDPlus = isGDPlusArticle(document);
  let rubric = getRubric(document);
  if (articleHero && !rubric) {
    rubric = getRubric(articleHero);
  }

  if (articleHero) {
    updateImage(articleHero);
    main.append(articleHero);
  } else {
    main.append(articleTitle);
    if (articleDescription) {
      main.append(articleDescription);
    }
    if (imageEmbed) {
      updateImage(imageEmbed);
      main.append(imageEmbed);
    }
  }

  if (imageEmbedCredit || imageEmbedCaption) {
    let sectionBlock = createSectionMetadata(document, main);
    if (imageEmbedCredit) {
      let heroImageCreditTxt = (imageEmbedCredit) ? imageEmbedCredit.innerHTML : '';
      if (heroImageCreditTxt.includes('Photo By:')) {
        heroImageCreditTxt = heroImageCreditTxt.replace('Photo By:','').trim();
      }
      imageEmbedCredit.remove();
      appendToBlock(sectionBlock, 'Photo Credit', heroImageCreditTxt);
    }
    if (imageEmbedCaption) {
      const imageEmbedCaptionTxt = (imageEmbedCaption.querySelector('p')) ? imageEmbedCaption.querySelector('p').innerHTML : imageEmbedCaption.innerHTML;
      appendToBlock(sectionBlock, 'Photo Caption', imageEmbedCaptionTxt);
      imageEmbedCaption.remove()
    }
  }

  main.append(document.createElement('hr'));

  main.append(articleBody);

  if (main.querySelector('.o-ArticleInfo')) {
    main.querySelector('.o-ArticleInfo').remove();
  }

  if (main.querySelector('.o-ArticleHero__a-Info')) {
    main.querySelector('.o-ArticleHero__a-Info').remove();
  }
 
  // reinsert original document section separators
  articleBody.querySelectorAll('.importer-section-separator').forEach(el => { el.replaceWith(document.createElement('hr')); });

  processEmbeds(document, main, articleBody);

  const metadata = getOrCreateMetadataBlock(document, main);
  appendMetadata(metadata, 'Author', author);
  appendMetadata(metadata, 'Author URL', authorURL);
  appendMetadata(metadata, 'Publication Date', publicationDate);
  appendMetadata(metadata, 'template', articleTemplate);
  appendMetadata(metadata, 'category', templateConfig.category);
  appendMetadata(metadata, 'Rubric', rubric);

  if (isGDPlus) {
    appendMetadata(metadata, 'GD Plus', 'yes');
  }

  appendPageMetadata(document, metadata);
  return {
    element: main,
    report: {
      title: document.title,
    },
  };
}

function galleryUpdateToOriginalRendition(media) {
  const img = (media.tagName === 'IMG') ? media : media.querySelector('img');
  let imgSrc = img.getAttribute('src');
  imgSrc = (imgSrc.includes('.rend.')) ? imgSrc.split('.rend.')[0] : imgSrc;
  img.setAttribute('src', imgSrc);
}

function isGif(media) {
  const img = (media.tagName === 'IMG') ? media : media.querySelector('img');
  let imgSrc = img.getAttribute('src');
  // console.log(`Checking if ${imgSrc} is a GIF`);
  return (imgSrc && imgSrc.toLowerCase().endsWith('.gif'));
}

function transformGalleryDOM(document, templateConfig) {
  const main = document.createElement('main');
  const assetTitle = document.querySelector('.assetTitle');
  const isGDPlus = isGDPlusArticle(document);

  let articleTemplate = templateConfig.template;
  let gifCount = 0;

  addEl(main, assetTitle);
  addEl(main, document.querySelector('.gallery-lead'));
  addEl(main, document.querySelector('.o-Article__m-Description'));
  addEl(main, document.querySelector('.assetDescription'));

  main.insertAdjacentHTML('beforeend', '<hr/>');
  
  const gallery = document.querySelector('.photoGalleryPromo');
  if (gallery) {
    const postcards = gallery.querySelector('.photocards');
    const slides = gallery.querySelectorAll('.m-Slide');
    const totalSlides = slides.length;
    let slideCount = 0;
    if (postcards) {
      slides.forEach((slide) => {
        const promoCredit = slide.querySelector('.o-PhotoGalleryPromo__a-Credit');
        const promoHeadline = slide.querySelector('.o-PhotoGalleryPromo__a-HeadlineText');
        const attribution = slide.querySelector('.o-Attribution');
        let media = slide.querySelector('.m-MediaBlock__a-Image');

        // import original image
        galleryUpdateToOriginalRendition(media);

        if (isGif(media)) {
          gifCount += 1;
        }
        addEl(main, media);
        addEl(main, slide.querySelector('.m-MediaBlock__m-TextWrap'));

        let block = createSectionMetadata(document, main);
        let hasMetadata = false;

        if (promoCredit && promoCredit.innerHTML && promoCredit.innerHTML.trim().length > 0) {
          appendToBlock(block, 'Photo Credit', promoCredit.innerHTML);
          promoCredit.remove();
          hasMetadata = true;
        }

        if (promoHeadline) {
          appendToBlock(block, 'Promo Headline', promoHeadline.innerHTML);
          promoHeadline.remove();
          hasMetadata = true;
        }

        if (attribution) {
          attribution.remove();
          hasMetadata = true;
        }

        if (!hasMetadata) {
          block.remove();
        }
        
        if (slideCount < totalSlides-1) {
          main.insertAdjacentHTML('beforeend', '<hr/>');
        }
        slideCount += 1;
      });
    } else {
      const slideInfos = gallery.querySelectorAll('.asset-info');
      slides.forEach((slide) => {
        let media = getGallerySlideImage(slide);

        // import original image
        galleryUpdateToOriginalRendition(media);

        if (isGif(media)) {
          gifCount += 1;
        }
        main.insertAdjacentHTML('beforeend', media.innerHTML);

        if (slideCount < slideInfos.length) {
          const slideInfo = slideInfos.item(slideCount);
          main.append(slideInfo);
          
          let block = createSectionMetadata(document, main);
          let hasMetadata = false;

          const promoHeadline = slideInfo.querySelector('.o-PhotoGalleryPromo__a-HeadlineText');
          if (promoHeadline && promoHeadline.innerHTML) {
            appendElementToBlock(block, 'Promo Headline', promoHeadline);
            promoHeadline.remove();
            hasMetadata = true;
          }

          const photoCredit = slideInfo.querySelector('.o-Attribution');
          if (photoCredit) {
            let name = photoCredit.innerHTML.trim().substring('Photo By: Photo by '.length).trim();
            appendToBlock(block, 'Photo Credit', name);
            photoCredit.remove();
            hasMetadata = true;
          }

          if (!hasMetadata) {
            block.remove();
          }
        }

        if (slideCount < totalSlides-1) {
          main.insertAdjacentHTML('beforeend', '<hr/>');
        }
        slideCount += 1;
      });
    }
  }

  const author = getAttributionName(document);
  const authorURL = getAttributionURL(document);
  const publicationDate = getPublicationDate(document);
  const rubric = getRubric(document);

  const metadata = getOrCreateMetadataBlock(document, main);

  appendMetadata(metadata, 'Author', author);
  appendMetadata(metadata, 'Author URL', authorURL);
  appendMetadata(metadata, 'Publication Date', publicationDate);
  if (rubric) {
    appendMetadata(metadata, 'Rubric', rubric);
  }

  if (isGDPlus) {
    appendMetadata(metadata, 'GD Plus', 'yes');
  }

  appendMetadata(metadata, 'og:type', 'gallery');
  appendMetadata(metadata, 'template', articleTemplate);
  appendMetadata(metadata, 'category', templateConfig.category);
  appendPageMetadata(document, metadata);
  return {
    element: main,
    report: {
      title: document.title,
      gifCount,
    },
  };
}

function transformProductDOM(document, templateConfig) {
  const main = document.createElement('main');
  const productContent = document.querySelectorAll('.main .o-GolfClubReviewContent');

  let sectionCount = 0;
  productContent.forEach((el) => {
    main.append(el);
    const media = el.querySelector('.o-GolfClubReviewContent__m-MediaWrap');
    if (media)  {
      el.querySelector('.productTitle').insertAdjacentElement('afterend', media);
    }
    const block = createSectionMetadata(document, main);
    copyElementToBlock(block, el, '.brand', 'Brand');
    copyElementToBlock(block, el, '.price', 'Price');
    copyElementToBlock(block, el, '.a-Advertiser', 'Advertiser');
    copyElementToBlock(block, el, '.o-GolfClubReviewContent__m-TextWrap__a-Disclaimer', 'Disclaimer');
    WebImporter.DOMUtils.remove(el, ['.brand', '.o-GolfClubReviewContent__m-TextWrap__a-StreetPrice', '.o-GolfClubReviewContent__m-TextWrap__a-Disclaimer']);
    sectionCount += 1;
    if (sectionCount < productContent.length) {
      main.append('hr');
    }
  });

  const metadata = getOrCreateMetadataBlock(document, main);
  appendMetadata(metadata, 'og:type', 'product');
  appendMetadata(metadata, 'template', templateConfig.template);
  appendMetadata(metadata, 'category', templateConfig.category);
  appendPageMetadata(document, metadata);
  return {
    element: main,
    report: {
      title: document.title,
    },
  };
}

function transformClubListingDOM(document, templateConfig) {
  const main = document.createElement('main');
  const content = document.querySelector('.article-content');
  main.append(content);

  content.querySelectorAll('.brightcoveVideoEmbed').forEach((el) => {
    const videoEl = el.querySelector('video-js');
    const acct = videoEl.getAttribute('data-account');
    const player = videoEl.getAttribute('data-player');
    const videoId = videoEl.getAttribute('data-video-id');
    const playlistId = videoEl.getAttribute('data-playlist-id');
    const param = (videoId) ? `videoId=${videoId}` : `playlistId=${playlistId}`;
    const src = `https://players.brightcove.net/${acct}/${player}_default/index.html?${param}`;
    const textEl = el.querySelector('.o-StoryFeature__m-TextWrap');
    if (textEl) {
      replaceEmbed(document, el, src, textEl, main);
    } else {
      replaceEmbed(document, el, src);
    }
  });
  // main.innerHTML = document.querySelector('.main').innerHTML;

  const metadata = getOrCreateMetadataBlock(document, main);
  appendMetadata(metadata, 'og:type', 'product');
  appendMetadata(metadata, 'template', templateConfig.template);
  appendMetadata(metadata, 'category', templateConfig.category);
  appendPageMetadata(document, metadata);
  return {
    element: main,
    report: {
      title: document.title,
    },
  };
}

function mapToDocumentPath(document, url) {
  let franklinPath = null;
  let contentPath = document.body.getAttribute('data-page-path');
  if (contentPath) {
    franklinPath = mapToFranklinPath(contentPath);
  } else {
    franklinPath = mapToFranklinPath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''));
  }
  return franklinPath;
}

const TRANSFORM_CONFIG = {
  FullBleed: { template: 'Full Bleed', selector: ".articlePage .area .o-ArticleHero", category: "article", transformer: transformArticleDOM },
  Default: { template: 'Default Article', selector: ".articlePage .article-content .content-well", category: "article", transformer: transformArticleDOM },
  LongForm: { template: 'Long Form', selector: ".longformPage", category: "article", transformer: transformArticleDOM },
  OpenArticle: { template: 'Open Article', selector: ".openArticlePage",category: "article", transformer: transformArticleDOM },
  LiveStream: { template: 'Live Stream', selector: ".liveStreamArticlePage", category: "article", transformer: transformArticleDOM },
  Gallery: { template: 'Gallery', selector: ".slideshow-wrapper", category: "gallery", transformer: transformGalleryDOM },
  GalleryListicle: { template: 'Gallery Listicle', selector: ".photocards", category: "gallery", transformer: transformGalleryDOM },
  ProductListing: { template: 'Product Listing', selector: ".productListingPage", category: "product", transformer: transformProductDOM },
  ClubListing: { template: 'Club Listing', selector: '.clubListingPage', category: 'clublisting', transformer: transformClubListingDOM }
};

function findTemplateConfig(document) {
  return Object.values(TRANSFORM_CONFIG).find((conf) => document.querySelector(conf.selector));
}

function isArticle(document) {
  const templateConfig = findTemplateConfig(document);
  return templateConfig !== undefined && templateConfig.transformer === transformArticleDOM;
}

function fixBoldText(document) {
  // Issue #107
  // empty <span> tags inside <b> break bold text in markdown and word docs
  // move them outside
  document.querySelectorAll('b').forEach(boldEl => {
    boldEl.querySelectorAll('span').forEach(el => {
      if((!el.innerHTML || el.innerHTML.trim().length === 0) && (!el.innerText || el.innerText.trim().length === 0)) {
        boldEl.insertAdjacentElement('afterend', el);
      }
    });

    // Issue #23
    // also move the last <br/> after closing tag
    while (boldEl.lastElementChild && boldEl.lastElementChild === boldEl.lastChild && boldEl.lastElementChild.tagName === 'BR') {
      let el = boldEl.lastElementChild;
      boldEl.insertAdjacentElement('afterend', el);
    }
  });
}

function fixBrInsideLinks(document) {
  document.querySelectorAll('a').forEach(link => {
    link.querySelectorAll('br').forEach(nl => {
      link.insertAdjacentElement('afterend', nl);
    });
  });
}

function fixImages(document) {
  document.querySelectorAll('img').forEach((img) => {
    fixImg(img);
  });
}

function applyMarkupFixes(document) {
  fixBoldText(document);
  fixBrInsideLinks(document);
  fixImages(document);
}

async function trasformDOM(document, url, documentPath) {
  const templateConfig = findTemplateConfig(document);

  let retObj = {
    report: {
      title: document.title,
      status: 'Error: unknown page type',
      bodyClass: document.querySelector('body').classList,
    },
  };

  if (templateConfig) {
    applyMarkupFixes(document);
    retObj = templateConfig.transformer(document, templateConfig);
    await updateInternalLinks(retObj.element, url, retObj.report);

    const metadata = getOrCreateMetadataBlock(document, retObj.element);
    appendMetadata(metadata, 'path', documentPath);
  } else {
    const bodyClass = document.querySelector('body').getAttribute('class');
    throw new Error(`Unknown page type. Body class list ${bodyClass}`);
  }

  return retObj;
}

function preprocess({ document, url, html, params }) {
  if (isArticle(document)) {
    // For articles keep hr tags as section separators.
    // These are removed by importer preprocessing step. So, use temporary div tags.
    document.querySelectorAll('hr').forEach(el => { 
      const tmpEl = document.createElement('div');
      tmpEl.classList.add('importer-section-separator');
      el.replaceWith(tmpEl);
    });
  }
}

/**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
async function transform({document, url, html, params}) {
  const docPath = mapToDocumentPath(document, url);
  const retObj = await trasformDOM(document, url, docPath);
  return [{
    element: retObj.element,
    path: docPath,
    report: retObj.report,
  }];
}

// export compatible with node
export {
  preprocess,
  transform
}

// export compatible with browser but breaks with node
export default {
  preprocess: preprocess,
  transform: transform
}