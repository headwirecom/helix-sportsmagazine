import {
  addPortraitClass,
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
  const headlineMetadata = parseSectionMetadata(block.querySelector('.template-section-metadata'));
  // TODO fix once importer fixes photo credit
  const photoCredit = headlineMetadata?.imageCredit ?? headlineMetadata?.photoCredit;

  const HTML_TEMPLATE = `
    <article class="article-content">
      <div class="assetTitle">
        <slot name="heading"></slot>
      </div>
      <div class="byline">
        <div class="attribution">
          ${author ? `<span>By&nbsp;</span><a href="${normalizeAuthorURL(author)}">${author}</a>` : ''}
          ${photoCredit ? `<span>Photos By&nbsp;</span><a href="${normalizeAuthorURL(photoCredit)}">${photoCredit}</a>` : ''}
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

  block.querySelectorAll('.social-share, .embed, .more-cards').forEach((innerBlock) => decorateBlock(innerBlock));
  loadBlocks(document.querySelector('main'));

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, 'p');

  addPortraitClass(template.querySelectorAll('.article-body p > picture'));

  block.innerHTML = '';
  block.append(template);
}
