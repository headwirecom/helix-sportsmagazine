import {
  assignSlot,
  normalizeAuthorURL,
  parseFragment,
  parseSectionMetadata,
  removeEmptyElements,
  render,
  replaceLinksWithEmbed,
} from '../../scripts/scripts.js';
import {
  buildBlock, decorateBlock, getMetadata, loadBlocks,
} from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const author = getMetadata('author');
  const publicationDate = getMetadata('publication-date');
  const imageCredit = parseSectionMetadata(block.querySelector('.template-section-metadata'))?.imageCredit;

  const HTML_TEMPLATE = `
    <article class="article-content">
      <div class="assetTitle">
        <slot name="heading"></slot>
      </div>
      <div class="byline">
        <div class="attribution">
          ${author ? `<span>By&nbsp;</span><a href="${normalizeAuthorURL(author)}">${author}</a>` : ''}
          ${imageCredit ? `<span>Photos By&nbsp;</span><a href="${normalizeAuthorURL(imageCredit)}">${imageCredit}</a>` : ''}
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
  `;

  assignSlot(block, 'heading', 'h1');
  assignSlot(block, 'image', 'picture');

  // Pre-processing
  const share = buildBlock('social-share', { elems: [] });
  share.setAttribute('slot', 'share');
  block.append(share);

  replaceLinksWithEmbed(block);

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
