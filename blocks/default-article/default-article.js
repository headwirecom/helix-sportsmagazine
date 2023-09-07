import {
  addPhotoCredit,
  addPortraitClass,
  assignSlot,
  generateArticleBlocker,
  normalizeAuthorURL,
  parseFragment,
  parseSectionMetadata,
  premiumArticleBanner,
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
  const gdPlusArticle = getMetadata('gdplus').length > 0;
  const rubric = getMetadata('rubric');
  const author = getMetadata('author');
  const publicationDate = getMetadata('publication-date');
  const headlineMetadata = parseSectionMetadata(block.querySelector('.template-section-metadata'));
  // TODO remove once importer fixes photo credit
  const photoCredit = headlineMetadata?.imageCredit ?? headlineMetadata?.photoCredit;

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
    <div class="container">
      <div class="container-article">
        <article class="article-content">
  ${!gdPlusArticle ? '' : premiumArticleBanner()}
          <p class="rubric">
            ${!gdPlusArticle ? '' : '<img class="gd-plus-icon" width="51" height="19" src="/icons/gd-plus-dark.svg" alt="GD Plus Icon" />'}
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
                ${photoCredit ? `<span>${photoCredit}</span>` : ''}
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
  // Picture is optional
  if (picture) {
    addPortraitClass(picture);

    const caption = picture.parentElement.nextElementSibling;
    if (caption && caption.tagName === 'P') {
      caption.setAttribute('slot', 'caption');
    }
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
  addPhotoCredit(pictures);
  addPortraitClass(pictures);

  // Update block with rendered template
  block.innerHTML = '';
  block.append(template);

  // Inner block loading
  block.querySelectorAll('.social-share, .embed, .more-cards').forEach((innerBlock) => decorateBlock(innerBlock));
  loadBlocks(document.querySelector('main'));

  if (gdPlusArticle) {
    generateArticleBlocker(block, '.article-body');
  }
}
