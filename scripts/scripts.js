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

const ARTICLE_TEMPLATES = {
  Default: 'default-article',
  FullBleed: 'full-bleed',
  LongForm: 'long-form',
  OpenArticle: 'open-article',
  LiveStream: 'live-stream',
  Gallery: 'gallery',
  GalleryListicle: 'gallery-listicle',
  ProductListing: 'product-listing',
};

const LCP_BLOCKS = [...Object.values(ARTICLE_TEMPLATES)]; // add your LCP blocks to the list

const range = document.createRange();

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
 * @param {HTMLDivElement} metadataElement
 * @returns {object} JSON
 */
export function parseSectionMetadata(metadataElement) {
  const metadata = {};
  [...metadataElement.children].forEach((child) => {
    const key = toCamelCase(child.firstElementChild.textContent.trim());
    const value = child.lastElementChild.textContent.trim();
    metadata[key] = value;
  });

  metadataElement.remove();

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
export function render(template, fragment) {
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
 * @param {number} excel date to convert.
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

export const gdPlusIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEiIGhlaWdodD0iMTkiIHZpZXdCb3g9IjAgMCA1MSAxOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGZpbGw9IiMwMDAiIGFyaWEtbGFiZWw9IkdEIFBsdXMgTG9nbyIgYXJpYS1oaWRkZW49InRydWUiPjxwYXRoIGNsYXNzPSJnZC10ZXh0IiBkPSJNMTIuMjMxIDE3LjY2MjVDMTEuODk5NCAxNy44MjgyIDExLjI2NDQgMTguMDIxMSAxMC43Njc2IDE4LjA3NjNWMTguNDY0QzE0LjA4MTIgMTguMzgwNiAxNi40MDA3IDE3LjgyOTIgMTcuODkzMiAxNy4xNjYzVjEwLjU5NTJIMTIuMjMxVjE3LjY2MjVaIiA+PC9wYXRoPjxwYXRoIGNsYXNzPSJnZC10ZXh0IiBkPSJNMTcuNDUwNSA0Ljg1MzExVjEuMTU0NDdDMTYuMjYzOSAwLjgyMzAzIDE0LjMzMDcgMC42MDI1NiAxMi4yODcxIDAuNTczVjAuOTYwNjVDMTQuMzg1NSAxLjk1NTQ1IDE1Ljg3NjYgMy4wODY4OSAxNy40NTA1IDQuODUzMTFaIiA+PC9wYXRoPjxwYXRoIGNsYXNzPSJnZC10ZXh0IiBkPSJNNy4zNzEzOCA5LjUxNzVDNy4zNzEzOCA0LjMwMDIzIDguOTQ1MzEgMS41MzkyMSAxMS4yMSAwLjk2MDE2VjAuNTcyNTFDNS4wMjQyOSAwLjk4NjMyIDAuOTM3NSA0LjI0NDAyIDAuOTM3NSA5LjUxNjVDMC45Mzc1IDE0LjY1MjggNC41NTQ1OSAxOC4xODM4IDEwLjAyMjQgMTguNDYwNVYxOC4wNzI4QzguMDM0NDkgMTcuNzE2MiA3LjM3MTM4IDE0LjUxMzggNy4zNzEzOCA5LjUxNzVaIiA+PC9wYXRoPjxwYXRoIGNsYXNzPSJnZC10ZXh0IiBkPSJNMjcuNDE4NyAwLjgyM0gyMS4xNzc3VjE4LjIxNDNIMjcuNDE4N1YwLjgyM1oiID48L3BhdGg+PHBhdGggY2xhc3M9ImdkLXRleHQiIGQ9Ik0yOC4zODQ4IDAuODIzVjEuMjM3NzhDMzAuODQyOSAxLjQ1ODI1IDMyLjAwMTkgMy4xNjk3MiAzMi4wMDE5IDkuNTE4OUMzMi4wMDE5IDE1LjU5MTkgMzAuNzkgMTcuNjMzOCAyOC40MTQ4IDE3LjgyNzZWMTguMjE1M0MzNC42Mjc3IDE4LjEzMjQgMzguNDM4NiAxNS4yMDYyIDM4LjQzODYgOS41MTk5QzM4LjQzNjcgMy4zMDc4MiAzNC40ODc2IDAuOTA2MzQgMjguMzg0OCAwLjgyM1oiID48L3BhdGg+PHBhdGggZD0iTTQ2LjY4NzUgNS4yMjQ4NUg0NC44MTI1VjEzLjg0OTlINDYuNjg3NVY1LjIyNDg1WiIgZmlsbD0iI0VEM0U0OSI+PC9wYXRoPjxwYXRoIGQ9Ik00MS40Mzc1IDguNTk5OVYxMC40NzQ5SDUwLjA2MjVWOC41OTk5SDQxLjQzNzVaIiBmaWxsPSIjRUQzRTQ5Ij48L3BhdGg+PC9zdmc+'; // prettier-ignore
export const gdPlusIconWhite = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEiIGhlaWdodD0iMTkiIHZpZXdCb3g9IjAgMCA1MSAxOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGZpbGw9IiNmZmYiIGFyaWEtbGFiZWw9IkdEIFBsdXMgTG9nbyIgYXJpYS1oaWRkZW49InRydWUiPjxwYXRoIGNsYXNzPSJnZC10ZXh0IiBkPSJNMTIuMjMxIDE3LjY2MjVDMTEuODk5NCAxNy44MjgyIDExLjI2NDQgMTguMDIxMSAxMC43Njc2IDE4LjA3NjNWMTguNDY0QzE0LjA4MTIgMTguMzgwNiAxNi40MDA3IDE3LjgyOTIgMTcuODkzMiAxNy4xNjYzVjEwLjU5NTJIMTIuMjMxVjE3LjY2MjVaIiA+PC9wYXRoPjxwYXRoIGNsYXNzPSJnZC10ZXh0IiBkPSJNMTcuNDUwNSA0Ljg1MzExVjEuMTU0NDdDMTYuMjYzOSAwLjgyMzAzIDE0LjMzMDcgMC42MDI1NiAxMi4yODcxIDAuNTczVjAuOTYwNjVDMTQuMzg1NSAxLjk1NTQ1IDE1Ljg3NjYgMy4wODY4OSAxNy40NTA1IDQuODUzMTFaIiA+PC9wYXRoPjxwYXRoIGNsYXNzPSJnZC10ZXh0IiBkPSJNNy4zNzEzOCA5LjUxNzVDNy4zNzEzOCA0LjMwMDIzIDguOTQ1MzEgMS41MzkyMSAxMS4yMSAwLjk2MDE2VjAuNTcyNTFDNS4wMjQyOSAwLjk4NjMyIDAuOTM3NSA0LjI0NDAyIDAuOTM3NSA5LjUxNjVDMC45Mzc1IDE0LjY1MjggNC41NTQ1OSAxOC4xODM4IDEwLjAyMjQgMTguNDYwNVYxOC4wNzI4QzguMDM0NDkgMTcuNzE2MiA3LjM3MTM4IDE0LjUxMzggNy4zNzEzOCA5LjUxNzVaIiA+PC9wYXRoPjxwYXRoIGNsYXNzPSJnZC10ZXh0IiBkPSJNMjcuNDE4NyAwLjgyM0gyMS4xNzc3VjE4LjIxNDNIMjcuNDE4N1YwLjgyM1oiID48L3BhdGg+PHBhdGggY2xhc3M9ImdkLXRleHQiIGQ9Ik0yOC4zODQ4IDAuODIzVjEuMjM3NzhDMzAuODQyOSAxLjQ1ODI1IDMyLjAwMTkgMy4xNjk3MiAzMi4wMDE5IDkuNTE4OUMzMi4wMDE5IDE1LjU5MTkgMzAuNzkgMTcuNjMzOCAyOC40MTQ4IDE3LjgyNzZWMTguMjE1M0MzNC42Mjc3IDE4LjEzMjQgMzguNDM4NiAxNS4yMDYyIDM4LjQzODYgOS41MTk5QzM4LjQzNjcgMy4zMDc4MiAzNC40ODc2IDAuOTA2MzQgMjguMzg0OCAwLjgyM1oiID48L3BhdGg+PHBhdGggZD0iTTQ2LjY4NzUgNS4yMjQ4NUg0NC44MTI1VjEzLjg0OTlINDYuNjg3NVY1LjIyNDg1WiIgZmlsbD0iI0VEM0U0OSI+PC9wYXRoPjxwYXRoIGQ9Ik00MS40Mzc1IDguNTk5OVYxMC40NzQ5SDUwLjA2MjVWOC41OTk5SDQxLjQzNzVaIiBmaWxsPSIjRUQzRTQ5Ij48L3BhdGg+PC9zdmc+'; // prettier-ignore
