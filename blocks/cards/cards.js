import {
  parseFragment,
  removeEmptyElements,
  render,
  convertExcelDate,
  timeSince,
} from '../../scripts/scripts.js';

let cardData;

async function getCardData() {
  const response = await fetch('/blocks/cards/mockData.json');
  cardData = await response.json();
}

const prependImage = 'https://main--helix-sportsmagazine--headwirecom.hlx.live/';

export default async function decorate(block) {
  if (!cardData) {
    await getCardData();
  }

  const cardsType = Array.from(block.classList).filter(
    (className) => className !== 'cards' && className !== 'block',
  )[0];
  if (cardsType === 'latest') {
    return
  }

  const cardLinks = [...block.querySelectorAll('p>a[href]')].map((element) => element.href);
  console.log("\x1b[31m ~ cardLinks:", cardLinks)

  const gdPlusCards = block.classList.contains('gd');

  const cardBlocks = [...document.querySelectorAll(".cards.block[data-block-name='cards']")];
  const indexInPage = cardBlocks.findIndex((element) => element.isEqualNode(block));
  const reverse = !(indexInPage === 0 || indexInPage % 2 === 0);

  const cardList = cardLinks.map((cardLink) => {
    const cardSearchQuery = cardLink.split('/').slice(3).join('/');
    const cardObj = cardData.data.find((obj) => obj.path === cardSearchQuery);
    if (cardObj) {
      cardObj.href = cardLink;
      cardObj.image = prependImage + cardObj.image;
    }
    return cardObj;
  });


  const mainCard = cardList[0];

  const generateMainCard = (card = mainCard) => {
    console.log("\x1b[34m ~ card:", card)
    return `
    <a class="main-card" href="${card.href}">
      <div class="image-bg">
        <img loading="lazy" src="${card.image}" alt="${card.imageAlt}"/>
      </div>
      <div class="main-text-wrapper">
        <div class="section">${card.author}</div>
        ${!gdPlusCards ? '' : `<img loading="lazy" src="/icons/${gdPlusCards ? 'gd-plus-light' : 'gd-plus-dark'}.svg" class="gd-plus-icon-img" alt="Golf Digest Plus Icon" />`}
        <div class="headline"><h3>${card.title}</h3></div>
      </div>
    </a>
    `
  }

  const generateSecondaryCards = () => cardList.splice(1).map((card) => `
    <a class="small-card" href="${card.href}">
      <div class="image-wrapper">
        <img loading="lazy" src="${card.image}" alt="${card.imageAlt}"/>
      </div>
      <div class="small-text-wrapper">
        <div class="section">${card.author}</div>
        ${!gdPlusCards ? '' : '<img loading="lazy" src="/icons/gd-plus-dark.svg" class="gd-plus-icon-img" alt="Golf Digest Plus Icon" />'}
        <div class="headline"><h3>${card.title}</h3></div>
        <div class="date-string">${timeSince(convertExcelDate(card.date))}</div>
      </div>
    </a>
  `).join('')

  const HTML_TEMPLATE = `
  <div class="card-block-wrapper ${reverse ? 'reverse' : ''}">
    ${cardsType === 'hero' ?
      cardList.map((card) => generateMainCard(card)).join("") : `
      ${generateMainCard()}
      ${!gdPlusCards ? '' : '<div class="gd-cards-wrapper">'}
      <div class="secondary-cards">
        ${!gdPlusCards ? '' : `
          <h2 class="gd-plus-title">GD+ Latest</h2> 
        `}
        ${generateSecondaryCards()}
      </div>
      ${!gdPlusCards ? '' : '</div>'}
    `}
  </div>
  `;

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);
  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, 'p');

  block.innerHTML = '';
  block.append(template);
}
