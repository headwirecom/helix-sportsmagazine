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
  toCamelCase,
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
  const embeds = ['youtube', 'twitter', 'brightcove', 'instagram'];
  block.querySelectorAll(embeds.map((embed) => `a[href*="${embed}"]`).join(',')).forEach((embedLink) => {
    // TODO Ideally duplicated instagram embeds should not be imported
    if (embedLink.textContent.startsWith('View') && embedLink.href.includes('instagram')) {
      embedLink.remove();
    } else {
      const parent = embedLink.parentElement;
      const embed = buildBlock('embed', { elems: [embedLink] });
      parent.replaceWith(embed);
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
 * @param picture
 */
export function addPortraitClass(pictures) {
  pictures.forEach((picture) => {
    const img = picture.querySelector('img');
    if (img && img.height > img.width) {
      picture.classList.add('portrait');
    }

    // TODO Remove once importer fixes photo-credit metadata for articles
    const next = picture.parentElement.nextElementSibling;
    // Assuming name is not longer than that
    if (next && next.textContent.split(' ').length < 3) {
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
 * Builds a ceros embed block for all found ceros links
 *
 * @param {HTMLElement} main
 */
function buildCerosEmbed(main) {
  main.querySelectorAll('p > a[href^="https://view.ceros.com/golf-digest/"]').forEach((link) => {
    const embed = buildBlock('embed', { elems: [link.cloneNode(true)] });
    link.parentElement.replaceWith(embed);
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildTemplate(main);
    buildCerosEmbed(main);
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

/**
 * Prepends an image path for images depending on window location
 */
export const prependImage = (imagePath) => {
  const host = window.location.origin.startsWith('http://localhost') ? 'https://main--helix-sportsmagazine--headwirecom.hlx.page' : window.location.origin;
  return host + imagePath;
};
