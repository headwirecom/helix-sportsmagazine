const LEADERBOARD_URL = '/bin/leaderboard/leaders.json';

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
              <i style="background-image:url(${data.CountryFlag});"></i><h5>${data.FirstName} ${data.LastName}</h5>
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

export default function createLeaderboard(block, leaderboardEl) {
  const headerContainer = block.closest('.header-wrapper');
  if (headerContainer) {
    headerContainer.insertAdjacentElement('beforebegin', leaderboardEl);
  } else {
    block.insertAdjacentElement('beforebegin', leaderboardEl);
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
