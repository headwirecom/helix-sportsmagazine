import {
  ARTICLE_TEMPLATES,
  assignSlot,
  parseFragment,
  render,
} from '../../scripts/scripts.js';
import {
  createOptimizedPicture, decorateBlock,
} from '../../scripts/lib-franklin.js';

const arrowIcon = '<svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arrow Icon White" class="arrow-icon"><path d="M1.70612 0.819317L1.53333 0.654091L1.36055 0.819317L0.827218 1.32933L0.638272 1.51001L0.827218 1.69069L3.57161 4.31506L0.827218 6.93943L0.638272 7.12012L0.827218 7.3008L1.36055 7.81081L1.53333 7.97604L1.70612 7.81081L5.17278 4.49575L5.36173 4.31506L5.17278 4.13438L1.70612 0.819317Z" fill="#ffffff" stroke="#ffffff" stroke-width="0.5"></path></svg>';

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const heroImage = block.querySelector('picture img');
  const heroImageAlt = block.querySelector('p:has(picture) + p');
  const heroLink = block.querySelector('a');

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
    <div class="tiger-vault-container">
    <a class="hero-link" href="${heroLink.href}">
      <div class="hero-container">
        <div class="title-wrapper">
          <slot name="heading"></slot>
          <div class="cta-wrapper">
            <div class="red-arrow">${arrowIcon}</div>
            <slot name="cta"></slot>
          </div>
        </div>
        <div class="tiger-hero-image-wrapper image-link-hover-animation">
          ${createOptimizedPicture(heroImage.src, heroImageAlt.innerText || 'Tiger Vault Hero Image', true, [{ width: '800' }]).outerHTML}
        </div>
        </div>
        </a>

      <div class="content-wrapper">
        <div class="overview-container">
          <slot name="overview-title"></slot>
          <slot name="overview-description"></slot>
        </div>
            
        <slot name="tiger-cards-block"></slot>
      </div>
    </div>
    `;

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // Identify slots
  assignSlot(block, 'heading', 'h1');
  assignSlot(block, 'image', 'picture');
  assignSlot(block, 'cta', '.button-container a');
  assignSlot(block, 'overview-title', 'div + div > h2');
  assignSlot(block, 'overview-description', 'div + div > p');

  const tigerCardsBlock = block.querySelector('.tiger-cards');
  if (tigerCardsBlock) {
    decorateBlock(tigerCardsBlock);
    assignSlot(block, 'tiger-cards-block', '.tiger-cards');
  }

  // Render template
  render(template, block, ARTICLE_TEMPLATES.TheTigerVault);

  // Post-processing

  // Update block with rendered template
  block.innerHTML = '';
  block.append(template);
}
