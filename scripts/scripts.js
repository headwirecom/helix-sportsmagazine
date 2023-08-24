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
  toCamelCase, getMetadata,
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
 * Find the template corresponding to the provided classname
 *
 * @param className
 * @return {string|null}
 */
function findTemplate(className) {
  return Object.values(ARTICLE_TEMPLATES).find((template) => template === className);
}

/**
 * Builds a template block if any found
 *
 * @param {HTMLElement} main
 */
function buildTemplate(main) {
  [...document.body.classList].some((className) => {
    const template = findTemplate(className);
    if (template) {
      main.querySelectorAll('.section-metadata').forEach((metadataEl) => {
        metadataEl.className = 'template-section-metadata';
      });

      const section = document.createElement('div');
      section.append(buildBlock(template, { elems: [...main.children] }));
      main.prepend(section);

      return true;
    }

    return false;
  });
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
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
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
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
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

async function loadPage() {
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
      ARTICLES: 'article-query-index',
      PRODUCTS: 'product-query-index',
      GALLERY: 'gallery-query-index',
    };

    // TODO support gd+ query
    // Author query to query map
    this._queryMap = {
      hero: {
        spreadsheet: this._spreadsheets.ARTICLES,
        sheet: 'golf-news-tours-default',
        limit: 10,
      },
      latest: {
        spreadsheet: this._spreadsheets.ARTICLES,
        sheet: 'latest',
        limit: 50,
      },
      news: {
        spreadsheet: this._spreadsheets.ARTICLES,
        sheet: 'golf-news-tours-default',
        limit: 50,
      },
      features: {
        spreadsheet: this._spreadsheets.ARTICLES,
        sheet: 'golf-news-tours-features',
        limit: 50,
      },
      courses: {
        spreadsheet: this._spreadsheets.ARTICLES,
        sheet: 'courses',
        limit: 50,
      },
      loop: {
        spreadsheet: this._spreadsheets.ARTICLES,
        sheet: 'loop',
        limit: 50,
      },
      wedges: {
        mock: '/mock-data/wedges.json',
        limit: 0,
      },
    };

    // Max items per block
    this._blockQueryLimit = {
      hero: 5,
      cards: 10,
      carousel: 20,
    };

    // Construct limit for each query based on the blocks on the page
    const blockNames = Object.keys(this._blockQueryLimit);
    const queryNames = Object.keys(this._queryMap);
    blockNames.forEach((blockName) => {
      queryNames.forEach((queryName) => {
        this._queryMap[queryName].limit += document.querySelectorAll(`main .${blockName}.${queryName}.block`).length * this._blockQueryLimit[blockName];
      });
    });

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
  }

  /**
   * Looks for a query in the given block classname
   * @param {HTMLElement} block
   * @return {string}
   */
  getQuery(block) {
    let query = '';

    const queries = Object.keys(this._queryMap);
    for (const className of block.classList) {
      if (queries.includes(className)) {
        query = className;
        block.dataset.query = query;
        break;
      }
    }

    return query;
  }

  /**
   * Triggers an index fetch
   * @param {HTMLElement} block
   */
  query(block, limit) {
    const id = getBlockId(block);
    const query = this.getQuery(block);

    if (!query) {
      console.warn(`Query missing for "${block.dataset.blockName}" with id "${id}"`);
      return;
    }

    // Check if query is available
    const queryDetails = this._queryMap[query];
    if (!queryDetails) {
      console.warn(`Query "${query}" not implemented`);
      return;
    }

    let url;
    // Use mock data if defined
    if (queryDetails.mock) {
      url = queryDetails.mock;
    } else {
      // Build query sheet url
      url = `/${queryDetails.spreadsheet}.json?sheet=${queryDetails.sheet}`;
    }

    // Use cached resource
    if (this._cache[url]) {
      // Cache is already populated
      if (this._cache[url].data.length) {
        // Only trigger if there is enough data
        if (queryDetails.limit <= this._cache[url].data.length) {
          // "Return" data for given id
          document.dispatchEvent(new CustomEvent(`query:${id}`, { detail: this._cache[url] }));
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
    this._cache[url] = { data: [] };

    // TODO store the delta between the number of cached items and the number of items requested
    // and only request that with ?offset=

    // Fetch new data, cache it then trigger
    fetch(queryDetails.mock ? url : `${url}&limit=${limit || queryDetails.limit}`)
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
        document.dispatchEvent(new CustomEvent(`query:${id}`, { detail: this._cache[url] }));

        // Unstack and "return" data
        for (const stackId in this._queryStack) {
          if (url === this._queryStack[stackId]) {
            document.dispatchEvent(new CustomEvent(`query:${stackId}`, { detail: this._cache[url] }));
            delete this._queryStack[stackId];
          }
        }
      })
      .catch((error) => {
        console.warn(error);
      });
  }
})();
