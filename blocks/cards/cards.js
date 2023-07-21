import {
  parseFragment,
  removeEmptyElements,
  render,
  convertExcelDate,
  timeSince,
} from '../../scripts/scripts.js';

const gdPlusIcon = '<svg width="51" height="19" viewBox="0 0 51 19" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" class="gd-plus-logo" aria-label="GD Plus Logo" aria-hidden="true"><path class="gd-text" d="M12.231 17.6625C11.8994 17.8282 11.2644 18.0211 10.7676 18.0763V18.464C14.0812 18.3806 16.4007 17.8292 17.8932 17.1663V10.5952H12.231V17.6625Z" ></path><path class="gd-text" d="M17.4505 4.85311V1.15447C16.2639 0.82303 14.3307 0.60256 12.2871 0.573V0.96065C14.3855 1.95545 15.8766 3.08689 17.4505 4.85311Z" ></path><path class="gd-text" d="M7.37138 9.5175C7.37138 4.30023 8.94531 1.53921 11.21 0.96016V0.57251C5.02429 0.98632 0.9375 4.24402 0.9375 9.5165C0.9375 14.6528 4.55459 18.1838 10.0224 18.4605V18.0728C8.03449 17.7162 7.37138 14.5138 7.37138 9.5175Z" ></path><path class="gd-text" d="M27.4187 0.823H21.1777V18.2143H27.4187V0.823Z" ></path><path class="gd-text" d="M28.3848 0.823V1.23778C30.8429 1.45825 32.0019 3.16972 32.0019 9.5189C32.0019 15.5919 30.79 17.6338 28.4148 17.8276V18.2153C34.6277 18.1324 38.4386 15.2062 38.4386 9.5199C38.4367 3.30782 34.4876 0.90634 28.3848 0.823Z" ></path><path d="M46.6875 5.22485H44.8125V13.8499H46.6875V5.22485Z" fill="#ED3E49"></path><path d="M41.4375 8.5999V10.4749H50.0625V8.5999H41.4375Z" fill="#ED3E49"></path></svg>'; // prettier-ignore

export default async function decorate(block) {
  const cardLinks = [...block.querySelectorAll('p>a[href]')].map((element) => element.href);

  const gdPlusCards = block.classList.contains('gd');

  const cardBlocks = [...document.querySelectorAll(".cards.block[data-block-name='cards']")];
  const indexInPage = cardBlocks.findIndex((element) => element.isEqualNode(block));
  const reverse = !(indexInPage === 0 || indexInPage % 2 === 0);

  const response = await fetch('/blocks/cards/mockData.json');
  const data = await response.json();

  const prependImage = 'https://main--helix-sportsmagazine--headwirecom.hlx.live/';

  const cardList = cardLinks.map((cardLink) => {
    const cardSearchQuery = cardLink.split('/').slice(3).join('/');
    const cardObj = data.data.find((obj) => obj.path === cardSearchQuery);
    if (cardObj) {
      cardObj.href = cardLink;
      cardObj.image = prependImage + cardObj.image;
    }
    return cardObj;
  });

  const mainCard = cardList[0];

  const HTML_TEMPLATE = `
  <div class="card-block-wrapper ${reverse ? 'reverse' : ''}">
    <a class="main-card" href="${mainCard.href}">
      <div class="image-bg">
        <img src="${mainCard.image}" alt="${mainCard.imageAlt}"/>
      </div>
      <div class="main-text-wrapper">
        <div class="section">${mainCard.author}</div>
        ${!gdPlusCards ? '' : gdPlusIcon}
        <div class="headline"><span aria-level="3" role="heading">${mainCard.title}</span></div>
      </div>
    </a>
    <div class="secondary-cards">
      ${
  !gdPlusCards
    ? ''
    : `
        <h2 class="gd-plus-title">GD+ Latest</h2>
      `
}
      ${cardList
    .splice(1)
    .map((card) => `
            <a class="small-card" href="${card.href}">
              <div class="image-wrapper">
                <img src="${card.image}" alt="${card.imageAlt}"/>
              </div>
              <div class="small-text-wrapper">
                <div class="section">${card.author}</div>
                ${!gdPlusCards ? '' : gdPlusIcon}
                <div class="headline"><span aria-level="3" role="heading">${card.title}</span></div>
                <div class="date-string">${timeSince(convertExcelDate(card.date))}</div>
              </div>
            </a>
          `)
    .join('')}
    </div>
  </div>
  `;

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);
  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, 'p');

  block.innerHTML = '';
  block.append(...template.children);
}
