import { createTag } from '../../scripts/scripts.js';
import leaderboard from './leaderboard.js';

const DEFAULT_NAV = '/golf-nav';

const config = {
  setNavTop: true,
  searchExposed: false,
  highlightHeader: true,
  useFixedMenus: false, // Area header uses fixed menus
  headerSelector: '.header',
  openClass: 'is-open',
  activeClass: 'is-Active',
  searchOpenClass: 'has-open-search',
  fixMenuOpen: 'has-FixedMenu',
  navMenuSel: '[data-module="golf-mobile-nav"]',
  navButtonSel: '[data-type="button-header-nav"]',
  searchBoxSel: '[data-mobile-search-box]',
  searchInputSel: '[data-type="search-input"]',
  anyHeadingSel: 'h1, h2, h3, h4, h5, h6',

};

let roots = Array.from(document.querySelectorAll('.header li.nav-level-0'));
let menuState = false;
let navTemplateDom = null;

async function fetchNavTemplate() {
  const resp = await fetch('/blocks/header/nav.html');
  if (resp.ok) {
    const text = await resp.text();
    const parser = new DOMParser();
    navTemplateDom = parser.parseFromString(text, 'text/html');
  }
}

await fetchNavTemplate();

async function fetchHeaderTemplate() {
  const resp = await fetch('/blocks/header/header.html');
  if (resp.ok) {
    const html = await resp.text();
    return html;
  }
  return '';
}

function handleRootExpand() {
  const anyExpanded = roots.reduce((expanded, current) => expanded || current.classList.contains('expanded'), false);
  roots.forEach((root) => {
    if (!anyExpanded) {
      root.style.display = 'block';
    } else {
      root.style.display = null;
    }
  });
}

function handleExpand(expandButton) {
  const item = expandButton.closest('.nav-menu-nav-list-item');
  const expanded = item.parentNode.querySelector('.expanded');

  if (expanded === item) {
    item.classList.toggle('expanded');
  } else {
    item.classList.toggle('expanded');
    if (!item.classList.contains('nav-level-0')) expanded?.classList.remove('expanded');
  }

  handleRootExpand();
}

function showSearch(state) {
  const searchContainer = document.querySelector(config.searchBoxSel);
  const searchBtn = document.querySelector('[data-type=button-search-toggle]');
  const mainHeader = document.querySelector(config.headerSelector);

  const outsideClickListener = (event) => {
    if (!searchContainer.contains(event.target) && !searchBtn.contains(event.target)) {
      showSearch(false);
    }
  };

  if (state) {
    if (config.highlightHeader) {
      mainHeader.classList.add(config.searchOpenClass); // used for main header
      document.body.classList.add(config.fixMenuOpen);
      // context.broadcast('openSearch');
    }
  } else {
    document.removeEventListener('click', outsideClickListener);
    document.querySelectorAll(config.searchInputSel).value = '';
    if (config.highlightHeader) {
      mainHeader.classList.remove(config.searchOpenClass);
      document.body.classList.remove(config.fixMenuOpen);
      // context.broadcast('closeSearch');
    }
  }
  searchContainer.classList.toggle(config.openClass, state);
  if (state) {
    document.querySelector(config.searchInputSel).focus();
    document.addEventListener('click', outsideClickListener);
  }
}

function toggleNav(state) {
  menuState = (typeof state === 'undefined') ? !state : state;
  if (menuState) {
    showSearch(false);
  }
  // setNavTop();
  const menuBtn = document.querySelector('.header .header-menu-button');
  const menuEl = document.querySelector('.header .header-nav-menu');
  menuBtn.classList.toggle(config.activeClass, menuState);
  menuEl.classList.toggle(config.openClass, menuState);
  document.querySelector('.header .header-overlay').style = `display: ${menuState ? 'block' : 'none'}`;

  const outsideClickListener = (event) => {
    if (!menuEl.contains(event.target) && !menuBtn.contains(event.target)) {
      toggleNav(false);
    }
  };

  if (menuState) {
    document.addEventListener('click', outsideClickListener);
  } else {
    document.removeEventListener('click', outsideClickListener);
  }
}

function toggleSearch(state) {
  if (state) {
    toggleNav(false);
    showSearch(true);
  } else {
    showSearch(false);
  }
}

function registerSubMenuEvents(rootMenu) {
  const allSubMenus = rootMenu.querySelectorAll('.nav-menu-nav-list');
  allSubMenus.forEach((menu) => {
    const buttons = menu.querySelectorAll('.expand-button');
    buttons.forEach((btn) => {
      btn.onclick = () => {
        handleExpand(btn);
      };
    });
  });
}

function registerRootMenuEvents(rootMenu) {
  const menuBtn = rootMenu.querySelector('.expand-button');
  if (menuBtn) {
    menuBtn.onclick = () => {
      rootMenu.classList.toggle('expanded');
      handleRootExpand();
    };
  }
  registerSubMenuEvents(rootMenu);
}

function registerMenuEvents() {
  roots = Array.from(document.querySelectorAll('.header li.nav-level-0'));
  const menuBtn = document.querySelector('.header .header-menu-button');
  const menuCloseBtn = document.querySelector('.header .header-close');
  const searchBtn = document.querySelector('.header [data-type=button-search-toggle]');
  const searchCancelBtn = document.querySelector('.header [data-type=button-search-cancel]');
  menuBtn.onclick = () => {
    toggleNav();
  };
  menuCloseBtn.onclick = () => {
    toggleNav(false);
  };
  roots.forEach((menu) => { registerRootMenuEvents(menu); });
  searchBtn.onclick = () => {
    toggleSearch(true);
  };
  searchCancelBtn.onclick = (event) => {
    event.preventDefault();
    toggleSearch(false);
  };
}

function decorateNavHeader(section) {
  const sectionLink = section.querySelector('a');
  const url = (sectionLink.getAttribute('href')) ? sectionLink.getAttribute('href') : '//www.golfdigest.com';
  const text = sectionLink.innerHTML;

  if (navTemplateDom) {
    const template = navTemplateDom.querySelector('[data-type="nav-title"]');
    if (template) {
      template.querySelectorAll('[aria-label]').forEach((el) => el.setAttribute('aria-label', text));
      const el = template.firstElementChild;
      el.setAttribute('href', url);
      const titleElem = el.querySelector('title');
      if (titleElem) titleElem.innerHTML = text;
      return el;
    }
  }

  const el = createTag('a', { class: 'header-logo', href: url, 'aria-label': text });
  el.innerHTML = text;
  return el;
}

function decorateMainMenuLevel(listEl, level) {
  const navLevel = `nav-level-${level}`;
  const nextLevel = level + 1;
  listEl.classList.add('nav-menu-nav-list');
  listEl.classList.add(navLevel);
  listEl.querySelectorAll(':scope > li').forEach((listItem) => {
    listItem.classList.add('nav-menu-nav-list-item');
    listItem.classList.add(navLevel);
    if (level === 0) {
      listItem.style.display = 'block';
    }
    const menuLink = listItem.querySelector('a');
    const linkHref = (menuLink.href) ? menuLink.href : '';
    const link = createTag('a', { class: 'expand-title', href: linkHref }, menuLink.innerHTML);
    const menuItemDiv = createTag('div', { class: `nav-menu-nav-link ${navLevel}` });
    menuItemDiv.append(link);
    menuLink.replaceWith(menuItemDiv);
    const submenus = listItem.querySelectorAll(':scope > ul');
    if (submenus && submenus.length > 0) {
      menuItemDiv.classList.add('has-children');
      menuItemDiv.insertAdjacentHTML('beforeend', `
        <button aria-label="Expand Section" class="expand-button " data-type="expand-button">
         <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arrow Icon">
  <path d="M1.70612 0.819317L1.53333 0.654091L1.36055 0.819317L0.827218 1.32933L0.638272 1.51001L0.827218 1.69069L3.57161 4.31506L0.827218 6.93943L0.638272 7.12012L0.827218 7.3008L1.36055 7.81081L1.53333 7.97604L1.70612 7.81081L5.17278 4.49575L5.36173 4.31506L5.17278 4.13438L1.70612 0.819317Z" fill="#151517" stroke="#151517" stroke-width="0.5"></path>
  </svg></button>
        `);
      submenus.forEach((subm) => {
        decorateMainMenuLevel(subm, nextLevel);
      });
    }
  });
}

function isArticlePage() {
  const path = window.location.pathname;
  return (path.includes('/article/') || path.includes('/story/'));
}

function isGalleryPage() {
  const path = window.location.pathname;
  return path.includes('/gallery/');
}

function isSubNavVisible() {
  return !isArticlePage() && !isGalleryPage;
}

function decorateSubNav() {
  const subNav = document.querySelector('.header .header-sub-nav');
  if (!isSubNavVisible()) {
    subNav.remove();
    return;
  }
  subNav.innerHTML = `
    <ul>
          <li class="active">
              <a href="//www.golfdigest.com/play">All</a>
          </li>
      
          <li>
              <a href="//www.golfdigest.com/play/instruction">Instruction</a>
          </li>
      
          <li>
              <a href="//www.golfdigest.com/play/equipment">Equipment</a>
          </li>
      
          <li>
              <a href="//www.golfdigest.com/play/courses">Courses</a>
          </li>
      
          <li>
              <a href="//www.golfdigest.com/play/instruction/women">Women's Golf</a>
          </li>
      </ul>
    `;
}

function decorateMainSideNav(section) {
  const main = section.querySelector('ul');
  decorateMainMenuLevel(main, 0);
  decorateSubNav(section);
  return main;
}

function decorateMidNavLink(section) {
  const sectionLink = section.querySelector('a');
  const url = (sectionLink.getAttribute('href')) ? sectionLink.getAttribute('href') : '//www.golfdigest.com';
  const text = sectionLink.innerHTML;

  if (navTemplateDom) {
    const template = navTemplateDom.querySelector('[data-type="mid-nav-link"]');
    if (template) {
      template.querySelectorAll('[title]').forEach((el) => el.setAttribute('title', text));
      template.querySelectorAll('[aria-label]').forEach((el) => el.setAttribute('aria-label', text));
      const el = template.firstElementChild;
      el.setAttribute('href', url);
      const titleElem = el.querySelector('title');
      if (titleElem) titleElem.innerHTML = text;
      return el;
    }
  }

  const el = createTag('a', { class: 'plus-link', href: url, 'aria-label': text });
  el.innerHTML = text;
  return el;
}

function decorateSideNav(section, sectionClass) {
  const el = createTag('div', { class: sectionClass });
  const sectionLinks = section.querySelector('ul');
  el.append(sectionLinks);
  sectionLinks.querySelectorAll('li').forEach((item) => {
    item.querySelector('a').classList.add('a-nav-link');
  });
  return el;
}

function decorateSecondarySideNav(section) {
  return decorateSideNav(section, 'o-NavMenu__m-Secondary');
}

function decorateLogin() {
  const el = navTemplateDom.querySelector('[data-type="nav-profile"]');
  return el;
}

function decorateTertiarySideNav(section) {
  const el = decorateSideNav(section, 'o-NavMenu__m-Tertiary');
  return el;
}

function getSocialIcon(url, match) {
    const template = navTemplateDom.querySelector('[data-type="social-icons"]');
    const el = template.querySelector(`.social-icon-${match}`);
    el.setAttribute('href', url);
    return el;
}

function getSocialLinkIconFromURL(url) {
  const iconTemplates = [
    {
      match: ['facebook'],
      getIcon: (href) => getSocialIcon(href, 'facebook'),
    },
    {
      match: ['twitter'],
      getIcon: (href) => getSocialIcon(href, 'twitter'),
    },
    {
      match: ['instagram'],
      getIcon: (href) => getSocialIcon(href, 'instagram'),
    },
    {
      match: ['youtube'],
      getIcon: (href) => getSocialIcon(href, 'youtube'),
    },
  ];
  const template = iconTemplates.find((e) => e.match.some((match) => url.includes(match)));
  return ((template) ? template.getIcon(url) : '');
}

function decorateSocialSideNav(section) {
  const heading = section.querySelector(config.anyHeadingSel);
  const el = createTag('div', { class: 'social-links' }, heading);
  const iconsWrapper = createTag('div', { class: 'social-links-icon-wrapper' });
  el.append(iconsWrapper);
  section.querySelectorAll('a').forEach((link) => {
    const url = link.getAttribute('href');
    const icon = getSocialLinkIconFromURL(url);
    iconsWrapper.insertAdjacentElement('beforeend', icon);
  });
  return el;
}

function decorateNavSection(container, section, sectionIndex) {
  const navDecorators = [
    decorateNavHeader,
    decorateMainSideNav,
    decorateLogin,
    decorateMidNavLink,
    decorateSecondarySideNav,
    decorateTertiarySideNav,
    decorateSocialSideNav,
  ];

  const decorator = navDecorators[sectionIndex];
  const el = decorator(section);
  container.append(el);
}

async function buildHeader(block, html) {
  block.innerHTML = await fetchHeaderTemplate();
  const nav = block.querySelector('nav');
  const bottomNav = createTag('div', { class: 'nav-menu-bottom' });
  const navSections = createTag('div', {}, html).children;

  if (navSections) {
    for (let i = 0; i < navSections.length; i += 1) {
      if (i < 2) decorateNavSection(nav, navSections[i], i);
      else decorateNavSection(bottomNav, navSections[i], i);
    }
  }

  nav.append(bottomNav);
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const header = block.closest('.header-wrapper');
  if (header) {
    header.classList.add('header');
    header.setAttribute('data-module', 'golf-header');
  }

  leaderboard(block);

  const resp = await fetch(`${DEFAULT_NAV}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();
    await buildHeader(block, html);
    registerMenuEvents();
  }
}
