import {
  ARTICLE_TEMPLATES,
  normalizeAuthorURL,
  parseFragment,
  parseSectionMetadata,
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
  const imageCredit = getMetadata('image-credit');
  const publicationDate = getMetadata('publication-date');

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
    <div class="container">
      <div class="container-article">
        <article class="article-content">
          <p class="rubric">
            <span>${rubric}</span>
          </p>
          <div class="headline">
            <slot name="headline"></slot>
          </div>
          <div class="byline">
            <div class="attribution">
              ${author ? `<span>By&nbsp;</span><a href="${normalizeAuthorURL(author)}">${author}</a>` : ''}
              ${imageCredit ? `<span>Photos By&nbsp;</span><a href="${normalizeAuthorURL(imageCredit)}">${imageCredit}</a>` : ''}
            </div>
            <div class="publication">
                <span>${publicationDate}</span>
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
    `;

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // Identify slots
  const heading = block.querySelector('h1');
  if (heading) {
    heading.parentElement.setAttribute('slot', 'headline');
  }

  // Pre-processing
  const share = buildBlock('social-share', { elems: [] });
  share.setAttribute('slot', 'share');
  block.append(share);

  // Render template
  render(template, block, ARTICLE_TEMPLATES.GalleryListicle);

  // Handle section metadata
  template.querySelectorAll('.template-section-metadata').forEach((metadataEl) => {
    const section = metadataEl.parentElement;
    const metadata = parseSectionMetadata(metadataEl);
    const picture = section.querySelector('picture');
    if (metadata.photoCredit && picture) {
      picture.insertAdjacentHTML('beforeend', `<p class="photo-credit">${metadata.photoCredit}</p>`);
    }
  });

  // Handle automatic headings
  template.querySelectorAll('.article-body picture').forEach((picture, index) => {
    picture.insertAdjacentHTML('afterend', `<h2>${index + 1}</h2>`);
  });

  // Update block with rendered template
  block.innerHTML = '';
  block.append(template);

  // Inner block loading
  block.querySelectorAll('.social-share').forEach((innerBlock) => decorateBlock(innerBlock));
  loadBlocks(document.querySelector('main'));
}
