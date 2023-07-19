import {
  assignSlot,
  parseFragment,
  parseSectionMetadata,
  removeEmptyElements,
  render,
} from '../../scripts/scripts.js';
import {
  buildBlock, decorateBlock, getMetadata, loadBlocks,
} from '../../scripts/lib-franklin.js';

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const rubric = getMetadata('rubric');
  const author = getMetadata('author');
  const authorURL = getMetadata('author-url');
  const publicationDate = getMetadata('publication-date');
  const headlineMetadata = parseSectionMetadata(block.querySelector('.template-section-metadata'));

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
    <div class="container">
      <article class="article-content dark">
        <div class="lead">
          <div class="headline">
            <p class="rubric">
              <span>${rubric}</span>
            </p>
            <div class="title">
              <slot name="heading"></slot>
            </div>
            <div class="description">
              <slot name="description"></slot>
            </div>
            <div class="byline">
              <div class="attribution">
                  <span>By&nbsp;</span>
                  <a href="${authorURL}">${author}</a>
              </div>
              <div class="publication">
                  <span>${publicationDate}</span>
              </div>
            </div>
          </div>
          <div class="image">
              <slot name="image"></slot>
          </div>
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
            <div class="credit">Photo by: ${headlineMetadata.photoCredit}</div>
          </div>
        </div>
        <div class="article-body">
          <slot></slot>
          <slot name="share"></slot>  
        </div>
      </article>
    </div>
    `;

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // Identify slots
  assignSlot(block, 'heading', 'h1');
  assignSlot(block, 'description', 'h1 + p');
  assignSlot(block, 'image', 'picture');

  // Pre-processing
  block.querySelectorAll('.template-section-metadata').forEach((metadataEl) => {
    const section = metadataEl.parentElement;
    const sectionMetadata = parseSectionMetadata(metadataEl);
    if (sectionMetadata.photoCredit) {
      const picture = section.querySelector('picture');
      if (picture) {
        picture.insertAdjacentHTML('afterend', `<div class="photo-credit">${sectionMetadata.photoCredit}</div>`);
      }
    }
  });

  block.querySelectorAll(':scope > div > div > div:not(:first-of-type):not(:last-of-type)').forEach((section) => {
    section.append(document.createElement('hr'));
  });

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
  removeEmptyElements(template, 'p');
  template.querySelector('.article-body div > p').classList.add('highlight');

  // Update block with rendered template
  block.innerHTML = '';
  block.append(...template.children);

  // Inner block loading
  block.querySelectorAll('.social-share, .embed').forEach((innerBlock) => decorateBlock(innerBlock));
  loadBlocks(document.querySelector('main'));

  // Toggle dark theme on scroll
  const article = block.querySelector('.article-content');
  requestAnimationFrame(() => {
    new IntersectionObserver((entries) => {
      const { bottom, top } = entries[0].boundingClientRect;
      const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
      article.classList.toggle('dark', !(bottom < 0 || top - viewHeight >= 0));
    }).observe(block.querySelector('.lead .image'));
  });
}