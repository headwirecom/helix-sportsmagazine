"use strict";

function replaceEmbed(el, url) {
  el.insertAdjacentHTML('beforebegin', `<a href=${url}>${url}</a>`);
  el.remove();
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

function createMetadataBlock(document, main) {
  /* eslint-disable no-undef */
  const block = WebImporter.Blocks.getMetadataBlock(document, {});
  main.append(block);
  return block;
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

function createSectionMetadata(document, main) {
  return createBlockTable(document, main, 'Section Metadata');
}

function appendToBlock(block, key, value) {
  const row = `<tr><td>${key}</td><td>${value}</td></tr>`;
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

function transformArticleDOM(document, templateConfig) {
  let articleTemplate = templateConfig.template;

  const articleHero = document.querySelector('.o-ArticleHero');
  const imageEmbed = document.querySelector('.o-ImageEmbed');
  const imageEmbedCredit = document.querySelector('.o-ImageEmbed__a-Credit');
  const articleTitle = document.querySelector('.o-AssetTitle');
  const articleDescription = document.querySelector('.o-AssetDescription__a-Description');
  const articleBody = document.querySelector('.articleBody');
  const main = document.createElement('main');

  const author = getAttributionName(document);
  const authorURL = getAttributionURL(document);
  const publicationDate = getPublicationDate(document);
  /* eslint-disable no-console */
  // console.log(`Author: ${author}. Publication Date: ${publicationDate}`);

  let rubric = getRubric(document);
  if (articleHero && !rubric) {
    rubric = getRubric(articleHero);
  }

  if (articleHero) {
    main.append(articleHero);
  } else {
    main.append(articleTitle);
    if (articleDescription) {
      main.append(articleDescription);
    }
    if (imageEmbed) {
      main.append(imageEmbed);
    }
  }

  if (imageEmbedCredit) {
    const heroImageCreditTxt = (imageEmbedCredit) ? imageEmbedCredit.innerHTML : '';
    imageEmbedCredit.remove();
    let sectionBlock = createSectionMetadata(document, main);
    appendToBlock(sectionBlock, 'Image Credit', heroImageCreditTxt);
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

  const tweets = articleBody.querySelectorAll('.tweetEmbed');
  tweets.forEach((tweet) => {
    const embedData = tweet.querySelector('[data-module="tweet-embed"]');
    if (embedData) {
      const tweetURL = embedData.getAttribute('data-tweet-url');
      replaceEmbed(tweet, tweetURL);
    }
  });

  articleBody.querySelectorAll('.iframe').forEach((el) => {
    const frame = el.querySelector('iframe');
    if (frame && frame.src.toLowerCase().includes('youtube.')) {
      replaceEmbed(el, frame.src);
    }
  });

  articleBody.querySelectorAll('.brightcoveVideoEmbed').forEach((el) => {
    const videoEl = el.querySelector('video-js');
    const acct = videoEl.getAttribute('data-account');
    const player = videoEl.getAttribute('data-player');
    const videoId = videoEl.getAttribute('data-video-id');
    const src = `https://players.brightcove.net/${acct}/${player}_default/index.html?videoId=${videoId}`;
    replaceEmbed(el, src);
  });

  const metadata = createMetadataBlock(document, main);
  appendMetadata(metadata, 'Author', author);
  appendMetadata(metadata, 'Author URL', authorURL);
  appendMetadata(metadata, 'Publication Date', publicationDate);
  appendMetadata(metadata, 'template', articleTemplate);
  appendMetadata(metadata, 'category', templateConfig.category);
  appendMetadata(metadata, 'Rubric', rubric);

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

  const metadata = createMetadataBlock(document, main);

  appendMetadata(metadata, 'Author', author);
  appendMetadata(metadata, 'Author URL', authorURL);
  appendMetadata(metadata, 'Publication Date', publicationDate);
  if (rubric) {
    appendMetadata(metadata, 'Rubric', rubric);
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

  const metadata = createMetadataBlock(document, main);
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
  let contentPath = document.body.getAttribute('data-page-path');
  if (contentPath) {
    return contentPath.replace(/\/content\/golfdigest-com\/en/, '');
  }
  return new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '').replace(/\/content\/golfdigest-com\/en/, '');
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
  });
}

function trasformDOM(document) {
  const templateConfig = findTemplateConfig(document);

  let retObj = {
    report: {
      title: document.title,
      status: 'Error: unknown page type',
      bodyClass: document.querySelector('body').classList,
    },
  };

  if (templateConfig) {
    fixBoldText(document);
    retObj = templateConfig.transformer(document, templateConfig);
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
function transform({document, url, html, params}) {
  const docPath = mapToDocumentPath(document, url);
  const retObj = trasformDOM(document);
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