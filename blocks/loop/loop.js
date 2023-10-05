import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  parseFragment,
  removeEmptyElements,
  render,
  getBlockId,
  createAndInsertTrendingBannerBlock,
} from '../../scripts/scripts.js';

let numberOfEagerCards = 3;
if (window.innerWidth < 1024) {
  numberOfEagerCards = 2;
}
if (window.innerWidth < 768) {
  numberOfEagerCards = 1;
}

const placeholderLoopCardHtml = ({
  image = '',
  imageAlt = 'alt-text',
  rubric = '',
  title = '',
  date = '',
  path = '#',
} = {}, index = 4) => {
  const isEven = index === 0 || index % 2 === 0;
  return `
    <div class="loop-card-wrapper">
      <a class="loop-card" href="${path}"> 
        <div class="image-wrapper">
          ${image ? createOptimizedPicture(image, imageAlt, index <= numberOfEagerCards, [
    { media: '(max-width: 768px)', width: !isEven ? '1180' : '1420' },
    { media: '(max-width: 1024px)', width: !isEven ? '950' : '700' },
    { width: !isEven ? '690' : '450' },
  ]).outerHTML : '<picture></picture>'}
        </div>
        <div class="text-wrapper">
          ${rubric ? `<div class="rubric">
            ${rubric}
          </div>` : ''}
          <h3 class="headline">
            <span class="headline-span">${title}</span>
          </h3>
          <span class="label">${date.includes(',') ? date.split(',')[0] : date}</span>
        </div>
      </a>
    </div>
  `;
};

const encodedUrl = encodeURIComponent(window.location.href);

const placeholderHtml = (data) => `
<div class="loop-main">
  <slot name="trending"></slot>

  <div class="loop-header">
    <div class="loop-headline"><h1>This is the Loop</h1></div>
    <div class="loop-dash"></div>
    <div class="loop-description"><p>The modern handbook to sports, entertainment and everything else.</p></div>
    <div class="loop-social-share">
      <div class="loop-social-share-title">
        Follow us
      </div>
      <ul class="loop-social-list">
        <li><a href="https://www.facebook.com/sharer.php?u=${encodedUrl}"><span class="icon icon-facebook"></span></a></li>
        <li><a href="href="https://twitter.com/intent/tweet?text=The+Loop&url=${encodedUrl}&original_referer=${encodedUrl}"><span class="icon icon-twitter"></span></a></li>
        <li><a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}"><span class="icon icon-linkedin"></span></a></li>
      </ul>
    </div>
  </div>

  <section class="loop-content-wrapper">
    ${!data ? placeholderLoopCardHtml().repeat(30) : data.map((loopItem, index) => placeholderLoopCardHtml(loopItem, index)).join('')}
  </section>

</div>
`;

export default async function decorate(block) {
  const id = getBlockId(block);

  await createAndInsertTrendingBannerBlock(block, 'trending');

  // using placeholder html
  const placeholderTemplate = parseFragment(placeholderHtml());

  render(placeholderTemplate, block);
  block.innerHTML = '';
  block.append(placeholderTemplate);

  // Re-rendering content upon fetch complete
  document.addEventListener(`query:${id}`, (event) => {
    const loopData = event.detail.data;

    const HTML_TEMPLATE = placeholderHtml(loopData);

    // Template rendering
    const template = parseFragment(HTML_TEMPLATE);

    // Render template
    render(template, block);

    // Post-processing
    removeEmptyElements(template, 'p');

    block.innerHTML = '';
    block.append(template);
  });

  // Trigger query
  window.store.query(block);
}
