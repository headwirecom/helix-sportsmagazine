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
        appendMetadata(metadata, 'Image Embed Credit', imageEmbedCredit.innerHTML);
        imageEmbedCredit.remove();
      }

      if (articleHero) {
        const heroImageCredit = articleHero.querySelector('.o-ImageEmbed__a-Credit');
        const heroImageCreditTxt = (heroImageCredit) ? heroImageCredit.innerHTML : '';
        if (heroImageCredit) heroImageCredit.remove();
        appendMetadata(metadata, "Hero Image Credit", heroImageCreditTxt);
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
    
     /*
      // use helper method to remove header, footer, etc.
      WebImporter.DOMUtils.remove(document.body, [
        'header',
        'footer',
        '.leaderboard-container',
        '.leaderboard',
        '.header',
        '.iax_outer',
        '.trending',
        '.container-trending',
        '.ob-smartfeed-wrapper',
      ]);
      return document.body;
      */
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