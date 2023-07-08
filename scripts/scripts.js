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

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

function getPageTemplatePath(templateClass) {
  const classNameParts = templateClass.split('-');
  if (templateClass.endsWith('-template')) {
    classNameParts.pop();
  }
  const name = classNameParts.join('');
  return `/pages/${name}`;
}

function isTemplateClass(className) {
  let isTemplate = false;
  Object.keys(ARTICLE_TEMPLATES).forEach((key) => {
    if (ARTICLE_TEMPLATES[key] === className) {
      isTemplate = true;
    }
  });
  return isTemplate;
}

async function fetchPageTemplate(templatePath) {
  const templateHTMLPath = `${templatePath}/page.html`;
  try {
    const resp = await fetch(templateHTMLPath);
    if (resp.ok) {
      const text = await resp.text();
      const parser = new DOMParser();
      return parser.parseFromString(text, 'text/html');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`failed to load page HTML template ${templatePath}`, error);
  }
  return null;
}

async function decoratePageContent(main, templatePath) {
  const templateScriptPath = `${templatePath}/page.js`;
  const template = await fetchPageTemplate(templatePath);
  try {
    loadCSS(`${templatePath}/page.css`);
    const mod = await import(templateScriptPath);
    if (mod.default) {
      mod.default(main, template);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`failed to load page template module ${templatePath}`, error);
  }
}

async function decorateTemplates(main) {
  document.body.classList.forEach(async (clazz) => {
    if (isTemplateClass(clazz)) {
      const templatePath = getPageTemplatePath(clazz);
      await decoratePageContent(main, templatePath);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    decorateTemplates(main);
    buildHeroBlock(main);
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
