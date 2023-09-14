import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  toCamelCase, getMetadata, toClassName,
} from './lib-franklin.js';

export const ARTICLE_TEMPLATES = {
  Default: 'default-article',
  FullBleed: 'full-bleed',
  LongForm: 'long-form',
  OpenArticle: 'open-article',
  LiveStream: 'live-stream',
  Gallery: 'gallery',
  GalleryListicle: 'gallery-listicle',
  ProductListing: 'product-listing',
  NewsletterSubscribe: 'newsletter-subscribe',
};

const LCP_BLOCKS = [...Object.values(ARTICLE_TEMPLATES), 'hero']; // add your LCP blocks to the list

const range = document.createRange();

export function replaceLinksWithEmbed(block) {
  const embeds = ['youtube', 'brightcove', 'instagram'];
  block.querySelectorAll(embeds.map((embed) => `a[href*="${embed}"]`).join(',')).forEach((embedLink) => {
    if (embedLink.textContent.startsWith('View') && embedLink.href.includes('instagram')) {
      embedLink.remove();
    } else {
      const embed = buildBlock('embed', { elems: [embedLink.cloneNode(true)] });
      embedLink.replaceWith(embed);
    }
  });

  // handling for Twitter links
  block.querySelectorAll('a[href*="twitter.com"]').forEach((twitterLink) => {
    if (twitterLink.href.includes('/status/')) {
      const embed = buildBlock('embed', { elems: [twitterLink.cloneNode(true)] });
      twitterLink.replaceWith(embed);
    }
  });
}

/**
 * Remove DOM elements which are empty
 * @param {DocumentFragment} container
 * @param {string} selector
 */
export function removeEmptyElements(container, selector) {
  container.querySelectorAll(selector).forEach((el) => {
    if (el.innerHTML.trim() === '') {
      el.remove();
    }
  });
}

/**
 * Returns section metadata JSON key:value pairs
 * @param {HTMLDivElement | null} metadataElement
 * @returns {object} JSON
 */
export function parseSectionMetadata(metadataElement) {
  const metadata = {};

  if (metadataElement) {
    [...metadataElement.children].forEach((child) => {
      const key = toCamelCase(child.firstElementChild.textContent.trim());
      const value = child.lastElementChild.textContent.trim();
      metadata[key] = value;
    });

    metadataElement.remove();
  }

  return metadata;
}

/**
 * Parse HTML fragment
 * @returns {DocumentFragment}
 */
export function parseFragment(fragmentString) {
  return range.createContextualFragment(fragmentString);
}

/**
 * Assign slot attribute to selected element
 * @param {HTMLElement} block
 * @param {string} slot
 * @param {string} selector
 */
export function assignSlot(block, slot, selector) {
  const el = block.querySelector(selector);
  if (el) {
    el.setAttribute('slot', slot);
  }
}

/**
 * Update template with slotted elements from fragment
 */
export function render(template, fragment, type) {
  // TODO remove once importer fixes "**" occurrences and missing line breaks
  if (type === ARTICLE_TEMPLATES.GalleryListicle) {
    fragment.innerHTML = fragment.innerHTML
      .replaceAll('**<a ', '<strong><a ')
      .replaceAll('</a>**', '</a></strong>')
      .replaceAll('** <a ', '<strong><a ')
      .replaceAll('</a> **', '</a></strong>')
      .replaceAll('from left to right:', 'from left to right:<br>')
      .replaceAll('</a><strong>', '</a><br><strong>');
  } else if (type === ARTICLE_TEMPLATES.LongForm || type === ARTICLE_TEMPLATES.FullBleed) {
    fragment.innerHTML = fragment.innerHTML
      .replaceAll('****', '')
      .replaceAll('</em> **', '</em></strong>&nbsp;')
      .replaceAll('**<em>', '<strong><em>');
  }

  const slottedElements = fragment.querySelectorAll('[slot]');
  for (const slottedElement of slottedElements) {
    const slotName = slottedElement.getAttribute('slot');
    const slots = template.querySelectorAll(`slot[name="${slotName}"]`);
    for (const slot of slots) {
      slot.replaceWith(slottedElement.cloneNode(true));
    }
  }

  const defaultSlot = template.querySelector('slot:not([name])');
  if (defaultSlot) {
    fragment.querySelectorAll('[slot]').forEach((el) => el.remove());
    defaultSlot.replaceWith(...fragment.children);
  }
}

export function getAuthors() {
  return getMetadata('author').split(',').map((author) => author.trim());
}

/**
 * Returns author URL
 *
 * @param {string} author
 */
export function normalizeAuthorURL(author) {
  return `/contributor/${author.replace(/[^a-z0-9]/gmi, ' ').replace(/\s/g, '-').toLowerCase()}`;
}

/**
 * Adds portrait class if image has portrait aspect-ratio
 *
 * @param el
 */
export function addPortraitClass(el) {
  if (el.tagName === 'PICTURE') {
    const img = el.querySelector('img');
    if (img && img.height > img.width) {
      el.classList.add('portrait');
    }
  } else {
    el.forEach((picture) => {
      const img = picture.querySelector('img');
      if (img && img.height > img.width) {
        picture.classList.add('portrait');
      }
    });
  }
}

// TODO Remove once importer fixes photo-credit metadata for articles
export function addPhotoCredit(pictures) {
  pictures.forEach((picture) => {
    const next = picture.parentElement.nextElementSibling;
    // Assuming name is not longer than that
    if (next && next.tagName === 'P' && (next.textContent.startsWith('Photo') || next.textContent.split(' ').length < 3)) {
      next.classList.add('photo-credit');
    }
  });
}

/**
 * Builds a template block if any found
 *
 * @param {HTMLElement} main
 */
function buildTemplate(main) {
  const template = toClassName(getMetadata('template').split('(')[0].trim());

  if (template && Object.values(ARTICLE_TEMPLATES).includes(template)) {
    // Adding base template class to body because any queries added to the
    // template metadata entry are combine which will cause CSS issues.
    // example: "Template (sheet query)" has a class of: "template-sheet-query"
    document.body.classList.add(template);
    main.querySelectorAll('.section-metadata').forEach((metadataEl) => {
      metadataEl.className = 'template-section-metadata';
    });

    // TODO remove once importer fixes more cards
    const checkForMoreCards = (el, elems) => {
      if (el.tagName === 'P' && el.querySelector('picture') && el.querySelector('a') && el?.nextElementSibling?.tagName === 'P' && el.nextElementSibling.children[0]?.tagName === 'A' && el.nextElementSibling?.nextElementSibling.tagName === 'P' && el.nextElementSibling.nextElementSibling.children[0]?.tagName === 'A') {
        const rubric = document.createElement('span');
        rubric.textContent = el.nextElementSibling.textContent.trim();

        const desc = document.createElement('strong');
        desc.textContent = el.nextElementSibling.nextElementSibling.textContent.trim();

        const link = document.createElement('a');
        link.setAttribute('href', new URL(el.querySelector('a').getAttribute('href')).pathname);

        link.append(el.querySelector('picture'));
        link.append(rubric);
        link.append(desc);

        el.nextElementSibling.nextElementSibling.classList.add('remove');
        el.nextElementSibling.classList.add('remove');
        el.classList.add('remove');

        elems.push(link);

        if (el.nextElementSibling.nextElementSibling.nextElementSibling) {
          checkForMoreCards(el.nextElementSibling.nextElementSibling.nextElementSibling, elems);
        }
      }
    };

    main.querySelectorAll('h2').forEach((h2) => {
      if (h2.nextElementSibling) {
        const elems = [];
        checkForMoreCards(h2.nextElementSibling, elems);
        if (elems.length) {
          main.querySelectorAll('.remove').forEach((el) => el.remove());
          const h3 = document.createElement('h3');
          h3.textContent = h2.textContent;
          h3.id = h2.id;
          elems.unshift(h3);
          const moreCards = buildBlock('more-cards', { elems });
          h2.replaceWith(moreCards);
        }
      }
    });

    // TODO remove once importer fixes courses block
    const checkForCourses = (el, elems) => {
      if (el.tagName === 'P' && el.querySelector('picture')
          && el.nextElementSibling?.tagName === 'P'
          && el.nextElementSibling.nextElementSibling?.tagName === 'H5'
          && el.nextElementSibling.nextElementSibling.nextElementSibling?.tagName === 'H6') {
        elems.push(el.cloneNode(true)); // <p> with <picture>

        const creditP = el.nextElementSibling.cloneNode(true);
        creditP.className = 'courses-photo-credit';
        elems.push(creditP);

        const titleH5 = el.nextElementSibling.nextElementSibling.cloneNode(true);
        titleH5.className = 'courses-title';
        elems.push(titleH5);

        const subtitleH6 = el.nextElementSibling
          .nextElementSibling
          .nextElementSibling
          .cloneNode(true);
        subtitleH6.className = 'courses-subtitle';
        elems.push(subtitleH6);

        // Handle the next four p's after h6
        let currentEl = el.nextElementSibling
          .nextElementSibling
          .nextElementSibling
          .nextElementSibling;

        const classesToAdd = ['courses-rating', 'courses-panelists', 'courses-info', 'courses-button'];

        for (let i = 0; i < 4; i += 1) {
          if (currentEl) {
            const clonedNode = currentEl.cloneNode(true);

            if (currentEl.tagName.toLowerCase() === 'ul') {
              clonedNode.className = 'courses-tags';
              i -= 1;
            } else if (clonedNode.className) {
              clonedNode.className += ` ${classesToAdd[i]}`;
            } else {
              clonedNode.className = classesToAdd[i];
            }

            elems.push(clonedNode);

            currentEl.classList.add('remove');
            currentEl = currentEl.nextElementSibling;
          }
        }
        el.nextElementSibling.nextElementSibling.nextElementSibling.classList.add('remove');
        el.nextElementSibling.nextElementSibling.classList.add('remove');
        el.nextElementSibling.classList.add('remove');
        el.classList.add('remove');
      }
    };

    main.querySelectorAll('p > picture').forEach((picture) => {
      const pTag = picture.parentElement;
      if (pTag.nextElementSibling) {
        const elems = [];
        checkForCourses(pTag, elems);
        if (elems.length) {
          const courseBlock = buildBlock('courses', { elems });
          pTag.replaceWith(courseBlock);
          main.querySelectorAll('.remove').forEach((el) => el.remove());
        }
      }
    });

    const section = document.createElement('div');
    section.append(buildBlock(template, { elems: [...main.children] }));
    main.prepend(section);

    return true;
  }

  return false;
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildTemplate(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicons.
 */
export function addFavIcons() {
  const faviconSizes = [16, 32, 96, 160, 192];
  const appleIconSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];

  const favicons = `
    <meta name="msapplication-TileColor" content="#0fadc4">
    <meta name="msapplication-TileImage" content="/favicons/mstile-144x144.png">
    ${faviconSizes.map((size) => `<link rel="icon" type="image/png" href="/favicons/favicon-${size}x${size}.png" sizes="${size}x${size}">`).join('')}
    ${appleIconSizes.map((size) => `<link rel="apple-touch-icon" sizes="${size}x${size}" href="/favicons/apple-touch-icon-${size}x${size}.png">`).join('')}
  `;

  // Remove placeholder
  document.head.querySelector('head link[rel="icon"]').remove();

  // Add favicons
  document.head.insertAdjacentHTML('beforeend', favicons);
}

export function createTag(tag, attributes, html) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement || html instanceof SVGElement) {
      el.append(html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  return el;
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcons(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

// TODO Remove once all URLs pointing to GD are fixed
function fixURLsWithGD() {
  document.body.querySelectorAll('a[href^="https://www.golfdigest.com/"]').forEach((link) => {
    link.setAttribute('href', link.getAttribute('href').slice(26));
  });
}

async function loadPage() {
  fixURLsWithGD();
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

/**
 * Converts date into time since string.
 * Example: X days ago
 * @param {Date} date to compare to.
 */
export const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    const value = Math.floor(interval);
    return `${value} ${value === 1 ? 'year' : 'years'} ago`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const value = Math.floor(interval);
    return `${value} ${value === 1 ? 'month' : 'months'} ago`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const value = Math.floor(interval);
    return `${value} ${value === 1 ? 'day' : 'days'} ago`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const value = Math.floor(interval);
    return `${value} ${value === 1 ? 'hour' : 'hours'} ago`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const value = Math.floor(interval);
    return `${value} ${value === 1 ? 'minute' : 'minutes'} ago`;
  }
  const value = Math.floor(interval);
  return `${value} ${value === 1 ? 'second' : 'seconds'} ago`;
};

/**
 * Converts excel date into JS date.
 * @param {number} excelDate date to convert.
 */
export const convertExcelDate = (excelDate) => {
  const secondsInDay = 86400;
  const excelEpoch = new Date(1899, 11, 31);
  const excelEpochAsUnixTimestamp = excelEpoch.getTime();
  const missingLeapYearDay = secondsInDay * 1000;
  const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
  const excelTimestampAsUnixTimestamp = excelDate * secondsInDay * 1000;
  const parsed = excelTimestampAsUnixTimestamp + delta;
  return Number.isNaN(parsed) ? null : new Date(parsed);
};

export function getBlockId(block) {
  block.id = block.id || window.crypto.randomUUID();
  return block.id;
}

/**
 * Setting up custom fetch to cache article-query
 */
window.store = new (class {
  constructor() {
    // Query stack
    this._queryStack = {};

    // Indexes
    this._spreadsheets = {
      article: 'article-query-index',
      product: 'product-query-index',
      gallery: 'gallery-query-index',
      'custom-data': 'custom-data',
    };

    // Pre-defined queries
    this._queryMap = {
      wedges: {
        mock: '/mock-data/wedges.json',
        limit: 0,
      },
    };

    // Max items per block
    /*
    * Add entry here for new blocks that require data to be fetched!
    */
    this._blockQueryLimit = {
      hero: (block) => {
        const firstHero = document.querySelector('.hero.block[data-block-name="hero"]');
        if (firstHero.isEqualNode(block)) {
          return 4;
        }
        return 1;
      },
      cards: (block) => {
        if (block.classList.contains('hero')) {
          return 2;
        }
        if (block.classList.contains('latest')) {
          return 10;
        }
        if (block.classList.contains('columns')) {
          return 5;
        }
        return 4;
      },
      carousel: () => 20,
      loop: () => 30,
      'series-cards': () => 100,
      'tiger-cards': () => 35,
      'tiger-vault-hero': () => 1,
      'newsletter-subscribe': () => 25,
    };

    this.blockNames = Object.keys(this._blockQueryLimit);
    this.spreadsheets = Object.keys(this._spreadsheets);

    this.initQueries();

    try {
      this._cache = JSON.parse(window.sessionStorage['golf-store']);

      // Forces a refresh after a long period (1d) in case window is stored in memory
      setTimeout(() => {
        sessionStorage.clear();
      }, 86400);
    } catch (e) {
      // session storage not supported
      this._cache = {};
    }
  } // Find all dynamic queries on the page and map them out

  // Dynamic queries end with their spreadsheet name e.g. loop-article or latest-gallery
  initQueries() {
    const dynamicQuerySelectors = this.spreadsheets.map((spreadsheet) => `main .block[class*="${spreadsheet}"]`);
    document.querySelectorAll(dynamicQuerySelectors.join(',')).forEach((block) => {
      for (const spreadsheet of this.spreadsheets) {
        const queryClassName = [...block.classList]
          .find((className) => className.endsWith(spreadsheet));

        if (queryClassName) {
          const query = queryClassName.replace(`-${spreadsheet}`, '');
          if (!this._queryMap[query]) {
            this._queryMap[query] = {
              spreadsheet,
              limit: 0,
            };
          }
        }
      }
    });

    // Construct limit for each query based on the blocks on the page
    const queryNames = Object.keys(this._queryMap);
    this.blockNames.forEach((blockName) => {
      queryNames.forEach((queryName) => {
        const { spreadsheet } = this._queryMap[queryName];
        document.querySelectorAll(`main .${blockName}.${queryName}-${spreadsheet}.block`).forEach((blockEl) => {
          this._queryMap[queryName].limit += this._blockQueryLimit[blockName](blockEl);
        });
      });
    });
  }

  /**
   * Looks for a query in the given block classname
   * @param {HTMLElement} block
   * @return {string}
   */
  getQuery(block) {
    const queries = Object.keys(this._queryMap);

    for (const query of queries) {
      const found = [...block.classList].find((className) => className.startsWith(query));
      if (found) {
        block.dataset.query = query;
        break;
      }
    }

    return block.dataset.query;
  }

  /**
   * Triggers an index fetch
   * @param {HTMLElement} block
   */
  query(block) {
    const id = getBlockId(block);
    let query = this.getQuery(block);

    if (!query) {
      // Attempt to find more blocks generated late.
      // This usually happens when using a non-default page-
      // type as you have to trigger block decoration manually.
      this.initQueries();
      query = this.getQuery(block);
      if (!query) {
        console.warn(`Query missing for "${block.dataset.blockName}" with id "${id}"!
Make sure the block definition includes the spreadsheet & sheet name like this: \x1b[37m"(example, class, SHEET_NAME SPREADSHEET_FILENAME)"\x1b[0m!
If you created a new spreadsheet you might also need to add it to \x1b[37m"this._spreadsheets"\x1b[0m.
`);
        return;
      }
    }

    const queryDetails = this._queryMap[query];
    if (!queryDetails.mock && queryDetails.limit < 1) {
      console.warn(`No query limit was found for ${block.dataset.blockName} block! \x1b[1m\x1b[31mTherefore no data will be returned!\x1b[0m

Make sure to set a limit for \x1b[31m"${block.dataset.blockName}"\x1b[0m in \x1b[37m"this._blockQueryLimit"\x1b[0m
      `);
    }
    let url;

    // Use mock data if defined
    if (queryDetails.mock) {
      url = queryDetails.mock;
    } else {
      // Build query sheet url
      url = `/${this._spreadsheets[queryDetails.spreadsheet]}.json?sheet=${query}`;
    }

    const dispatchData = (dispatchId) => {
      // using queryselect in case this is called during query stack cleanup
      const blockToDispatchTo = document.getElementById(dispatchId);
      const previousOffset = this._cache[url].blockRequestOffset || 0;
      this._cache[url].blockRequestOffset = (
        previousOffset
        + this._blockQueryLimit[blockToDispatchTo.dataset.blockName](blockToDispatchTo)
      );

      const slicedData = this._cache[url].data
        .slice(previousOffset, this._cache[url].blockRequestOffset);

      document.dispatchEvent(new CustomEvent(`query:${dispatchId}`, { detail: { ...this._cache[url], data: slicedData } }));
    };

    // Use cached resource & that it has data
    if (this._cache[url]) {
      // Cache is already populated
      if (this._cache[url].data.length) {
        // Only trigger if there is enough data
        if (queryDetails.limit <= this._cache[url].data.length) {
          // "Return" data for given id
          dispatchData(id, block);
          return;
        }
      } else {
        // Stack query
        this._queryStack = {
          ...this._queryStack,
          [id]: url,
        };

        return;
      }
    }

    // Start setting cache to avoid multiple requests or invalid cache if not enough items
    this._cache[url] = { data: [], limit: queryDetails.limit };

    // TODO store the delta between the number of cached items and the number of items requested
    // and only request that with ?offset=

    // Fetch new data, cache it then trigger
    fetch(queryDetails.mock ? url : `${url}&limit=${queryDetails.limit}`)
      .then((req) => {
        if (req.ok) {
          return req.json();
        }
        throw new Error(req.statusText);
      })
      .then((res) => {
        // Set cache with data
        this._cache[url] = res;

        // Store cached data in session storage
        try {
          window.sessionStorage['golf-store'] = JSON.stringify(this._cache);
        } catch (e) {
          // Session storage not supported
        }

        // "Return" data for given id
        dispatchData(id);

        // Unstack and "return" data
        for (const stackId in this._queryStack) {
          if (url === this._queryStack[stackId]) {
            dispatchData(stackId);
            // Pop stack id
            delete this._queryStack[stackId];
          }
        }
      })
      .catch((error) => {
        console.warn(error);
      });
  }
})();

/**
 * Generates HTML for the premium article banner.
 * @param {Number} Number of leftover articles to compare to.
 */
export const premiumArticleBanner = (customLeftoverArticles = null) => {
  let leftoverArticles = customLeftoverArticles;
  if (typeof customLeftoverArticles !== 'number') {
    leftoverArticles = Math.min(Number(window.name), 3);
  }
  window.name = Math.max(leftoverArticles - 1, 0);

  let text;
  if (leftoverArticles > 1) {
    text = `You have <strong>${leftoverArticles}</strong> free premium articles remaining.`;
  }
  if (leftoverArticles === 1) {
    text = 'This is your last free premium article for the month.';
  }
  if (leftoverArticles < 1) {
    text = 'You are out of free premium articles.';
  }

  return `
    <div class="premium-article-banner ${leftoverArticles < 1 ? 'out-of-free-articles' : ''}">
      <div class="premium-banner-text-wrapper">
        <span class="premium-message">${text}</span>
        <a class="premium-link" src="#" target="_blank">
          Subscribe to <strong>Golf Digest<span class="red-plus">+</span></strong>
        </a>
      </div>
    </div>
  `;
};

export const validateEmail = (email) => email.match(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
);

/**
   * Creates a class name compatible with window.store.query
   * so page templates can also use that functionality like blocks.
   * @param {string} Metadata string of the page that includes "(SHEET_NAME SPREADSHEET_NAME)"
   * @return {string} String that is a valid class for window.store.query
   */
export const extractQueryFromTemplateMetaData = (metaDataTemplateString) => {
  try {
    const regex = /\((.*)\)/;
    const textWithinBrackets = metaDataTemplateString.match(regex)[1];
    const classesArray = textWithinBrackets.split(',').map((string) => string.trim());

    const foundSpreadsheet = classesArray.find((classString) => {
      const convertedString = toClassName(classString);
      for (const spreadsheet of window.store.spreadsheets) {
        if (convertedString.endsWith(spreadsheet)) {
          return true;
        }
      }
      return false;
    });

    return foundSpreadsheet ? toClassName(foundSpreadsheet) : false;
  } catch (error) {
    console.log(`Something went wrong while trying to get query from ${metaDataTemplateString}`);
    console.log(error);
    return false;
  }
};

/**
 * Generates HTML for the premium article blocker.
 * @param {block} Block where the selector exists.
 * @param {Selector} Selector for article body that should be covered.
 */
export const generateArticleBlocker = (block, selector) => {
  if (Number(window.sessionStorage.freeArticles) > 0) {
    return;
  }
  const articleBody = block.querySelector(selector);

  articleBody.style.height = '1000px';
  articleBody.style.position = 'relative';
  articleBody.style.overflow = 'hidden';

  const articleBlocker = document.createElement('div');
  articleBlocker.className = 'article-blocker-wrapper';
  articleBlocker.innerHTML = `
    <div class="article-blocker-content">
      <img class="article-blocker-image gd-plus-logo" src="/icons/gd-plus-logo.svg" alt="Golf Digest Plus Logo" />
      <div class="article-blocker-lead">Subscribe to continue Reading</div>
      <div class="article-blocker-sublead">
        <span class="highlight">Golf Digest<span class="red-plus">+</span></span>
        includes unlimited digital articles, exclusive course reviews, magazine access and more!
      </div>
      <a class="cta" href="https://www.golfdigest.com/subscribe-golf-digest-plus" target="_blank">
        Learn More
      </a>

      <span class="login-wrapper">
      Already have an account? <button class="login-button" onclick="console.warn('login popup not implemented yet');">Log in</button>
      </span>
    </div>
  `;

  articleBody.appendChild(articleBlocker);
};
