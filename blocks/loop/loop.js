import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  parseFragment,
  removeEmptyElements,
  render,
  getBlockId,
} from '../../scripts/scripts.js';
import { facebookSvg, twitterSvg, linkedInSvg } from '../social-share/social-share.js';

const trendingSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11"><g fill="none" fill-rule="evenodd"><path fill="#000" d="M6.211 2.216l3.5-2.234.58 4.07z"/><path stroke="#000" stroke-width="1.44" d="M8.232 3L6.103 7.677l-3.205-2.07L.622 9.83"/></g></svg>';
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
  const isEven = index % 2 === 0;
  return `
    <div class="loop-card-wrapper"> 
      <a class="loop-card" href="${path}"> 
        <div class="image-wrapper">
          ${image ? createOptimizedPicture(image, imageAlt, index <= numberOfEagerCards, [
    { media: '(max-width: 768px)', width: isEven ? '710' : '591' },
    { media: '(max-width: 1024px)', width: isEven ? '474' : '254' },
    { width: isEven ? '345' : '225' },
  ]).outerHTML : '<picture></picture>'}
        </div>
        <div class="text-wrapper">
          <div class="rubric">
            ${rubric}
          </div>
          <h3 class="headline">
            <span class="headline-span">${title}</span>
          </h3>
          <span class="label">${date.includes(',') ? date.split(',')[0] : date}</span>
        </div>
      </a>
    </div>
  `;
};

const placeholderTrendingItemHtml = ({
  image = '', imageAlt = 'alt-text', title = '', path = '#',
} = {}) => `
  <div class="trending-item">
    <a class="trending-link" href="${path}">
      <div class="trending-image-wrapper">
        ${image ? createOptimizedPicture(image, imageAlt, true, [
    { media: '(max-width: 768px)', width: '180' },
    { width: '220' },
  ]).outerHTML : '<picture></picture>'}
      </div>
      <div class="trending-text-wrapper">
        <h2 class="trending-title">${title}</h2>
      </div>
    </a>
  </div>
`;

const encodedUrl = encodeURIComponent(window.location.href);

const placeholderHtml = (data) => `
<div class="loop-wrapper">
  <div class="trending-wrapper">
  <div class="trending-content">
  <div class="trending-heading"><span>Trending</span>${trendingSvg}</div>

      ${
  !data
    ? placeholderTrendingItemHtml().repeat(6)
    // TODO have trending query and use it instead of loop articles
    : data
      .slice(0, 6)
      .map((loopItem) => placeholderTrendingItemHtml(loopItem))
      .join('')
}
    </div>
    </div>
  </div>

  <div class="loop-header">
    <div class="loop-headline"><h1>This is the Loop</h1></div>
    <div class="loop-dash"></div>
    <div class="loop-description"><p>The modern handbook to sports, entertainment and everything else.</p></div>
    <div class="loop-social-share">
      <div class="loop-social-share-title">
        Follow us
      </div>
      <ul class="loop-social-list">
        <li><a href="https://www.facebook.com/sharer.php?u=${encodedUrl}">${facebookSvg}</a></li>
        <li><a href="href="https://twitter.com/intent/tweet?text=The+Loop&url=${encodedUrl}&original_referer=${encodedUrl}">${twitterSvg}</a></li>
        <li><a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}">${linkedInSvg}</a></li>
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

  let loopData;

  // using placeholder html
  if (!loopData) {
    block.innerHTML = placeholderHtml();
  }

  // Rendering content upon fetch complete
  document.addEventListener(`query:${id}`, (event) => {
    loopData = event.detail.data;

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
  window.store.query(block, 20);
}
