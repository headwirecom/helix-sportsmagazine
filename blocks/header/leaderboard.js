const LEADERBOARD_URL = '/bin/leaderboard/leaders.json';

const LEADERBOARD_HTML = `
<div class="leaderboard"><span style="display: none" class="clicktracking" data-resource-type="golfdigestcom/components/general/leaderboard"></span>
<div class="o-leaderboard" data-module="leaderboard" id="mod-leaderboard-1" style="display: flex;">
    <div class="o-leaderboard__a-Data hidden" data-year="2023" data-partner="pga" data-event-id="R2023521" data-event-title="The CJ Cup"></div>
    <div class="o-leaderboard-event-info">
        <h4 class="o-leaderboard-event-info-event-title">
        The CJ Cup
        </h4>
        <p class="o-leaderboard-event-info-event-location">
        Congaree Golf Club
        </p>
    </div>
    <div class="o-leaderboard-players"></div>
    <div class="o-leaderboard-link-container">
        <a target="_blank" rel="noopener noreferrer" href="https://www.pgatour.com/leaderboard.html" class="o-leaderboard-link-container-link">
        Full Leaderboard
        <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arrow Icon">
            <path d="M1.70612 0.819317L1.53333 0.654091L1.36055 0.819317L0.827218 1.32933L0.638272 1.51001L0.827218 1.69069L3.57161 4.31506L0.827218 6.93943L0.638272 7.12012L0.827218 7.3008L1.36055 7.81081L1.53333 7.97604L1.70612 7.81081L5.17278 4.49575L5.36173 4.31506L5.17278 4.13438L1.70612 0.819317Z" fill="#151517" stroke="#151517" stroke-width="0.5"></path>
        </svg>
        </a>
    </div>
</div>
`;

async function fetchLeaderboard() {
  const resp = await fetch(LEADERBOARD_URL);
  if (resp.ok) {
    const leaderboard = await resp.json();
    return leaderboard;
  }
  return {};
}

function createLeaderboardPlayerHTML(data) {
  const html = `
    <div class="o-leaderboard-players-player">
        <div class="o-leaderboard-players-player-main">
            <h4 class="o-leaderboard-players-player-main-place">${data.Position}</h4>
            <div class="o-leaderboard-players-player-main-name">
              <i style="background-image:url(${data.CountryFlag});"></i><h5>${data.FirstName} ${data.LatsName}</h5>
            </div>
            <p class="o-leaderboard-players-player-main-record">${data.Rounds.length} ${data.TotalScoreToPar}</p>
        </div>
        <div class="o-leaderboard-players-player-score">
            <p>${data.TotalScoreToPar}</p>
        </div>
    </div>
    `;
  return html.trim();
}

export default function createLeaderboard(block) {
  const headerContainer = block.closest('.header-wrapper');
  if (headerContainer) {
    headerContainer.insertAdjacentHTML('beforebegin', LEADERBOARD_HTML);
  } else {
    block.insertAdjacentHTML('beforebegin', LEADERBOARD_HTML);
  }

  const playersEl = document.body.querySelector('.o-leaderboard-players');
  fetchLeaderboard(LEADERBOARD_URL).then((json) => {
    const { data } = json;
    if (data) {
      data.forEach((player) => {
        const playerHTML = createLeaderboardPlayerHTML(player);
        const div = document.createElement('div');
        div.innerHTML = playerHTML;
        playersEl.append(div.firstChild);
      });
    }
  });
}
