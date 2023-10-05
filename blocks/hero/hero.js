import {
  parseFragment,
  render,
  removeEmptyElements,
  assignSlot,
  getBlockId,
} from '../../scripts/scripts.js';
import { createOptimizedPicture, decorateIcons } from '../../scripts/lib-franklin.js';

const placeholderHtml = '<div class="hero-container" style="visibility: hidden; max-height: 1040px; aspect-ratio: 1.57/1; width: 100%" ></div>';

export default async function decorate(block) {
  const id = getBlockId(block);

  const isFirstHero = document
    .querySelector('.hero.block[data-block-name="hero"]')
    .isEqualNode(block);

  // setting placeholder data
  block.innerHTML = placeholderHtml;

  // rendering content upon fetch complete
  document.addEventListener(`query:${id}`, (event) => {
    const heroItems = event.detail.data;

    const heroData = heroItems[0];
    // TODO Add support for multiple queries
    const cards = isFirstHero ? heroItems.slice(1, 4) : [];

    assignSlot(block, 'image', 'picture');

    let cardsTemplate = '';

    if (!block.classList.contains('no-cards')) {
      cardsTemplate = cards
        .map(
          (card) => `
              <a href='${card.path}'>
                ${
  createOptimizedPicture(card.image, card.imageAlt || card.title, isFirstHero, [{ width: '240' }])
    .outerHTML
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
      { media: '(min-width: 686px)', width: '1500' },
      { media: '(min-width: 768px)', width: '2000' },
      { media: '(min-width: 1024px)', width: '1280' },
      { media: '(min-width: 1280px)', width: '2500' },
      { width: '3000' },
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
            <span class="icon icon-arrow-right icon-container"></span>
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

    decorateIcons(block);
  });

  // Trigger query
  window.store.query(block);
}
