import {
  parseFragment,
  render,
  removeEmptyElements, assignSlot,
} from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const arrowIcon = '<svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arrow Icon White" class="arrow-icon"><path d="M1.70612 0.819317L1.53333 0.654091L1.36055 0.819317L0.827218 1.32933L0.638272 1.51001L0.827218 1.69069L3.57161 4.31506L0.827218 6.93943L0.638272 7.12012L0.827218 7.3008L1.36055 7.81081L1.53333 7.97604L1.70612 7.81081L5.17278 4.49575L5.36173 4.31506L5.17278 4.13438L1.70612 0.819317Z" fill="#ffffff" stroke="#ffffff" stroke-width="0.5"></path></svg>';

export default async function decorate(block) {
  const heroLink = block.querySelector('.button-container > a');
  heroLink.parentElement.remove();

  assignSlot(block, 'image', 'picture');

  const cards = block.querySelectorAll(':scope > div:nth-child(2) a');
  if (cards.length) {
    cards.forEach((card, i) => {
      card.setAttribute('slot', `card-${i}`);
    });
  }

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
    <div class="hero-container">
      <div class="hero-image-container">
        <slot name="image"></slot>
      </div>
      <div class="hero-text-container">
        <a href="${heroLink.href}">
            <slot></slot>
            <div class="button-container">
                <div class="icon-container">${arrowIcon}</div>
                <span>${heroLink.textContent}</span>
            </div>
        </a>
      </div>
      ${cards.length ? `<div class="hero-cards-container">
        ${[...cards].map((card, i) => `<slot name='card-${i}'></slot>`).join('')}
      </div>` : ''}
    </div>
  `;

  // Parse the HTML template into a document fragment
  const template = parseFragment(HTML_TEMPLATE);

  // Render the template onto the block element
  render(template, block);

  // Post-processing
  removeEmptyElements(template, 'p');

  // Default text alignment
  if (!block.classList.contains('text-center') && !block.classList.contains('text-right')) {
    block.classList.add('text-left');
  }

  // Clear the original block content
  block.innerHTML = '';
  block.append(template);

  // Lazy load cards
  if (cards) {
    fetch('/blocks/hero/mockData.json')
      .then((req) => req.json())
      .then((res) => {
        const { data } = res;
        block.querySelectorAll('.hero-cards-container a').forEach((link) => {
          const card = data.find(({ path }) => path === new URL(link.href).pathname);
          if (card) {
            link.innerHTML = '';
            link.append(
              createOptimizedPicture(`https://main--helix-sportsmagazine--headwirecom.hlx.live${card.image.split('?')[0]}`),
              parseFragment(`
                <div>
                    <span>${card.author}</span>
                    <h3>${card.title}</h3>
                </div>
              `),
            );
          }
        });
      });
  }
}
