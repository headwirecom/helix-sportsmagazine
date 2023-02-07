const articleStyles = {
  Default:"DefaultArticle",
  FullBleed:"FullBleed",
  LongForm:"LongForm",
  OpenArticle:"OpenArticle",
  LiveStream:"LiveStream"
};

function replaceEmbed(el, url) {
  el.insertAdjacentHTML('beforebegin', `<a href=${url}>${url}</a>`);
  el.remove();
}

function getAttributionName(document) {
  let ret = '';
  document.querySelectorAll('.o-Attribution__a-Name').forEach(el => {
    let val = el.innerHTML.trim();
    let link = el.querySelector('a');
    if (link) {
      val = link.innerHTML.trim();
    }
    if (ret.length === 0) {
      ret = val;
    } else {
      ret = ret + ',' + val;
    }
  });
  return ret;
}

function getAttributionURL(document) {
  let ret = '';
  document.querySelectorAll('.o-Attribution__a-Name').forEach(el => {
    let val = '';
    let link = el.querySelector('a');
    if (link) {
      val = link.href;
    }
    if (ret.length === 0) {
      ret = val;
    } else {
      ret = ret + ',' + val;
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
  const val = (el) ? el.innerHTML : '';
  appendToBlock(block, key, val);
}

function appendToValueBlock(block, value) {
  const row = `<tr><td>${value}</td></tr>`;
  block.insertAdjacentHTML('beforeend', row);
}

function createMetadataBlock(document, main) {
  const block = WebImporter.Blocks.getMetadataBlock(document, {});
  main.append(block);
  return block;
}

function appendMetadata(metadata, key, value) {
  appendToBlock(metadata, key, value);
}

function addEl(main, el) {
  if (el) {
    main.append(el);
  }
}

function getImage(slide) {
  const host = 'https://golfdigest.sports.sndimg.com';
  const suffix = '.rend.hgtvcom.616.822.suffix/1573470070814.jpeg';

  const el = slide.querySelector('.m-ResponsiveImage');
  if (el) {
    const dataAttr = el.getAttribute('data-photo-box-params');
    console.log(`Parsing data attribute '${dataAttr}'`);
    const json = JSON.parse(dataAttr);
    let sourcePath = json.assetId;
    let sourceUrl = `${host}${sourcePath}${suffix}`;
    let image = document.createElement('img');
    image.setAttribute('src', sourceUrl);
    let div = document.createElement('div');
    div.append(image);
    return div;
  }
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
  
      const main = document.createElement('main');
      const assetTitle = document.querySelector('.assetTitle');
      const articleBody = document.querySelector('.articleBody');
      const gallery = document.querySelector('.photoGalleryPromo');

      let articleStyle = "Gallery";

      addEl(main, assetTitle);
      addEl(main, articleBody);

      // addEl(main, gallery);
      if (gallery) {
        let postcards = gallery.querySelector('.photocards');
        if (postcards) {
          articleStyle = 'Gallery Listicle'; 
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
    }) => new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '').replace(/\/content\/golfdigest-com\/en/, ''),
  };