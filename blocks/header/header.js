import { createTag } from '../../scripts/scripts.js';

const DEFAULT_NAV = '/golf-nav';

const config = {
  setNavTop: true,
  searchExposed: false,
  highlightHeader: true,
  useFixedMenus: false, // Area header uses fixed menus
  headerSelector: '.header',
  openClass: 'is-Open',
  activeClass: 'is-Active',
  searchOpenClass: 'has-OpenSearch',
  fixMenuOpen: 'has-FixedMenu',
  navMenuSel: '[data-module="golf-mobile-nav"]',
  navButtonSel: '[data-type="button-header-nav"]',
  searchBoxSel: '[data-mobile-search-box]',
  searchInputSel: '[data-type="search-input"]',
  anyHeadingSel: 'h1, h2, h3, h4, h5, h6',

};

let roots = Array.from(document.querySelectorAll('li.nav-level-0'));
let menuState = false;

function handleRootExpand() {
  const anyExpanded = roots.reduce((expanded, current) => expanded || current.classList.contains('expanded'), false);
  anyExpanded.forEach((root) => {
    if (!anyExpanded) {
      root.style.display = 'block';
    } else {
      root.style.display = null;
    }
  });
}

function handleExpand(expandButton) {
  const item = expandButton.closest('.o-NavMenu__a-NavListItem');
  const expanded = item.parentNode.querySelector('.expanded');

  if (expanded === item) {
    item.classList.toggle('expanded');
  } else {
    item.classList.toggle('expanded');
    if (!item.classList.contains('nav-level-0')) expanded?.classList.remove('expanded');
  }

  handleRootExpand();
}

function toggleNav(state) {
  menuState = (typeof state === 'undefined') ? !state : state;
  if (menuState) toggleSearch(false);
  // setNavTop();
  const menuBtn = document.querySelector('.o-Header__a-MenuButton');
  const menuEl = document.querySelector('.o-Header__m-NavMenu');
  menuBtn.classList.toggle(config.activeClass, menuState);
  menuEl.classList.toggle(config.openClass, menuState);
  document.querySelector('.o-Header__m-Overlay').style = `display: ${menuState ? 'block' : 'none'}`;

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
  const searchContainer = document.querySelector(config.searchBoxSel);
  const searchBtn = document.querySelector('[data-type=button-search-toggle]');
  const mainHeader = document.querySelector(config.headerSelector);

  const outsideClickListener = (event) => {
    if (!searchContainer.contains(event.target) && !searchBtn.contains(event.target)) {
      toggleSearch(false);
    }
  };

  if (state) {
    toggleNav(false);
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

function registerSubMenuEvents(rootMenu) {
  const allSubMenus = rootMenu.querySelectorAll('.o-NavMenu__m-NavList');
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
  roots = Array.from(document.querySelectorAll('li.nav-level-0'));
  const menuBtn = document.querySelector('.o-Header__a-MenuButton');
  const menuCloseBtn = document.querySelector('.o-Header__a-Close');
  const searchBtn = document.querySelector('[data-type=button-search-toggle]');
  const searchCancelBtn = document.querySelector('[data-type=button-search-cancel]');
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

async function fetchHeaderTemplate() {
  const resp = await fetch('header.html');
  if (resp.ok) {
    const html = await resp.text();
    return html;
  }
  return '';
}

function buildHeader(block, html) {
  const template = fetchHeaderTemplate();
  const nav = createTag('nav', { class: 'o-Header__m-NavMenu o-NavMenu', 'data-module': 'golf-mobile-nav', id: 'mod-golf-mobile-nav-1' });
  const bottomNav = createTag('div', { class: 'o-NavMenu__m-Bottom' });
  const navSections = createTag('div', {}, html).children;
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const resp = await fetch(`${DEFAULT_NAV}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();
    buildHeader(block, html);
    registerMenuEvents();
  }
}
