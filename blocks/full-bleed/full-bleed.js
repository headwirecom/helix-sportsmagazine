import {
  assignSlot,
  parseFragment,
  render,
  replaceLinksWithEmbed,
  parseSectionMetadata,
  addPhotoCredit,
  ARTICLE_TEMPLATES,
  premiumArticleBanner,
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
  const gdPlusArticle = getMetadata('gdplus').length > 0;

  const rubric = getMetadata('rubric');
  const author = getMetadata('author');
  const authorURL = getMetadata('author-url');
  const publicationDate = getMetadata('publication-date');
  const headlineMetadata = parseSectionMetadata(block.querySelector('.template-section-metadata'));
  // TODO remove once importer fixes photo credit
  const photoCredit = headlineMetadata?.imageCredit ?? headlineMetadata?.photoCredit;

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
${!gdPlusArticle ? '' : premiumArticleBanner()}
<div class="container">
  <div class="lead">
      <div class="headline">
          <p class="rubric">
              ${!gdPlusArticle ? '' : `
                <img width="51" height="19" class="gd-plus-icon light" src="/icons/gd-plus-light.svg" alt="GD Plus Icon" />
                <img width="51" height="19" class="gd-plus-icon dark" src="/icons/gd-plus-dark.svg" alt="GD Plus Icon" />
              `}
              <span>${rubric}</span>
          </p>
          <div class="title">
              <slot name="heading"></slot>
              <slot name="description"></slot>
          </div>
          <!-- this slot must be wrapped in a p tag otherwise other code will break the block -->
          <p><slot name="editors-note"></slot></p>
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
        <slot name="editors-note"></slot>
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

  const editorsNote = block.querySelector('.editors-note');
  if (editorsNote) {
    decorateBlock(editorsNote);
    assignSlot(block, 'editors-note', '.editors-note');
  }

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

  if (gdPlusArticle && Number(window.sessionStorage.freeArticles) <= 0) {
    const articleBody = block.querySelector('.article-body');

    articleBody.style.height = '1000px';
    articleBody.style.position = 'relative';
    articleBody.style.overflow = 'hidden';

    const articleBlocker = document.createElement('div');
    articleBlocker.className = 'article-blocker-wrapper';
    articleBlocker.innerHTML = `
      <div class="article-blocker-content">
        <img class="article-blocker-image gd-plus-logo" src="/icons/GD_Plus.png" alt="Golf Digest Plus Logo" />
        <div class="article-blocker-lead">Subscribe to continue Reading</div>
        <div class="article-blocker-sublead">
          <span class="highlight">Golf Digest<span class="red-plus">+</span></span>
          includes unlimited digital articles, exclusive course reviews, magazine access and more!
        </div>
        <a class="cta" href="https://www.golfdigest.com/subscribe-golf-digest-plus" target="_blank">
          Learn More
        </a>

        <span class="login-wrapper">
        Already have an account? <button class="login-button" onclick="console.warn('login popup not implemented yet');">Log in</button>
        </span>
      </div>
    `;

    articleBody.appendChild(articleBlocker);
  }
}
