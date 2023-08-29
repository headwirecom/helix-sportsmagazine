import {
  ARTICLE_TEMPLATES,
  addPhotoCredit,
  addPortraitClass,
  assignSlot,
  normalizeAuthorURL,
  parseFragment,
  parseSectionMetadata,
  premiumArticleBanner,
  removeEmptyElements,
  render,
  replaceLinksWithEmbed,
} from '../../scripts/scripts.js';
import {
  buildBlock, createOptimizedPicture, decorateBlock, getMetadata, loadBlocks,
} from '../../scripts/lib-franklin.js';

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
console.log("\x1b[31m ~ block:", block.outerHTML)

const heroImage = block.querySelector('picture img')
const heroImageAlt = block.querySelector('p:has(picture) + p')
console.log("\x1b[31m ~ heroImageAlt:", heroImage.src)



  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
    <div class="container">
      <div class="container-hero">
        <div class="title-wrapper">
          <slot name="heading"></slot>
          <slot name="cta"></slot>
        </div>
        <div class="tiger-hero-image-wrapper"
          ${createOptimizedPicture(heroImage.src, heroImageAlt.innerText || 'Tiger Vault Hero Image', true, [{width: '800'}]).outerHTML}
        </div>
      </div>

      <div class="overview-container">
        <slot name="overview-title"></slot>
        <slot name="overview-description"></slot>
      </div>
          
      <slot name="tiger-series-block"></slot>
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






  // Render template
  render(template, block, ARTICLE_TEMPLATES.TheTigerVault);

  // Post-processing


  // Update block with rendered template
  block.innerHTML = '';
  block.append(template);

  // // Inner block loading
  // block.querySelectorAll('.social-share, .embed, .more-cards').forEach((innerBlock) => decorateBlock(innerBlock));
  // loadBlocks(document.querySelector('main'));
}
