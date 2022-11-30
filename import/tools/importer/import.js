function replaceEmbed(el, url) {
  const a = document.createElement('a');
  a.href = url;
  a.innerHTML = url;
  el.replaceWith(a);
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
      
      const articleTitle = document.querySelector('.o-AssetTitle');
      const articleBody = document.querySelector('.articleBody');
      const main = document.createElement('main');
      
      main.append(articleTitle);
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

      const author = getAttributionName(document);
      const authorURL = getAttributionURL(document);
      const publicationDate = getPublicationDate(document);
      console.log(`Author: ${author}. Publication Date: ${publicationDate}`);

      // const metadataBlock = WebImporter.Blocks.getMetadataBlock(document, {});
      // alert(metadataBlock.outerHTML);
      const metadata = createMetadataBlock(document, main);
      appendMetadata(metadata, 'Author', author);
      appendMetadata(metadata, 'Author URL', authorURL);
      appendMetadata(metadata, 'Publication Date', publicationDate);

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
    }) => new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
  };