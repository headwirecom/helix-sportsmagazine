import {
  addImageCredit,
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

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const rubric = getMetadata('rubric');
  const author = getMetadata('author');
  const publicationDate = getMetadata('publication-date');
  const imageCredit = parseSectionMetadata(block.querySelector('.template-section-metadata'))?.imageCredit;

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
          <div class="byline">
            <div class="attribution">
              ${author ? `<span>By&nbsp;</span><a href="${normalizeAuthorURL(author)}">${author}</a>` : ''}
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
                <slot name="caption"></slot>
                ${imageCredit ? `<span>${imageCredit}</span>` : ''}
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

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // Identify slots
  assignSlot(block, 'heading', 'h1');
  assignSlot(block, 'image', 'picture');

  const picture = block.querySelector('picture');
  addPortraitClass(picture);

  const caption = picture.parentElement.nextElementSibling;
  if (caption && caption.tagName === 'P') {
    caption.setAttribute('slot', 'caption');
  }

  // Pre-processing
  const share = buildBlock('social-share', { elems: [] });
  share.setAttribute('slot', 'share');
  block.append(share);

  replaceLinksWithEmbed(block);

  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, 'p');

  const pictures = template.querySelectorAll('.article-body p > picture');
  addImageCredit(pictures);
  addPortraitClass(pictures);

  // Update block with rendered template
  block.innerHTML = '';
  block.append(template);

  // Inner block loading
  block.querySelectorAll('.social-share, .embed').forEach((innerBlock) => decorateBlock(innerBlock));
  loadBlocks(document.querySelector('main'));
}
