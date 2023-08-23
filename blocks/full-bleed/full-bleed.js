import {
  assignSlot,
  parseFragment,
  render,
  replaceLinksWithEmbed,
  parseSectionMetadata,
  addPhotoCredit,
  ARTICLE_TEMPLATES,
} from '../../scripts/scripts.js';
import {
  buildBlock,
  decorateBlock,
  getMetadata,
  loadBlocks,
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
  // TODO remove once importer fixes photo credit
  const photoCredit = headlineMetadata?.imageCredit ?? headlineMetadata?.photoCredit;

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
<div class="container">
  <div class="lead">
      <div class="headline">
          <p class="rubric">
              <span>${rubric}</span>
          </p>
          <div class="title">
              <slot name="heading"></slot>
              <slot name="description"></slot>
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
          <slot name="caption"></slot>
          ${photoCredit ? `<span>${photoCredit}</span>` : ''}
          </div>
      </div>
  </div>
  <div class="container-article">
    <div class="content-wrapper">
        <article class="article-content">
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
</div>
`;

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  replaceLinksWithEmbed(block);

  // Identify slots
  assignSlot(block, 'heading', 'h1');
  assignSlot(block, 'image', 'picture');
  const h1Element = block.querySelector('h1');
  const nextSibling = h1Element?.nextElementSibling;
  if (nextSibling && nextSibling.tagName === 'P' && !nextSibling.querySelector('picture')) {
    assignSlot(block, 'description', 'h1 + p:not(:has(picture))');
  }

  // Pre-processing
  const share = buildBlock('social-share', { elems: [] });
  share.setAttribute('slot', 'share');
  block.append(share);

  block.querySelectorAll('p').forEach((p) => {
    if (p.textContent.includes('• • •')) {
      p.classList.add('center-seperator');
    }
  });

  const picture = block.querySelector('picture');

  const caption = picture.parentElement.nextElementSibling;
  if (caption && caption.tagName === 'P') {
    caption.setAttribute('slot', 'caption');
  }

  // Render template
  // TODO remove ARTICLE_TEMPLATES.FullBleed once importer fixes "**" occurrences
  render(template, block, ARTICLE_TEMPLATES.FullBleed);

  // Update block with rendered template
  block.innerHTML = '';
  block.append(template);

  const pictures = block.querySelectorAll('picture');
  addPhotoCredit(pictures);

  // Inner block loading
  block.querySelectorAll('h2').forEach((h2) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'centered-h2';
    h2.before(wrapper);
    wrapper.appendChild(h2);
  });

  block
    .querySelectorAll('.social-share, .embed, .more-cards')
    .forEach((innerBlock) => decorateBlock(innerBlock));
  loadBlocks(document.querySelector('main'));
}
