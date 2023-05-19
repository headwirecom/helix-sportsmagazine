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

function getSocialLinkIconFromURL(url) {
  const iconTemplates = [
    {
      match: ['facebook'],
      getIcon: (href) => `<a class="o-SocialLinks__a-Icon--facebook" href="${href}" target="_blank" rel="noopener" aria-label="Facebook Logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Facebook Logo">
      <title>Facebook Logo</title>
      <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
        </a>`,
    },
    {
      match: ['twitter'],
      getIcon: (href) => `<a class="o-SocialLinks__a-Icon--twitter" href="${href}" target="_blank" rel="noopener" aria-label="Twitter Logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Twitter Logo">
      <title>Twitter Logo</title>
      <path d="M23 2.9998C22.0424 3.67528 20.9821 4.19191 19.86 4.5298C19.2577 3.83731 18.4573 3.34649 17.567 3.12373C16.6767 2.90096 15.7395 2.957 14.8821 3.28426C14.0247 3.61151 13.2884 4.1942 12.773 4.95352C12.2575 5.71283 11.9877 6.61214 12 7.5298V8.5298C10.2426 8.57537 8.50127 8.18561 6.93101 7.39525C5.36074 6.60488 4.01032 5.43844 3 3.9998C3 3.9998 -1 12.9998 8 16.9998C5.94053 18.3978 3.48716 19.0987 1 18.9998C10 23.9998 21 18.9998 21 7.4998C20.9991 7.22126 20.9723 6.9434 20.92 6.6698C21.9406 5.6633 22.6608 4.39251 23 2.9998V2.9998Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
        </a>`,
    },
    {
      match: ['instagram'],
      getIcon: (href) => `<a class="o-SocialLinks__a-Icon--instagram" href="${href}" target="_blank" rel="noopener" aria-label="Instagram Logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Instagram Logo">
      <title>Instagram Logo</title>
      <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M16.0002 11.3698C16.1236 12.2021 15.9815 13.052 15.594 13.7988C15.2065 14.5456 14.5933 15.1512 13.8418 15.5295C13.0903 15.9077 12.2386 16.0394 11.408 15.9057C10.5773 15.7721 9.80996 15.3799 9.21503 14.785C8.62011 14.1901 8.22793 13.4227 8.09426 12.592C7.9606 11.7614 8.09226 10.9097 8.47052 10.1582C8.84878 9.40667 9.45438 8.79355 10.2012 8.40605C10.948 8.01856 11.7979 7.8764 12.6302 7.99981C13.4791 8.1257 14.265 8.52128 14.8719 9.12812C15.4787 9.73496 15.8743 10.5209 16.0002 11.3698Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M17.5 6.5H17.51" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
        </a>`,
    },
    {
      match: ['youtube'],
      getIcon: (href) => `<a class="o-SocialLinks__a-Icon--instagram" href="${href}" target="_blank" rel="noopener" aria-label="Youtube Logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Youtube Logo">
      <title>Youtube Icon</title>
      <path d="M22.5401 6.42C22.4213 5.94541 22.1794 5.51057 21.8387 5.15941C21.4981 4.80824 21.0708 4.55318 20.6001 4.42C18.8801 4 12.0001 4 12.0001 4C12.0001 4 5.12008 4 3.40008 4.46C2.92933 4.59318 2.50206 4.84824 2.16143 5.19941C1.8208 5.55057 1.57887 5.98541 1.46008 6.46C1.1453 8.20556 0.991319 9.97631 1.00008 11.75C0.988863 13.537 1.14285 15.3213 1.46008 17.08C1.59104 17.5398 1.83839 17.9581 2.17823 18.2945C2.51806 18.6308 2.9389 18.8738 3.40008 19C5.12008 19.46 12.0001 19.46 12.0001 19.46C12.0001 19.46 18.8801 19.46 20.6001 19C21.0708 18.8668 21.4981 18.6118 21.8387 18.2606C22.1794 17.9094 22.4213 17.4746 22.5401 17C22.8524 15.2676 23.0064 13.5103 23.0001 11.75C23.0113 9.96295 22.8573 8.1787 22.5401 6.42V6.42Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M9.75 15.02L15.5 11.75L9.75 8.47998V15.02Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
        </a>`,
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
    iconsWrapper.insertAdjacentHTML('beforeend', icon);
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
