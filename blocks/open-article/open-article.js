import {
  assignSlot, parseFragment, removeEmptyElements, render,
} from '../../scripts/scripts.js';
import {
  buildBlock, decorateBlock, getMetadata, loadBlocks,
} from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const author = getMetadata('author');
  const authorURL = getMetadata('author-url');
  const publicationDate = getMetadata('publication-date');
  const imageCredit = getMetadata('image-credit');
  const imageCreditUrl = getMetadata('image-credit-url');

  const HTML_TEMPLATE = `
  <div class="open-article-container">
    <div class="open-article block">
      <article class="article-content">
        <div class="assetTitle">
          <slot name="heading"></slot>
        </div>
        <div class="byline">
          <div class="attribution">
              <span>By</span>
              <a href="${authorURL}">${author}</a>
              <span>Photos by</span>
              <a href="${imageCreditUrl}">${imageCredit}</a>
          </div>
          <div class="publication">
              <span>${publicationDate}</span>
          </div>
          <div class="sharing no-label self-right hide-on-mobile">
            <slot name="share"></slot>
          </div>
        </div>
        
        <div class="lead">
          <slot name="image"></slot>
        </div>

        <div class="article-body">
          <slot></slot>
        </div>
        <slot name="share"></slot>
      </article>
      <div class="container-aside">
          <!-- ADVERTISEMENT HERE -->    
      </div>
    </div>
  </div>
  `;

  assignSlot(block, 'heading', 'h1');
  assignSlot(block, 'image', 'picture');

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

  block.querySelectorAll('.social-share, .embed').forEach((innerBlock) => decorateBlock(innerBlock));
  loadBlocks(document.querySelector('main'));

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);
  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, 'p');

  block.innerHTML = '';
  block.append(template);
}
