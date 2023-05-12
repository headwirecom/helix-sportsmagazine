const LEADERBOARD_URL = '/bin/leaderboard/leaders.json';

const LEADERBOARD_HTML = `
<div class="leaderboard"><span style="display: none" class="clicktracking" data-resource-type="golfdigestcom/components/general/leaderboard"></span>
<div class="o-Leaderboard" data-module="leaderboard" id="mod-leaderboard-1" style="display: flex;">
    <div class="o-Leaderboard__a-Data hidden" data-year="2023" data-partner="pga" data-event-id="R2023521" data-event-title="The CJ Cup"></div>
    <div class="o-Leaderboard__m-EventInfo">
        <h4 class="o-Leaderboard__m-EventInfo__a-EventTitle">
        The CJ Cup
        </h4>
        <p class="o-Leaderboard__m-EventInfo__a-EventLocation">
        Congaree Golf Club
        </p>
    </div>
    <div class="o-Leaderboard__m-Players"></div>
    <div class="o-Leaderboard__m-LinkContainer">
        <a target="_blank" rel="noopener noreferrer" href="https://www.pgatour.com/leaderboard.html" class="o-Leaderboard__m-LinkContainer__a-Link">
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

export default function createLeaderboard(block) {
  block.insertAdjacentHTML('beforebegin', LEADERBOARD_HTML);
  const playersEl = document.body.querySelector('.o-Leaderboard__m-Players');
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
