import { parseFragment, render } from '../../scripts/scripts.js';
import {
  buildBlock, decorateBlock, getMetadata, loadBlocks,
} from '../../scripts/lib-franklin.js';

const rubric = getMetadata('rubric');
const author = getMetadata('author');
const authorURL = getMetadata('author-url');
const publicationDate = getMetadata('publication-date');
const imageCredit = getMetadata('image-credit');

// HTML template in JS to avoid extra waterfall for LCP blocks
const HTML_TEMPLATE = `
<div class="container">
  <div class="container-article">
    <article class="article-content">
      <p class="rubric">
        <span>${rubric}</span>
      </p>
      <div class="title">
        <slot name="heading"></slot>
      </div>
      <div class="description"></div>
      <div class="byline">
        <div class="attribution">
            <span>By</span>
            <a href="${authorURL}">${author}</a>
        </div>
        <div class="publication">
            <span>${publicationDate}</span>
        </div>
        <div class="sharing">
            <slot name="share"></slot>
        </div>
      </div>
      <div class="lead">
        <slot name="image"></slot>
        <div class="credit">
            <span>${imageCredit}</span>
        </div>
      </div>
      <div class="tags"></div>
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
  const heading = block.querySelector('h1');
  if (heading) {
    heading.setAttribute('slot', 'heading');
  }
  const image = block.querySelector('picture');
  if (image) {
    image.setAttribute('slot', 'image');
  }

  // Pre-processing
  const share = buildBlock('social-share', { elems: [] });
  share.setAttribute('slot', 'share');
  block.append(share);

  const embeds = ['youtube', 'twitter', 'brightcove'];
  block.querySelectorAll(embeds.map((embed) => `a[href*="${embed}"]`).join(',')).forEach((embedLink) => {
    const parent = embedLink.parentElement;
    const embed = buildBlock('embed', { elems: [embedLink] });
    parent.replaceWith(embed);
  });

  // Render template
  render(template, block);

  // Post-processing
  template.querySelectorAll('p').forEach((p) => {
    if (p.innerHTML.trim() === '') {
      p.remove();
    }
  });

  // Update block with rendered template
  block.innerHTML = '';
  block.append(...template.children);

  // Inner block loading
  block.querySelectorAll('.social-share, .embed').forEach((innerBlock) => decorateBlock(innerBlock));
  loadBlocks(document.querySelector('main'));
}
