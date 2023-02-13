const articleStyles = {
  Default:"DefaultArticle",
  FullBleed:"FullBleed",
  LongForm:"LongForm",
  OpenArticle:"OpenArticle",
  LiveStream:"LiveStream",
  Gallery:"Gallery",
  GalleryListicle: "Gallery Listicle",
  ProductListing: "Product Listing"
};

function replaceEmbed(el, url) {
  el.insertAdjacentHTML('beforebegin', `<a href=${url}>${url}</a>`);
  el.remove();
}

function getAttributionName(document) {
  const el = document.querySelector('.o-Attribution__a-Name');
  if (el) return el.querySelector('a').innerHTML.trim();
  return '';
}

function getAttributionURL(document) {
  const el = document.querySelector('.o-Attribution__a-Name');
  if (el) return el.querySelector('a').href;
  return '';
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
  const block = WebImporter.Blocks.getMetadataBlock(document, {});
  main.append(block);
  return block;
}

function appendMetadata(metadata, key, value) {
  const row = `<tr><td>${key}</td><td>${value}</td></tr>`;
  metadata.insertAdjacentHTML('beforeend', row);
}

function addEl(main, el) {
  if (el) {
    main.append(el);
  }
}

function transformArticleDOM(document) {
  const articleHero = document.querySelector('.o-ArticleHero');
  const imageEmbed = document.querySelector('.o-ImageEmbed');
  const imageEmbedCredit = document.querySelector('.o-ImageEmbed__a-Credit');
  const articleTitle = document.querySelector('.o-AssetTitle');
  const articleBody = document.querySelector('.articleBody');
  const main = document.createElement('main');
  
  let articleStyle = articleStyles.Default;

  if (articleHero) {
    articleStyle = articleStyles.FullBleed;
    main.append(articleHero);
  } else {
    main.append(articleTitle);
    if(imageEmbed) {
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

  articleBody.querySelectorAll('.iframe').forEach(el => {
    const frame = el.querySelector('iframe');
    if(frame && frame.src.toLowerCase().includes('youtube.')) {
      replaceEmbed(el, frame.src);
    }
  });

  articleBody.querySelectorAll('.brightcoveVideoEmbed').forEach(el => {
    const videoEl = el.querySelector('video-js');
    const acct = videoEl.getAttribute('data-account');
    const player = videoEl.getAttribute('data-player');
    const videoId = videoEl.getAttribute('data-video-id');
    const src = `https://players.brightcove.net/${acct}/${player}_default/index.html?videoId=${videoId}`;
    replaceEmbed(el,src);
  });

  const author = getAttributionName(document);
  const authorURL = getAttributionURL(document);
  const publicationDate = getPublicationDate(document);
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
  appendMetadata(metadata, "Article Style", articleStyle);
  appendMetadata(metadata, 'Rubric', rubric);
  if (imageEmbedCredit) {
    appendMetadata(metadata, 'Image Credit', imageEmbedCredit.innerHTML);
    imageEmbedCredit.remove();
  }

  if (articleHero) {
    const heroImageCredit = articleHero.querySelector('.o-ImageEmbed__a-Credit');
    const heroImageCreditTxt = (heroImageCredit) ? heroImageCredit.innerHTML : '';
    if (heroImageCredit) heroImageCredit.remove();
    appendMetadata(metadata, "Image Credit", heroImageCreditTxt);
  }

  const metaMatchFilter = [ 'msapplication-TileColor', 'msapplication-TileImage', 'keywords', 'news_keywords', 
                      'fb:app_id', 'fb:admins', 'twitter:domain', 'og:type', 'og:site_name', 'parsely-metadata',
                      'tp:initialize', 'tp:PreferredRuntimes', 'fb:app_id' ];
  document.querySelectorAll('meta').forEach(metaEl => {
    let key = metaEl.getAttribute('name');
    if (!key) key = metaEl.getAttribute('property');
    let name = metaMatchFilter.find((m) => { if (m.match(key)) { return m } } );
    let value = metaEl.getAttribute('content');
    if (name && value) appendMetadata(metadata, name, value);
  });
  return main;
}

function transformGalleryDOM(document) {
  const main = document.createElement('main');
  const assetTitle = document.querySelector('.assetTitle');
  const articleBody = document.querySelector('.articleBody');
  const gallery = document.querySelector('.photoGalleryPromo');

  let articleStyle = articleStyles.Gallery;

  addEl(main, assetTitle);
  addEl(main, articleBody);

  // addEl(main, gallery);
  if (gallery) {
    let postcards = gallery.querySelector('.photocards');
    if (postcards) {
      articleStyle = articleStyles.GalleryListicle; 
      gallery.querySelectorAll('.m-Slide').forEach(slide => {
        let block = createBlockTable(document, main, 'GalleryImage');
        let media = slide.querySelector('.m-MediaBlock__m-MediaWrap');
        appendElementToBlock(block, 'Image', media);

        let promoCredit = slide.querySelector('.o-PhotoGalleryPromo__a-Credit');
        appendElementToBlock(block, 'Promo Credit', promoCredit);

        let promoHeadline = slide.querySelector('.o-PhotoGalleryPromo__a-HeadlineText');
        appendElementToBlock(block, 'Promo Headline', promoHeadline);

        let promoDescription = slide.querySelector('.o-PhotoGalleryPromo__a-Description');
        appendElementToBlock(block, 'Promo Description', promoDescription);

        let attribution = slide.querySelector('.o-Attribution');
        appendElementToBlock(block, 'Attribution', attribution);
      });
    } else {
      let slideInfos = gallery.querySelectorAll('.asset-info');
      let blockCount = 0;
      gallery.querySelectorAll('.m-Slide').forEach(slide => {
        let block = createBlockTable(document, main, 'GalleryImage');
        // let media = slide.querySelector('.share-frame');
        // alert(slide.innerHTML);
        let media = getImage(slide);
        appendElementToBlock(block, 'Image', media)

        if (blockCount < slideInfos.length) {
          let slideInfo = slideInfos.item(blockCount);
          let promoHeadline = slideInfo.querySelector('.o-PhotoGalleryPromo__a-HeadlineText');
          appendElementToBlock(block, 'Promo Headline', promoHeadline);

          let promoDescription = slideInfo.querySelector('.o-PhotoGalleryPromo__a-Description');
          appendElementToBlock(block, 'Promo Description', promoDescription);
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
  appendMetadata(metadata, 'Article Style', articleStyle);

  const metaMatchFilter = [ 'msapplication-TileColor', 'msapplication-TileImage', 'keywords', 'news_keywords', 
                      'fb:app_id', 'fb:admins', 'twitter:domain', 'og:type', 'og:site_name', 'parsely-metadata',
                      'tp:initialize', 'tp:PreferredRuntimes', 'fb:app_id' ];

  document.querySelectorAll('meta').forEach(metaEl => {
    let key = metaEl.getAttribute('name');
    if (!key) key = metaEl.getAttribute('property');
    let name = metaMatchFilter.find((m) => { if (m.match(key)) { return m } } );
    let value = metaEl.getAttribute('content');
    if (name && value) appendMetadata(metadata, name, value);
  });

  return main;
}

function transformProductDOM(document) {
  const main = document.createElement('main');
  const productContent = document.querySelector('.main');
  const refList = productContent.querySelector('.referenceList');
  if (refList) {
    refList.parentElement.remove();
  }
  main.append(productContent);

  const metadata = createMetadataBlock(document, main);
  appendMetadata(metadata, 'og:type', 'product');
  appendMetadata(metadata, 'Article Style', articleStyles.ProductListing);

  const metaMatchFilter = [ 'msapplication-TileColor', 'msapplication-TileImage', 'keywords', 'news_keywords', 
                      'fb:app_id', 'fb:admins', 'twitter:domain', 'og:type', 'og:site_name', 'parsely-metadata',
                      'tp:initialize', 'tp:PreferredRuntimes', 'fb:app_id' ];

  document.querySelectorAll('meta').forEach(metaEl => {
    let key = metaEl.getAttribute('name');
    if (!key) key = metaEl.getAttribute('property');
    let name = metaMatchFilter.find((m) => { if (m.match(key)) { return m } } );
    let value = metaEl.getAttribute('content');
    if (name && value) appendMetadata(metadata, name, value);
  });

  return main;
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
    transformDOM: ({
      // eslint-disable-next-line no-unused-vars
      document, url, html, params,
    }) => {
      
      const pageClass = document.body.getAttribute('class');

      let main = document.querySelector('.main');
      
      if(pageClass === 'articlePage') {
        main = transformArticleDOM(document);
      } else if(pageClass === 'photoGalleryPromo') {
        main = transformGalleryDOM(document);
      } else if(pageClass === 'productListingPage') {
        main = transformProductDOM(document);
      }

      return main;
    },
  
    /**
     * Return a path that describes the document being transformed (file name, nesting...).
     * The path is then used to create the corresponding Word document.
     * @param {HTMLDocument} document The document
     * @param {string} url The url of the page imported
     * @param {string} html The raw html (the document is cleaned up during preprocessing)
     * @param {object} params Object containing some parameters given by the import process.
     * @return {string} The path
     */
    generateDocumentPath: ({
      // eslint-disable-next-line no-unused-vars
      document, url, html, params,
    }) => {
      let contentPath = document.body.getAttribute('data-page-path');
      if (contentPath) {
        return contentPath.replace(/\/content\/golfdigest-com\/en/, '');
      }
      return new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '').replace(/\/content\/golfdigest-com\/en/, '');
    },
  };