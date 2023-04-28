import { readBlockConfig, loadCSS, decorateIcons } from '../../scripts/scripts.js';
import { leaderboardTemplate, headerTemplate, headerSchoolsIconTemplate } from '../templates.js';
import { loadJsonData, createTag } from '../../utils/utils.js';

const LEADERBOARD_URL = '/bin/leaderboard/leaders.json';

let loadBehaviors = [];
let roots = Array.from(document.querySelectorAll('li.nav-level-0'));
let menuState = false;

let defaults = {
  setNavTop:        true,
  searchExposed:    false,
  highlightHeader: true,
  useFixedMenus:   false,   // Area header uses fixed menus
  headerSelector: '.o-Header',
  openClass:        'is-Open',
  activeClass:      'is-Active',
  searchOpenClass:  'has-OpenSearch',
  fixMenuOpen:      'has-FixedMenu',
  navMenuSel:       '[data-module="golf-mobile-nav"]',
  navButtonSel:     '[data-type="button-header-nav"]',
  searchBoxSel:     '[data-mobile-search-box]',
  searchInputSel:   '[data-type="search-input"]',
  anyHeadingSel:    'h1, h2, h3, h4, h5, h6'
};

// TODO: hardcode defaults for now
let config = defaults;

function handleExpand(expandButton) {
  const item = expandButton.closest('.o-NavMenu__a-NavListItem');
  const expanded = item.parentNode.querySelector('.expanded');

  if(expanded === item) {
    item.classList.toggle('expanded');
  }
  else {
    item.classList.toggle('expanded');
    if(!item.classList.contains('nav-level-0')) expanded?.classList.remove('expanded');
  }

  handleRootExpand();
}

function handleRootExpand() {
  const anyExpanded = roots.reduce( (expanded, current) => expanded || current.classList.contains('expanded'), false )
  for(const root of roots) {
    if(!anyExpanded) {
      root.style.display = 'block'
    }
    else  {
      root.style.display = null;
    }
  }
}

function toggleSearch(state) {
  let searchContainer = document.querySelector(config.searchBoxSel);
  let searchBtn = document.querySelector('[data-type=button-search-toggle]');
  let mainHeader = document.querySelector(config.headerSelector);

  const outsideClickListener = function(event) {
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
  menuState = state = (typeof state === 'undefined') ? !menuState : state;
  if (menuState) toggleSearch(false);
  // setNavTop();
  let menuBtn = document.querySelector('.o-Header__a-MenuButton');
  let menuEl = document.querySelector('.o-Header__m-NavMenu');
  menuBtn.classList.toggle(config.activeClass, state);
  menuEl.classList.toggle(config.openClass, state);
  document.querySelector('.o-Header__m-Overlay').style = `display: ${state ? 'block' : 'none'}`;

  const outsideClickListener = function(event) {
    if (!menuEl.contains(event.target) && !menuBtn.contains(event.target)) {
      toggleNav(false);
    }
  };

  if(menuState) {
    document.addEventListener('click', outsideClickListener);
  } else {
    document.removeEventListener('click', outsideClickListener);
  }
}

function registerSubMenuEvents(rootMenu) {
  const allSubMenus = rootMenu.querySelectorAll('.o-NavMenu__m-NavList'); 
  for (let menu of allSubMenus) {
    let buttons = menu.querySelectorAll('.expand-button');
    for (let btn of buttons) {
      btn.onclick = function() {
        handleExpand(btn);
      };
    }
  }
}

function registerRootMenuEvents(rootMenu) {
  const menuBtn = rootMenu.querySelector('.expand-button');
  if (menuBtn) {
    menuBtn.onclick = function(event) {
      rootMenu.classList.toggle('expanded');
      handleRootExpand();
    };
  }
  registerSubMenuEvents(rootMenu);
}

function registerMenuEvents() {
  roots = Array.from(document.querySelectorAll('li.nav-level-0'));
  let menuBtn = document.querySelector('.o-Header__a-MenuButton');
  let menuCloseBtn = document.querySelector('.o-Header__a-Close');
  let searchBtn = document.querySelector('[data-type=button-search-toggle]');
  let searchCancelBtn = document.querySelector('[data-type=button-search-cancel]');
  menuBtn.onclick = function(event) {
    toggleNav();
  };
  menuCloseBtn.onclick = function(event) {
    toggleNav(false);
  };
  for (let menu of roots) {
    registerRootMenuEvents(menu);
  }
  searchBtn.onclick = function(event) {
    toggleSearch(true);
  };
  searchCancelBtn.onclick = function(event) {
    event.preventDefault();
    toggleSearch(false);
  };
}

function createLeaderboardPlayerHTML(data) {
  let html = `
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
  loadJsonData(LEADERBOARD_URL).then(json => {
    const data = json.data;
    if (data) {
      for (let player of data) {
        let playerHTML = createLeaderboardPlayerHTML(player);
        let div = document.createElement('div');
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

function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

function decorateNavHeader(section) {
  const sectionLink = section.querySelector('a');
  const url = (sectionLink.getAttribute('href')) ? sectionLink.getAttribute('href') : '//www.golfdigest.com';
  const text = sectionLink.innerHTML;
  const el = createTag('a', { 'class': 'o-Header__a-Logo', 'href': url, 'aria-label': text});
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
  let navLevel = `nav-level-${level}`;
  let nextLevel =  level + 1;
  listEl.classList.add('o-NavMenu__m-NavList');
  listEl.classList.add(navLevel);
  listEl.querySelectorAll(':scope > li').forEach(listItem => {
    listItem.classList.add('o-NavMenu__a-NavListItem');
    listItem.classList.add(navLevel);
    if (level === 0) {
      listItem.style.display = 'block';
    }
    let menuLink = listItem.querySelector('a');
    let linkHref = (menuLink.href) ? menuLink.href : '';
    let link = createTag('a', {class: 'expand-title', href: linkHref}, menuLink.innerHTML);
    let menuItemDiv = createTag('div', { class: `o-NavMenu__a-NavLink ${navLevel}`});
    menuItemDiv.append(link);
    menuLink.replaceWith(menuItemDiv);
    let submenus = listItem.querySelectorAll(':scope > ul');
    if (submenus && submenus.length > 0) {
      menuItemDiv.classList.add('has-children');
      menuItemDiv.insertAdjacentHTML('beforeend', `
      <button aria-label="Expand Section" class="expand-button " data-type="expand-button">
       <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arrow Icon">
<path d="M1.70612 0.819317L1.53333 0.654091L1.36055 0.819317L0.827218 1.32933L0.638272 1.51001L0.827218 1.69069L3.57161 4.31506L0.827218 6.93943L0.638272 7.12012L0.827218 7.3008L1.36055 7.81081L1.53333 7.97604L1.70612 7.81081L5.17278 4.49575L5.36173 4.31506L5.17278 4.13438L1.70612 0.819317Z" fill="#151517" stroke="#151517" stroke-width="0.5"></path>
</svg></button>
      `);
      submenus.forEach(subm => {
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

function isSubNavVisible(section) {
  return !isArticlePage() && !isGalleryPage;
}

function decorateSubNav(section) {
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
  let main = section.querySelector('ul');
  decorateMainMenuLevel(main, 0);
  decorateSubNav(section);
  return main;
}

function decorateSchoolsNav(section) {
  let sectionLink = section.querySelector('a');
  const url = (sectionLink.getAttribute('href')) ? sectionLink.getAttribute('href') : '//www.golfdigest.com';
  const title = sectionLink.innerHTML;
  const logoTitle = title + ' Logo'
  let el = createTag('a', {'target': '_blank', 'class': 'o-Header__a-SchoolsLink', 'href': url, 'title': title, 'arial-label': logoTitle});
  el.insertAdjacentHTML('beforeend', headerSchoolsIconTemplate({title: logoTitle}));
  return el;
}


function decorateSideNav(section, sectionClass) {
  let el = createTag('div', {class: sectionClass});
  let sectionLinks = section.querySelector('ul');
  el.append(sectionLinks);
  sectionLinks.querySelectorAll('li').forEach(item => {
    item.querySelector('a').classList.add('a-NavLink');
  });
  return el;
}

function decorateGolfDigestPlus(section) {
  const elTemplate = `
    <a target="_blank" class="m-PlusLink" href="/subscribe-golf-digest-plus?utm_medium=web&amp;utm_source=programmarketing&amp;utm_campaign=programmarketing&amp;utm_content=gd_plus_subscribe_hamburgernav" title="Golf Digest Plus">
      <span class="m-PlusLink--overtitle">SUBSCRIBE TO</span>
      <svg width="3725" height="710" viewBox="0 0 3725 710" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_10_256)">
          <path d="M2211.19 404.05V398.198C2198.76 395.283 2186.33 363.105 2186.33 291.44C2186.33 219.068 2198.76 186.184 2211.19 183.225V177.395C2146.14 179.603 2059.92 213.967 2059.92 291.44C2059.92 368.913 2146.14 401.135 2211.19 404.05Z" fill="#8A8A81"></path>
          <path d="M2301.8 439.872H2143.95C2129.34 439.872 2120.56 434.019 2120.56 421.585C2120.56 411.36 2126.41 405.53 2132.25 401.135L2128.61 396.718C2097.18 411.338 2053.34 438.392 2053.34 487.376C2053.34 546.607 2092.79 573.661 2147.62 573.661H2290.85C2320.78 573.661 2339.06 582.495 2339.06 608.754C2339.06 653.343 2279.13 673.815 2225.07 680.397V687.022C2341.24 679.712 2425.94 624.147 2425.94 548.838C2426.03 469.863 2380.71 439.872 2301.8 439.872Z" fill="#8A8A81"></path>
          <path d="M2397.53 226.378C2403.68 226.399 2409.77 225.203 2415.45 222.86C2421.13 220.517 2426.29 217.072 2430.64 212.725C2434.99 208.378 2438.43 203.213 2440.78 197.529C2443.12 191.845 2444.32 185.752 2444.3 179.603C2444.22 167.218 2439.26 155.365 2430.51 146.608C2421.75 137.85 2409.91 132.892 2397.53 132.805C2385.23 132.916 2373.47 137.906 2364.84 146.679C2356.2 155.452 2351.4 167.292 2351.49 179.603C2351.39 185.714 2352.5 191.783 2354.77 197.457C2357.04 203.131 2360.42 208.295 2364.71 212.65C2368.99 217.004 2374.1 220.46 2379.74 222.817C2385.37 225.175 2391.42 226.385 2397.53 226.378Z" fill="#8A8A81"></path>
          <path d="M2119.12 629.977C2119.12 605.839 2130.16 592.698 2137.4 586.117L2135.92 582.451C2074.53 587.574 2042.4 602.195 2042.4 630.706C2042.4 668.736 2095.72 686.271 2204.61 687V680.375C2154.9 678.166 2119.12 666.527 2119.12 629.977Z" fill="#8A8A81"></path>
          <path d="M2377.07 291.44C2377.07 213.967 2291.56 180.332 2227.26 177.395V183.247C2239.68 186.184 2250.66 219.068 2250.66 291.462C2250.66 363.127 2239.62 395.261 2227.26 398.22V404.072C2291.56 401.135 2377.07 368.98 2377.07 291.44Z" fill="#8A8A81"></path>
          <path d="M352.871 514.452C340.59 520.051 327.539 523.773 314.154 525.494V535.72C401.829 533.511 463.214 518.913 502.681 501.356V327.284H352.871V514.452Z" fill="black"></path>
          <path d="M490.96 175.208V77.2401C459.55 68.4062 408.407 62.62 354.327 61.8912V72.1165C409.886 98.4415 449.33 128.41 490.96 175.208Z" fill="black"></path>
          <path d="M224.25 298.772C224.25 160.588 265.902 87.4654 325.787 72.1165V62.0016C162.136 72.8453 54 159.175 54 298.772C54 434.748 149.709 528.454 294.399 535.653V525.428C241.799 515.931 224.25 431.104 224.25 298.772Z" fill="black"></path>
          <path d="M722.662 177.395V185.433C729.864 187.648 736.233 191.981 740.939 197.867C757.008 218.34 760.65 259.285 760.65 355.795C760.65 452.968 757.008 493.979 740.939 514.452C736.524 519.576 728.512 525.494 722.662 526.886V534.925C824.95 527.615 909.004 460.344 909.004 355.795C909.004 251.246 824.861 184.727 722.662 177.395Z" fill="black"></path>
          <path d="M517.316 355.729C517.316 460.278 602.077 527.548 704.386 534.858V526.886C697.764 525.406 690.502 519.576 686.109 514.452C669.312 493.979 666.398 453.034 666.398 355.795C666.398 259.285 669.312 218.34 686.109 197.867C690.675 191.831 697.097 187.462 704.386 185.433V177.395C602.077 184.727 517.316 251.246 517.316 355.729Z" fill="black"></path>
          <path d="M924.058 529.072H1067.29V26.0477L924.058 39.2102V529.072Z" fill="black"></path>
          <path d="M1268.53 98.4415C1268.53 54.5812 1301.4 37.7526 1327.73 34.0866V26.0477C1235.02 31.1714 1125.3 51.644 1125.3 151.069V183.247H1082.15V232.231H1125.28V529.072H1268.53V232.231H1336.47V183.247H1268.53V98.4415Z" fill="black"></path>
          <path d="M1355.88 37.7084C1345.24 37.7041 1334.84 40.8556 1326 46.7644C1317.15 52.6732 1310.26 61.0738 1306.18 70.9038C1302.11 80.7338 1301.04 91.5516 1303.11 101.989C1305.19 112.426 1310.31 122.014 1317.82 129.54C1325.34 137.066 1334.92 142.192 1345.35 144.27C1355.79 146.348 1366.6 145.284 1376.43 141.212C1386.25 137.141 1394.65 130.246 1400.56 121.398C1406.47 112.55 1409.62 102.148 1409.62 91.5069C1409.62 77.2425 1403.96 63.562 1393.88 53.4734C1383.8 43.3849 1370.13 37.7143 1355.88 37.7084Z" fill="black"></path>
          <path d="M1590.18 68.4504H1425.03V529.072H1590.18V68.4504Z" fill="#8A8A81"></path>
          <path d="M1615.74 68.4504V79.4928C1680.79 85.3452 1711.47 130.685 1711.47 298.839C1711.47 459.682 1679.34 513.789 1616.56 518.913V529.138C1780.98 526.93 1881.81 449.456 1881.81 298.839C1881.75 134.263 1777.25 70.6589 1615.74 68.4504Z" fill="#8A8A81"></path>
          <path d="M1895.87 529.072H2038.38V181.789L1895.87 194.952V529.072Z" fill="#8A8A81"></path>
          <path d="M1967.1 23C1952.92 23.0131 1939.07 27.232 1927.28 35.1233C1915.5 43.0147 1906.31 54.2243 1900.9 67.3353C1895.48 80.4464 1894.07 94.8704 1896.84 108.784C1899.61 122.698 1906.44 135.477 1916.47 145.506C1926.5 155.535 1939.28 162.364 1953.19 165.13C1967.1 167.896 1981.51 166.474 1994.61 161.045C2007.71 155.615 2018.91 146.422 2026.79 134.627C2034.67 122.831 2038.88 108.963 2038.89 94.7755C2038.89 85.3452 2037.03 76.0069 2033.43 67.2945C2029.82 58.5822 2024.53 50.6666 2017.86 44.0005C2011.2 37.3343 2003.28 32.0484 1994.57 28.445C1985.86 24.8416 1976.53 22.9913 1967.1 23Z" fill="#ED3E49"></path>
          <path d="M3257.32 466.925C3220.04 466.925 3202.52 451.577 3202.52 409.152V232.96H3293.02V183.247H3202.52L3205.85 56.7676L3060.01 107.209V183.247H3015.45V232.96H3059.31V422.336C3059.31 504.205 3106.78 534.969 3174.09 534.969C3239.14 534.969 3282.24 504.249 3301.96 468.449V457.407C3294.69 461.736 3272.77 466.925 3257.32 466.925Z" fill="#8A8A81"></path>
          <path d="M2950.2 300.959L2888.08 271.807C2862.5 260.102 2847.89 248.419 2847.89 223.552C2847.89 196.498 2869.08 187.708 2887.36 185.522V177.395C2801.84 182.518 2741.19 238.812 2741.19 301.687C2741.19 361.648 2779.2 393.825 2820.12 412.818L2864.69 433.29C2901.97 450.826 2914.4 463.26 2914.4 485.212C2914.4 511.537 2895.39 523.22 2872.01 526.886V534.925C2975.76 529.801 3019.62 483.025 3019.62 404.05C3019.62 354.338 2988.19 318.494 2950.2 300.959Z" fill="#8A8A81"></path>
          <path d="M2747.04 432.562V521.033C2773.35 528.343 2820.12 534.284 2855.2 534.924V526.886C2823.03 511.537 2782.86 471.298 2747.04 432.562Z" fill="#8A8A81"></path>
          <path d="M2999.88 269.598V192.081C2977.97 185.455 2937.79 177.461 2903.43 177.461V185.5C2938.5 198.596 2969.93 227.858 2999.88 269.598Z" fill="#8A8A81"></path>
          <path d="M2537.36 309.02C2537.36 211.03 2546.85 190.557 2567.32 185.345V177.395C2467.99 185.433 2392.67 258.556 2392.67 355.066C2392.67 446.453 2446.73 534.925 2569.5 534.925C2676.18 534.925 2716.38 459.616 2728.08 418.67V406.259C2707.61 421.586 2673.27 431.833 2635.37 431.833C2569.5 431.833 2537.36 387.973 2537.36 309.02Z" fill="#8A8A81"></path>
          <path d="M2603.96 306.06L2555.73 313.392V322.889H2726C2726 258.556 2686.53 182.518 2581.31 177.395V185.433C2595.13 189.099 2603.96 230.773 2603.96 306.06Z" fill="#8A8A81"></path>
          </g>
          <rect x="3532" y="184" width="50" height="230" fill="#ED3E49"></rect>
          <rect x="3440" y="321" width="50" height="230" transform="rotate(-90 3440 321)" fill="#ED3E49"></rect>
          <defs>
          <clipPath id="clip0_10_256">
          <rect width="3248" height="664" fill="white" transform="translate(54 23)"></rect>
          </clipPath>
          </defs>
      </svg>
    </a>`;
    const el = createTag('div', {}, elTemplate);
    return el.querySelector('a');
}

function decorateSecondarySideNav(section) {
  let el = decorateSideNav(section, 'o-NavMenu__m-Secondary');
  return el;
}

function decorateLogin(section) {
  let el = createTag('ul', {class:'o-HeaderFresh__m-ProfileInfo'});
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
  let el = decorateSideNav(section, 'o-NavMenu__m-Tertiary');
  return el;
}

function getSocialLinkIconFromURL(url) {
  const iconTemplates = [
    {
      match: ['facebook'],
      getIcon: url => {
        return `<a class="o-SocialLinks__a-Icon--facebook" href="${url}" target="_blank" rel="noopener" aria-label="Facebook Logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Facebook Logo">
    <title>Facebook Logo</title>
    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
      </a>`;
      }
    },
    {
      match: ['twitter'],
      getIcon: url => {
        return `<a class="o-SocialLinks__a-Icon--twitter" href="${url}" target="_blank" rel="noopener" aria-label="Twitter Logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Twitter Logo">
    <title>Twitter Logo</title>
    <path d="M23 2.9998C22.0424 3.67528 20.9821 4.19191 19.86 4.5298C19.2577 3.83731 18.4573 3.34649 17.567 3.12373C16.6767 2.90096 15.7395 2.957 14.8821 3.28426C14.0247 3.61151 13.2884 4.1942 12.773 4.95352C12.2575 5.71283 11.9877 6.61214 12 7.5298V8.5298C10.2426 8.57537 8.50127 8.18561 6.93101 7.39525C5.36074 6.60488 4.01032 5.43844 3 3.9998C3 3.9998 -1 12.9998 8 16.9998C5.94053 18.3978 3.48716 19.0987 1 18.9998C10 23.9998 21 18.9998 21 7.4998C20.9991 7.22126 20.9723 6.9434 20.92 6.6698C21.9406 5.6633 22.6608 4.39251 23 2.9998V2.9998Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
      </a>`;
      }
    },
    {
      match: ['instagram'],
      getIcon: url => {
        return `<a class="o-SocialLinks__a-Icon--instagram" href="${url}" target="_blank" rel="noopener" aria-label="Instagram Logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Instagram Logo">
    <title>Instagram Logo</title>
    <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M16.0002 11.3698C16.1236 12.2021 15.9815 13.052 15.594 13.7988C15.2065 14.5456 14.5933 15.1512 13.8418 15.5295C13.0903 15.9077 12.2386 16.0394 11.408 15.9057C10.5773 15.7721 9.80996 15.3799 9.21503 14.785C8.62011 14.1901 8.22793 13.4227 8.09426 12.592C7.9606 11.7614 8.09226 10.9097 8.47052 10.1582C8.84878 9.40667 9.45438 8.79355 10.2012 8.40605C10.948 8.01856 11.7979 7.8764 12.6302 7.99981C13.4791 8.1257 14.265 8.52128 14.8719 9.12812C15.4787 9.73496 15.8743 10.5209 16.0002 11.3698Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M17.5 6.5H17.51" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
      </a>`;
      }
    },
    {
      match: ['youtube'],
      getIcon: url => {
        return `<a class="o-SocialLinks__a-Icon--instagram" href="${url}" target="_blank" rel="noopener" aria-label="Youtube Logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Youtube Logo">
    <title>Youtube Icon</title>
    <path d="M22.5401 6.42C22.4213 5.94541 22.1794 5.51057 21.8387 5.15941C21.4981 4.80824 21.0708 4.55318 20.6001 4.42C18.8801 4 12.0001 4 12.0001 4C12.0001 4 5.12008 4 3.40008 4.46C2.92933 4.59318 2.50206 4.84824 2.16143 5.19941C1.8208 5.55057 1.57887 5.98541 1.46008 6.46C1.1453 8.20556 0.991319 9.97631 1.00008 11.75C0.988863 13.537 1.14285 15.3213 1.46008 17.08C1.59104 17.5398 1.83839 17.9581 2.17823 18.2945C2.51806 18.6308 2.9389 18.8738 3.40008 19C5.12008 19.46 12.0001 19.46 12.0001 19.46C12.0001 19.46 18.8801 19.46 20.6001 19C21.0708 18.8668 21.4981 18.6118 21.8387 18.2606C22.1794 17.9094 22.4213 17.4746 22.5401 17C22.8524 15.2676 23.0064 13.5103 23.0001 11.75C23.0113 9.96295 22.8573 8.1787 22.5401 6.42V6.42Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M9.75 15.02L15.5 11.75L9.75 8.47998V15.02Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
      </a>`;
      }
    }
  ];
  let template = iconTemplates.find((e) => e.match.some((match) => url.includes(match)));
  return ((template) ? template.getIcon(url) : '');
} 

function decorateSocialSideNav(section) {
  let heading = section.querySelector(config.anyHeadingSel);
  let links = section.querySelectorAll('a');
  let el = createTag('div', { class:'o-SocialLinks'}, heading);
  let iconsWrapper = createTag('div', {class: 'o-SocialLinks__m-IconWrapper'});
  el.append(iconsWrapper);
  section.querySelectorAll('a').forEach(link => {
    let url = link.getAttribute('href');
    let icon = getSocialLinkIconFromURL(url);
    iconsWrapper.insertAdjacentHTML('beforeend', icon);
  });
  return el;
}

function buildHeader(block, html) {
  const template = headerTemplate({});
  block.innerHTML = template;
  const navDecorators = [decorateNavHeader, decorateMainSideNav, decorateSchoolsNav, decorateSecondarySideNav, decorateLogin, decorateTertiarySideNav, decorateSocialSideNav];
  const nav = createTag('nav', { 'class': 'o-Header__m-NavMenu o-NavMenu', 'data-module': 'golf-mobile-nav', 'id': 'mod-golf-mobile-nav-1' });
  const bottomNav = createTag('div', {class:'o-NavMenu__m-Bottom'});
  const navSections = createTag('div', {}, html).children;
  if (navSections) {
    for (let i=0; i<navSections.length; i++) {
      let section = navSections[i];
      let decorator = navDecorators[i]
      let el = decorator(section);
      if (i<2) nav.append(el);
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

  let header = block.closest('.header-wrapper');
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
