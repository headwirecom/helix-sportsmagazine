import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  parseFragment,
  removeEmptyElements,
  render,
  convertExcelDate,
  timeSince,
  getBlockId,
} from '../../scripts/scripts.js';

const placeholderHtml = `
<div class="card-block-wrapper" style="visibility: hidden;">
  <div class="main-card" style="aspect-ratio: 1/1; width: 50%; flex: 0;"></div>
  <div class="secondary-cards" style="aspect-ratio: 1/1; width: 50%; flex: 0;"></div>
</div>
`;

export default async function decorate(block) {
  const id = getBlockId(block);

  const cardBlocks = [...document.querySelectorAll(".cards.block[data-block-name='cards']:not(.latest)")];
  const indexInPage = cardBlocks.findIndex((element) => element.isEqualNode(block));

  const isLatestCardBlock = block.classList.contains('latest');

  const cardsTitle = block.querySelector('.cards.block h3, .cards.block h3')?.innerText || '';

  const gdPlusCards = block.classList.contains('gd');

  const reverse = !(indexInPage <= 0 || indexInPage % 2 === 0);

  // let cardOffset = 4;
  // if (block.classList.contains('hero')) {
  //   cardOffset = 2;
  // } else if (block.classList.contains('latest')) {
  //   cardOffset = 10;
  // } else if (block.classList.contains('columns')) {
  //   cardOffset = 5;
  // }

  // using placeholder html
  block.innerHTML = placeholderHtml;

  // Rendering content upon fetch complete
  document.addEventListener(`query:${id}`, (event) => {
    const cardData = event.detail.data;

    const mainCard = cardData[0];

    const generateMainCard = (card = mainCard) => {
      if (isLatestCardBlock) {
        return '<div class="latest-rail"></div>';
      }
      return `
      <a class="main-card" href="${card.href || card.path}">
        <div class="image-bg">
          ${createOptimizedPicture(card.image, card.imageAlt || card.title, false, [{ width: '700' }]).outerHTML}
        </div>
        <div class="main-text-wrapper">
          <div class="section">${card.rubric}</div>
          ${
  !gdPlusCards
    ? ''
    : `<img loading="lazy" src="/icons/${
      gdPlusCards ? 'gd-plus-light' : 'gd-plus-dark'
    }.svg" class="gd-plus-icon-img" alt="Golf Digest Plus Icon" />`
}
          <div class="headline"><h3>${card.title}</h3></div>
        </div>
      </a>
      `;
    };

    const generateSecondaryCards = (cardArray = cardData.splice(1)) => cardArray
      .map(
        (card) => `
        <a class="small-card" href="${card.href || card.path}">
          <div class="image-wrapper">
            ${createOptimizedPicture(card.image, card.imageAlt || card.title, false, [{ width: '350' }]).outerHTML}
          </div>
          <div class="small-text-wrapper">
            <div class="section">${card.rubric}</div>
            ${
  !gdPlusCards && !card?.gdPlus
    ? ''
    : '<img loading="lazy" src="/icons/gd-plus-dark.svg" class="gd-plus-icon-img" alt="Golf Digest Plus Icon" />'
}
            <div class="headline"><h3>${card.title}</h3></div>
            <div class="date-string">${timeSince(convertExcelDate(card.dateValue))}</div>
          </div>
        </a>
      `,
      )
      .join('');

    const HTML_TEMPLATE = `
    ${cardsTitle ? `<div class="cards-title-wrapper"><h2 class="cards-title">${cardsTitle}</div>` : ''}
    <div class="card-block-wrapper ${reverse ? 'reverse' : ''}">
      ${
  block.classList.contains('hero')
    ? cardData.map((card) => generateMainCard(card)).join('')
    : `
        ${generateMainCard()}
        ${!gdPlusCards ? '' : '<div class="gd-cards-wrapper">'}
        <div class="secondary-cards">
          ${!gdPlusCards ? '' : '<h2 class="gd-plus-title">GD+ Latest</h2>'}
          ${generateSecondaryCards(isLatestCardBlock ? cardData : cardData.splice(1))}
        </div>
        ${!gdPlusCards ? '' : '</div>'}
    `
}</div>`;

    // Template rendering
    const template = parseFragment(HTML_TEMPLATE);
    // Render template
    render(template, block);

    // Post-processing
    removeEmptyElements(template, 'p');

    block.innerHTML = '';
    block.append(template);
  });

  // Trigger query
  window.store.query(block);
}
