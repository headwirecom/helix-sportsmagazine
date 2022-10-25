import { readBlockConfig, decorateIcons } from '../../scripts/scripts.js';
import { leaderboardTemplate } from '../templates.js';
import { loadJsonData } from '../../utils/utils.js';

const LEADERBOARD_URL = '/bin/leaderboard/leaders.json';

function createLeaderboardPlayerHTML(data) {
  let html = `
  <div class="o-Leaderboard__m-Players__m-Player">
      <div class="o-Leaderboard__m-Players__m-PlayerMain">
          <h4 class="o-Leaderboard__m-Players__m-PlayerMain__a-Place">${data.Position}</h4>
          <div class="o-Leaderboard__m-Players__m-PlayerMain__a-Name">
            <i style="background-image:url(${data.CountryFlag}});"></i><h5>${data.FirstName} ${data.LatsName}</h5>
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

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // insert leaderboard
  createLeaderBoard(block);

  // fetch nav content
  const navPath = cfg.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.innerHTML = html;
    decorateIcons(nav);

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((e, j) => {
      const section = nav.children[j];
      if (section) section.classList.add(`nav-${e}`);
    });

    const navSections = [...nav.children][1];
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          collapseAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
      });
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
    hamburger.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      document.body.style.overflowY = expanded ? '' : 'hidden';
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    decorateIcons(nav);
    block.append(nav);
  }
}
