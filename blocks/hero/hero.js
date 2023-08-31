import {
  parseFragment,
  render,
  removeEmptyElements,
  assignSlot,
  getBlockId,
} from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const arrowIcon = '<svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arrow Icon White" class="arrow-icon"><path d="M1.70612 0.819317L1.53333 0.654091L1.36055 0.819317L0.827218 1.32933L0.638272 1.51001L0.827218 1.69069L3.57161 4.31506L0.827218 6.93943L0.638272 7.12012L0.827218 7.3008L1.36055 7.81081L1.53333 7.97604L1.70612 7.81081L5.17278 4.49575L5.36173 4.31506L5.17278 4.13438L1.70612 0.819317Z" fill="#ffffff" stroke="#ffffff" stroke-width="0.5"></path></svg>';

let heroItems;
let heroItemsIndex = 0;

const placeholderHtml = '<div class="hero-container" style="visibility: hidden; max-height: 1040px; aspect-ratio: 1.57/1; width: 100%" ></div>';

export default async function decorate(block) {
  const id = getBlockId(block);

  const isFirstHero = document
    .querySelector('.hero.block[data-block-name="hero"]')
    .isEqualNode(block);

  const heroDataIndex = heroItemsIndex;
  heroItemsIndex += isFirstHero ? 5 : 1;

  // settings placeholder data
  if (!heroItems) {
    block.innerHTML = placeholderHtml;
  }

  // rendering content upon fetch complete
  document.addEventListener(`query:${id}`, (event) => {
    heroItems = event.detail.data;

    const heroData = heroItems[heroDataIndex];
    // TODO Add support for multiple queries
    const cards = heroItems.slice(heroDataIndex + 1, heroDataIndex + 5);

    assignSlot(block, 'image', 'picture');

    let cardsTemplate = '';

    if (!block.classList.contains('no-cards')) {
      cardsTemplate = cards
        .map(
          (card) => `
              <a href='${card.path}'>
                ${
  createOptimizedPicture(
    card.image,
    card.imageAlt || card.title,
    isFirstHero,
    [{ width: '120' }],
  ).outerHTML
}
                <div>
                  <span>${card.rubric}</span>
                  <p class="hero-card-title">${card.title}</p>
                </div>
              </a>
            `,
        )
        .join('');
    }

    if (!block.classList.contains('no-cards')) {
      if (isFirstHero && cards.length) {
        block.classList.add('with-cards');
      } else {
        block.classList.add('no-cards');
      }
    }

    // HTML template in JS to avoid extra waterfall for LCP blocks
    const HTML_TEMPLATE = `
    <div class="hero-container">
        <div class="hero-image-container">
        ${
  createOptimizedPicture(
    heroData.image,
    heroData.imageAlt || heroData.title,
    isFirstHero,
    [
      { media: '(min-width: 686px)', width: '686' },
      { media: '(min-width: 966px)', width: '966' },
      { media: '(min-width: 1280px)', width: '1280' },
      { width: '1850' },
    ],
  ).outerHTML
}
        </div>
        <div class="hero-text-container">
        <a href='${heroData.path}'>
            <div>
            <${isFirstHero ? 'h1' : 'h2'}>${
  block.classList.contains('no-cards') ? heroData.title : heroData.rubric
}</${isFirstHero ? 'h1' : 'h2'}>
            ${
  block.classList.contains('no-cards')
    ? ''
    : `<p>${heroData.title}</p>`
}
            </div>
            <div class="button-container">
            <div class="icon-container">${arrowIcon}</div>
            <span>${
  block.classList.contains('no-cards')
    ? 'Watch series'
    : 'Read story'
}</span>
            </div>
        </a>
        </div>
        ${
  cardsTemplate
    ? `<div class="hero-cards-container">${cardsTemplate}</div>`
    : ''
}
    </div>
`;

    // Parse the HTML template into a document fragment
    const template = parseFragment(HTML_TEMPLATE);

    // Render the template onto the block element
    render(template, block);

    // Post-processing
    removeEmptyElements(template, 'p');

    // Default text alignment
    if (
      !block.classList.contains('text-center')
      && !block.classList.contains('text-right')
    ) {
      block.classList.add('text-left');
    }

    // Clear the original block content
    block.innerHTML = '';
    block.append(template);
  });

  // Trigger query
  window.store.query(block);
}
