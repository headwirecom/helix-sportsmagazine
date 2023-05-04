import { readBlockConfig } from '../../scripts/scripts.js';
import { leaderboardTemplate, headerTemplate, headerSchoolsIconTemplate } from '../../scripts/templates.js';
import { loadJsonData, createTag } from '../../utils/utils.js';

const LEADERBOARD_URL = '/bin/leaderboard/leaders.json';

let roots = Array.from(document.querySelectorAll('li.nav-level-0'));
let menuState = false;

const defaults = {
  setNavTop: true,
  searchExposed: false,
  highlightHeader: true,
  useFixedMenus: false, // Area header uses fixed menus
  headerSelector: '.o-Header',
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

// TODO: hardcode defaults for now
const config = defaults;

function handleRootExpand() {
  const anyExpanded = roots.reduce((expanded, current) => expanded || current.classList.contains('expanded'), false);
  for (const root of roots) {
    if (!anyExpanded) {
      root.style.display = 'block';
    } else {
      root.style.display = null;
    }
  }
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

function toggleNav(state) {
  menuState = (typeof state === 'undefined') ? !state : state;
  if (menuState) toggleSearch(false);
  // setNavTop();
  let menuBtn = document.querySelector('.o-Header__a-MenuButton');
  let menuEl = document.querySelector('.o-Header__m-NavMenu');
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

function registerSubMenuEvents(rootMenu) {
  const allSubMenus = rootMenu.querySelectorAll('.o-NavMenu__m-NavList');
  for (const menu of allSubMenus) {
    const buttons = menu.querySelectorAll('.expand-button');
    for (const btn of buttons) {
      btn.onclick = () => {
        handleExpand(btn);
      };
    }
  }
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
  for (const menu of roots) {
    registerRootMenuEvents(menu);
  }
  searchBtn.onclick = () => {
    toggleSearch(true);
  };
  searchCancelBtn.onclick = (event) => {
    event.preventDefault();
    toggleSearch(false);
  };
}

function createLeaderboardPlayerHTML(data) {
  const html = `
  <div class="o-Leaderboard__m-Players__m-Player">
      <div class="o-Leaderboard__m-Players__m-PlayerMain">
          <h4 class="o-Leaderboard__m-Players__m-PlayerMain__a-Place">${data.Position}</h4>
          <div class="o-Leaderboard__m-Players__m-PlayerMain__a-Name">
            <i style="background-image:url(${data.CountryFlag});"></i><h5>${data.FirstName} ${data.LatsName}</h5>
          </div>
          <p class="o-Leaderboard__m-Players__m-PlayerMain__a-Record">${data.Rounds.length} ${data.TotalScoreToPar}</p>
      </div>
      <div class="o-Leaderboard__m-Players__m-Player__a-PlayerScore">
          <p>${data.TotalScoreToPar}</p>
      </div>
  </div>
  `;
  return html.trim();
}

function createLeaderBoard(block) {
  const leaderboard = leaderboardTemplate({});
  block.insertAdjacentHTML('beforebegin', leaderboard);
  const playersEl = document.body.querySelector('.o-Leaderboard__m-Players');
  loadJsonData(LEADERBOARD_URL).then((json) => {
    const { data } = json;
    if (data) {
      for (const player of data) {
        const playerHTML = createLeaderboardPlayerHTML(player);
        const div = document.createElement('div');
        div.innerHTML = playerHTML;
        playersEl.append(div.firstChild);
      }
    }
  });
}

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

// function collapseAllNavSections(sections) {
//   sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
//     section.setAttribute('aria-expanded', 'false');
//   });
// }

function decorateNavHeader(section) {
  const sectionLink = section.querySelector('a');
  const url = (sectionLink.getAttribute('href')) ? sectionLink.getAttribute('href') : '//www.golfdigest.com';
  const text = sectionLink.innerHTML;
  const el = createTag('a', { class: 'o-Header__a-Logo', href: url, 'aria-label': text });
  el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="171.5" height="35.1" viewBox="0 0 171.5 35.1" role="img" aria-label="${text}">
  <title>${text}</title>
  <path d="M68.8 6.5c1.6 0 2.8-1.3 2.8-2.8S70.3.9 68.8.9C67.2.9 66 2.2 66 3.7s1.2 2.8 2.8 2.8M12.7 27.1v-.5C9.9 26 9 21.5 9 14.6c0-7.3 2.2-11.2 5.4-12v-.5C5.7 2.6 0 7.2 0 14.6c0 7.1 5.1 12.1 12.7 12.5m1 0c4.6-.1 7.9-.9 10-1.8v-9.2h-7.9V26c-.5.2-1.4.5-2 .6v.5h-.1zM23.1 8V2.9c-1.7-.5-4.4-.8-7.2-.8v.5c2.9 1.4 5 3 7.2 5.4M34.3 27v-.4c-.3-.1-.7-.4-1-.7-.9-1.1-1-3.2-1-8.4 0-5.1.2-7.3 1-8.3.2-.3.6-.6 1-.7v-.4c-5.4.4-9.9 3.9-9.9 9.4.1 5.6 4.5 9.1 9.9 9.5m1 0c5.4-.4 9.8-3.9 9.8-9.5 0-5.5-4.4-9-9.8-9.4v.4c.3.1.7.3 1 .7.8 1.1 1 3.2 1 8.3 0 5.1-.2 7.3-1 8.4-.2.3-.7.6-1 .7v.4zM46 26.7h7.5V.2L46 .9v25.8z"></path>
  <path d="M64.1 26.7V11h3.6V8.5h-3.6V4c0-2.3 1.7-3.2 3.1-3.4V.2c-4.9.3-10.7 1.4-10.7 6.6v1.7h-2.3V11h2.3v15.7h7.6z"></path>
  <path fill="#ED1C24" d="M101 7.6c2.1 0 3.8-1.7 3.8-3.8S103.1 0 101 0s-3.8 1.7-3.8 3.8 1.7 3.8 3.8 3.8"></path>
  <path fill="#A8A9A3" d="M114.7 35.1v-.3c2.9-.3 6-1.4 6-3.8 0-1.4-1-1.9-2.5-1.9h-7.6c-2.9 0-5-1.4-5-4.6 0-2.6 2.3-4 4-4.8l.2.2c-.3.2-.6.5-.6 1.1 0 .7.5 1 1.2 1h8.3c4.2 0 6.6 1.6 6.6 5.8 0 3.9-4.5 6.9-10.6 7.3m-1.1 0c-5.8 0-8.6-1-8.6-3 0-1.5 1.7-2.3 4.9-2.5l.1.2c-.4.3-1 1-1 2.3 0 1.9 1.9 2.5 4.5 2.7v.3m1.3-15v-.3c.7-.2 1.2-1.9 1.2-5.6 0-3.8-.6-5.6-1.2-5.7v-.4c3.4.2 7.9 1.9 7.9 6s-4.5 5.9-7.9 6m-.9 0c-3.4-.2-8-1.9-8-5.9s4.6-5.9 8-6v.3c-.7.2-1.3 1.9-1.3 5.7 0 3.8.7 5.5 1.3 5.6v.3m9.9-9.4c-1.3 0-2.4-1.1-2.4-2.5s1.1-2.5 2.4-2.5c1.4 0 2.5 1.1 2.5 2.5-.1 1.5-1.2 2.5-2.5 2.5M82.5 26.7v-.5c3.3-.3 5-3.1 5-11.6 0-8.9-1.6-11.3-5.1-11.6v-.6c8.5.1 14 3.5 14 12.2.1 7.9-5.2 12-13.9 12.1m-1.4 0h-8.7V2.4h8.7v24.3M104.8 26.7h-7.5V9.1l7.5-.7v18.3M164.8 27c-3.5 0-6.1-1.6-6.1-5.9v-10h-2.3V8.5h2.4v-4l7.7-2.7-.2 6.7h4.8v2.6h-4.8v9.3c0 2.2.9 3 2.9 3 .8 0 2-.3 2.4-.5v.6c-1.1 1.9-3.4 3.5-6.8 3.5M148.8 27v-.4c1.2-.2 2.2-.8 2.2-2.2 0-1.2-.7-1.8-2.6-2.7l-2.4-1.1c-2.2-1-4.2-2.7-4.2-5.9 0-3.3 3.2-6.3 7.7-6.6v.4c-1 .1-2.1.6-2.1 2 0 1.3.8 1.9 2.1 2.5l3.3 1.5c2 .9 3.7 2.8 3.7 5.4.1 4.4-2.2 6.9-7.7 7.1m-.9 0c-1.9 0-4.3-.3-5.7-.7v-4.7c1.9 2 4 4.2 5.7 5v.4m7.7-14c-1.6-2.2-3.2-3.7-5.1-4.4v-.5c1.8 0 3.9.4 5.1.8V13M132.9 27c-6.5 0-9.3-4.7-9.3-9.5 0-5.1 4-9 9.2-9.4v.4c-1.1.3-1.6 1.4-1.6 6.5 0 4.2 1.7 6.5 5.2 6.5 2 0 3.8-.5 4.9-1.4v.7c-.7 2.2-2.8 6.2-8.4 6.2m8.2-11.2h-9v-.5l2.5-.4c0-4-.5-6.2-1.2-6.4v-.4c5.6.3 7.7 4.3 7.7 7.7"></path>
  </svg>`;
  return el;
}

function decorateMainMenuLevel(listEl, level) {
  const navLevel = `nav-level-${level}`;
  const nextLevel = level + 1;
  listEl.classList.add('o-NavMenu__m-NavList');
  listEl.classList.add(navLevel);
  listEl.querySelectorAll(':scope > li').forEach((listItem) => {
    listItem.classList.add('o-NavMenu__a-NavListItem');
    listItem.classList.add(navLevel);
    if (level === 0) {
      listItem.style.display = 'block';
    }
    const menuLink = listItem.querySelector('a');
    const linkHref = (menuLink.href) ? menuLink.href : '';
    const link = createTag('a', { class: 'expand-title', href: linkHref }, menuLink.innerHTML);
    const menuItemDiv = createTag('div', { class: `o-NavMenu__a-NavLink ${navLevel}` });
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
  const subNav = document.querySelector('.o-Header__a-SubNav');
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

function decorateSchoolsNav(section) {
  const sectionLink = section.querySelector('a');
  const url = (sectionLink.getAttribute('href')) ? sectionLink.getAttribute('href') : '//www.golfdigest.com';
  const title = sectionLink.innerHTML;
  const logoTitle = `${title} Logo`;
  const el = createTag('a', {
    target: '_blank', class: 'o-Header__a-SchoolsLink', href: url, title, 'arial-label': logoTitle,
  });
  el.insertAdjacentHTML('beforeend', headerSchoolsIconTemplate({ title: logoTitle }));
  return el;
}

function decorateSideNav(section, sectionClass) {
  const el = createTag('div', { class: sectionClass });
  const sectionLinks = section.querySelector('ul');
  el.append(sectionLinks);
  sectionLinks.querySelectorAll('li').forEach((item) => {
    item.querySelector('a').classList.add('a-NavLink');
  });
  return el;
}

function decorateSecondarySideNav(section) {
  return decorateSideNav(section, 'o-NavMenu__m-Secondary');
}

function decorateLogin() {
  const el = createTag('ul', { class: 'o-HeaderFresh__m-ProfileInfo' });
  el.innerHTML = `<li data-logged-in="false" style="display: none;">
  <a class="m-ProfileInfo__a-Nickname" data-social-nickname="" href="//www.golfdigest.com/my-account"></a>
  <a class="m-ProfileInfo__a-Button--Logout o-Button o-Button--transparent" href="#" data-type="gigya-logout">Log Out</a>
</li>
<li>
  <a class="m-ProfileInfo__a-Button--Login o-Button" href="#" data-type="gigya-login">Log In</a>
  <a class="m-ProfileInfo__a-Button--Register o-Button o-Button--no-styles" href="#" data-type="gigya-register">Sign Up</a>
</li>`;
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
  const el = createTag('div', { class: 'o-SocialLinks' }, heading);
  const iconsWrapper = createTag('div', { class: 'o-SocialLinks__m-IconWrapper' });
  el.append(iconsWrapper);
  section.querySelectorAll('a').forEach((link) => {
    const url = link.getAttribute('href');
    const icon = getSocialLinkIconFromURL(url);
    iconsWrapper.insertAdjacentHTML('beforeend', icon);
  });
  return el;
}

function buildHeader(block, html) {
  const template = headerTemplate({});
  block.innerHTML = template;
  const navDecorators = [
    decorateNavHeader,
    decorateMainSideNav,
    decorateSchoolsNav,
    decorateSecondarySideNav,
    decorateLogin,
    decorateTertiarySideNav,
    decorateSocialSideNav,
  ];
  const nav = createTag('nav', { class: 'o-Header__m-NavMenu o-NavMenu', 'data-module': 'golf-mobile-nav', id: 'mod-golf-mobile-nav-1' });
  const bottomNav = createTag('div', { class: 'o-NavMenu__m-Bottom' });
  const navSections = createTag('div', {}, html).children;
  if (navSections) {
    for (let i = 0; i < navSections.length; i++) {
      const section = navSections[i];
      const decorator = navDecorators[i];
      const el = decorator(section);
      if (i < 2) nav.append(el);
      else bottomNav.append(el);
    }
  }
  nav.append(bottomNav);
  block.querySelector('nav').replaceWith(nav);
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const header = block.closest('.header-wrapper');
  if (header) {
    header.classList.add('o-Header');
    header.setAttribute('data-module', 'golf-header');
  }

  // insert leaderboard
  createLeaderBoard(block);

  // build header navigation
  const navPath = cfg.nav || '/golf-nav';
  const resp = await fetch(`${navPath}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();
    buildHeader(block, html);
    registerMenuEvents();
  }
}
