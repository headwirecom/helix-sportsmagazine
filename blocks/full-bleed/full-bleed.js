import {
  assignSlot, parseFragment, render, replaceLinksWithEmbed,
} from '../../scripts/scripts.js';
import {
  buildBlock,
  decorateBlock,
  getMetadata,
  loadBlocks,
} from '../../scripts/lib-franklin.js';

const rubric = getMetadata('rubric');
const author = getMetadata('author');
const authorURL = getMetadata('author-url');
const publicationDate = getMetadata('publication-date');
const imageCredit = getMetadata('hero-image-credit');

// HTML template in JS to avoid extra waterfall for LCP blocks
const HTML_TEMPLATE = `
<div class="container">
  <div class="container-article">
    <article class="article-content">
    <div class="lead">
            <div class="headline">
              <p class="rubric">
                <span>${rubric}</span>
              </p>
              <div class="title">
                <slot name="heading"></slot>
              </div>
              <div class="byline">
                <div class="attribution">
                    <span>By</span>
                    <a href="${authorURL}">${author}</a>
                </div>
                <div class="publication">
                    <span>${publicationDate}</span>
                </div>
              </div>
            </div>
            <div class="image">
                <slot name="image"></slot>
                <div class="credit">
                 <span>${imageCredit}</span>
                </div>
            </div>
            <div class="byline">
              <div class="attribution">
                  <span>By</span>
                  <a href="${authorURL}">${author}</a>
                  <span class="publication">${publicationDate}</span>
              </div>
              <div class="sharing">
                  <slot name="share"></slot>
              </div>
            </div>
          </div>
          <div class="article-body">
            <slot></slot>
            <slot name="share"></slot>  
          </div>
   
    </article>
    <div class="container-aside">
        <!-- ADVERTISEMENT HERE -->    
    </div>
  </div>
</div>
`;

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // Identify slots
  assignSlot(block, 'heading', 'h1');
  assignSlot(block, 'image', 'picture');

  // Pre-processing
  const share = buildBlock('social-share', { elems: [] });
  share.setAttribute('slot', 'share');
  block.append(share);

  replaceLinksWithEmbed(block);

  // Render template
  render(template, block);

  // Update block with rendered template
  block.innerHTML = '';
  block.append(template);

  // Inner block loading
  block
    .querySelectorAll('.social-share, .embed')
    .forEach((innerBlock) => decorateBlock(innerBlock));
  loadBlocks(document.querySelector('main'));
}
