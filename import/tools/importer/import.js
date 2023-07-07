const articleTemplates = {
  Default: 'Default Article',
  FullBleed: 'Full Bleed',
  LongForm: 'Long Form',
  OpenArticle: 'Open Article',
  LiveStream: 'Live Stream',
  Gallery: 'Gallery',
  GalleryListicle: 'Gallery Listicle',
  ProductListing: 'Product Listing',
};

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
    } else {
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
    } else {
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
  }
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
  const pageTitle = document.querySelector('title');
  if (pageTitle) {
    appendMetadata(metadata, 'PageTitle', pageTitle.innerHTML);
  }

  const metaMatchFilter = ['msapplication-TileColor', 'msapplication-TileImage', 'keywords', 'news_keywords',
    'fb:app_id', 'fb:admins', 'twitter:domain', 'og:title', 'og:type', 'og:site_name', 'parsely-metadata',
    'tp:initialize', 'tp:PreferredRuntimes', 'fb:app_id'];

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
    console.log(`Parsing data attribute '${dataAttr}'`);
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

function transformArticleDOM(document) {
  const articleHero = document.querySelector('.o-ArticleHero');
  const imageEmbed = document.querySelector('.o-ImageEmbed');
  const imageEmbedCredit = document.querySelector('.o-ImageEmbed__a-Credit');
  const articleTitle = document.querySelector('.o-AssetTitle');
  const articleBody = document.querySelector('.articleBody');
  const main = document.createElement('main');

  let articleTemplate = articleTemplates.Default;

  if (articleHero) {
    articleTemplate = articleTemplates.FullBleed;
    main.append(articleHero);
  } else {
    main.append(articleTitle);
    if (imageEmbed) {
      main.append(imageEmbed);
    }
  }
  main.append(articleBody);

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

  const author = getAttributionName(document);
  const authorURL = getAttributionURL(document);
  const publicationDate = getPublicationDate(document);
  /* eslint-disable no-console */
  console.log(`Author: ${author}. Publication Date: ${publicationDate}`);

  let rubric = getRubric(document);
  if (articleHero && !rubric) {
    rubric = getRubric(articleHero);
  }

  // const metadataBlock = WebImporter.Blocks.getMetadataBlock(document, {});
  // alert(metadataBlock.outerHTML);
  const metadata = createMetadataBlock(document, main);
  appendMetadata(metadata, 'Author', author);
  appendMetadata(metadata, 'Author URL', authorURL);
  appendMetadata(metadata, 'Publication Date', publicationDate);
  appendMetadata(metadata, 'template', articleTemplate);
  appendMetadata(metadata, 'Rubric', rubric);
  if (imageEmbedCredit) {
    appendMetadata(metadata, 'Image Credit', imageEmbedCredit.innerHTML);
    imageEmbedCredit.remove();
  }

  if (articleHero) {
    const heroImageCredit = articleHero.querySelector('.o-ImageEmbed__a-Credit');
    const heroImageCreditTxt = (heroImageCredit) ? heroImageCredit.innerHTML : '';
    if (heroImageCredit) heroImageCredit.remove();
    appendMetadata(metadata, 'Image Credit', heroImageCreditTxt);
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
  const img = media.querySelector('img');
  let imgSrc = img.getAttribute('src');
  imgSrc = (imgSrc.includes('.rend.')) ? imgSrc.split('.rend.')[0] : imgSrc;
  img.setAttribute('src', imgSrc);
}

function isGif(media) {
  const img = media.querySelector('img');
  let imgSrc = img.getAttribute('src');
  console.log(`Checking if ${imgSrc} is a GIF`);
  return (imgSrc && imgSrc.toLowerCase().endsWith('.gif'));
}

function transformGalleryDOM(document) {
  const main = document.createElement('main');
  const assetTitle = document.querySelector('.assetTitle');
  const articleBody = document.querySelector('.articleBody');
  const gallery = document.querySelector('.photoGalleryPromo');

  let articleTemplate = articleTemplates.Gallery;
  let gifCount = 0;

  addEl(main, assetTitle);
  addEl(main, articleBody);

  // addEl(main, gallery);
  if (gallery) {
    const postcards = gallery.querySelector('.photocards');
    if (postcards) {
      articleTemplate = articleTemplates.GalleryListicle;
      gallery.querySelectorAll('.m-Slide').forEach((slide) => {
        let block = createBlockTable(document, main, 'GalleryImage');
        let media = slide.querySelector('.m-MediaBlock__m-MediaWrap');

        // import original image
        galleryUpdateToOriginalRendition(media);

        if (isGif(media)) {
          gifCount += 1;
        }

        appendElementToBlock(block, 'Image', media);

        const promoCredit = slide.querySelector('.o-PhotoGalleryPromo__a-Credit');
        appendElementToBlock(block, 'Promo Credit', promoCredit);

        const promoHeadline = slide.querySelector('.o-PhotoGalleryPromo__a-HeadlineText');
        if (promoHeadline) {
          appendElementToBlock(block, 'Promo Headline', promoHeadline);
        }

        const promoDescription = slide.querySelector('.o-PhotoGalleryPromo__a-Description');
        appendElementToBlock(block, 'Promo Description', promoDescription);

        const attribution = slide.querySelector('.o-Attribution');
        appendElementToBlock(block, 'Attribution', attribution);
      });
    } else {
      const slideInfos = gallery.querySelectorAll('.asset-info');
      let blockCount = 0;
      gallery.querySelectorAll('.m-Slide').forEach((slide) => {
        const block = createBlockTable(document, main, 'GalleryImage');
        const photoCredit = slide.querySelector('.pv-photo-credit');
        // let media = slide.querySelector('.share-frame');
        let media = getGallerySlideImage(slide);

        // import original image
        galleryUpdateToOriginalRendition(media);

        if (isGif(media)) {
          gifCount += 1;
        }

        appendElementToBlock(block, 'Image', media);

        if (blockCount < slideInfos.length) {
          const slideInfo = slideInfos.item(blockCount);
          const promoHeadline = slideInfo.querySelector('.o-PhotoGalleryPromo__a-HeadlineText');
          if (promoHeadline) {
            appendElementToBlock(block, 'Promo Headline', promoHeadline);
          }

          const promoDescription = slideInfo.querySelector('.o-PhotoGalleryPromo__a-Description');
          appendElementToBlock(block, 'Promo Description', promoDescription);
        }

        if (photoCredit) {
          let name = photoCredit.innerHTML.trim().substring('Photo By: Photo by '.length).trim();
          appendToBlock(block, 'Photo Credit', name);
        }
        blockCount++;
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
  appendPageMetadata(document, metadata);
  return {
    element: main,
    report: {
      title: document.title,
      gifCount,
    },
  };
}

function transformProductDOM(document) {
  const main = document.createElement('main');
  const productContent = document.querySelector('.main');

  productContent.querySelectorAll('.o-GolfClubReviewContent').forEach((el) => {
    const block = createBlockTable(document, main, 'ProductListing');
    copyElementToBlock(block, el, '.brand', 'Brand');
    copyElementToBlock(block, el, '.productTitle', 'Title');
    copyElementToBlock(block, el, '.o-GolfClubReviewContent__m-TextWrap__a-Description', 'Description');
    copyElementToBlock(block, el, '.price', 'Price');
    copyElementToBlock(block, el, '.a-Advertiser', 'Advertiser');
    copyElementToBlock(block, el, '.m-LinkContainer', 'Links');
    copyElementToBlock(block, el, '.o-GolfClubReviewContent__m-TextWrap__a-Disclaimer', 'Disclaimer');
    copyElementToBlock(block, el, '.o-GolfClubReviewContent__m-MediaWrap', 'Image');
  });

  /*
  const refList = productContent.querySelector('.referenceList');
  if (refList) {
    refList.parentElement.remove();
  }
  main.append(productContent);
  */
  const metadata = createMetadataBlock(document, main);
  appendMetadata(metadata, 'og:type', 'product');
  appendMetadata(metadata, 'template', articleTemplates.ProductListing);
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

export default {
  /**
     * Apply DOM operations to the provided document and return
     * the root element to be then transformed to Markdown.
     * @param {HTMLDocument} document The document
     * @param {string} url The url of the page imported
     * @param {string} html The raw html (the document is cleaned up during preprocessing)
     * @param {object} params Object containing some parameters given by the import process.
     * @returns {HTMLElement} The root element to be transformed
     */
  transform: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const pageClass = document.body.getAttribute('class');
    const docPath = mapToDocumentPath(document, url);

    let main = document.querySelector('.main');

    let retObj = {
      element: main,
      report: {
        title: document.title,
      },
    };

    if (pageClass === 'articlePage') {
      retObj = transformArticleDOM(document);
    } else if (pageClass === 'photoGalleryPromo' || pageClass === 'photoGalleryPage') {
      retObj = transformGalleryDOM(document);
    } else if (pageClass === 'productListingPage') {
      retObj = transformProductDOM(document);
    }

    return [{
      element: retObj.element,
      path: docPath,
      report: retObj.report,
    }];
  },
};
