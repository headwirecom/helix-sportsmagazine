import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  parseFragment,
  removeEmptyElements,
  render,
  convertExcelDate,
  timeSince,
  getBlockId,
} from '../../scripts/scripts.js';

const trendingSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11"><g fill="none" fill-rule="evenodd"><path fill="#000" d="M6.211 2.216l3.5-2.234.58 4.07z"/><path stroke="#000" stroke-width="1.44" d="M8.232 3L6.103 7.677l-3.205-2.07L.622 9.83"/></g></svg>'

const placeholderLoopCardHtml = (
  imageUrl="/content-v2/the-loop/gambling/article/2023/7/media_165ba417a5386440b7ffb02836bdc64ee3e46e132.jpeg?width=1200&format=pjpg&optimize=medium",
  imageAlt="alt-text",
  rubric="big buys",
  headline="Colts owner Jim Irsay announces purchase of this legendary piece of golf equipment",
  label="August 21"
) => `
  <div class="loop-card-wrapper"> 
    <a class="loop-card"> 
      <div class="image-wrapper">
        ${createOptimizedPicture(imageUrl, imageAlt).outerHTML}
      </div>
      <div class="text-wrapper">
        <div class="rubric">
          ${rubric}
        </div>
        <h4 class="headline">
          <span class="headline-span">${headline}</span>
        </h4>
        <span class="label">${label}</span>
      </div>
    </a>
  </div>
`

const placeholderTrendingItemHtml = (
  imageUrl="/content-v2/the-loop/gambling/article/2023/7/media_165ba417a5386440b7ffb02836bdc64ee3e46e132.jpeg?width=1200&format=pjpg&optimize=medium",
  imageAlt="alt-text",
  title="Matt Fitzpatrick couldn't resist cursing at Viktor Hovland after he stole the BMW Championship from him",
) => `
  <li class="trending-item">
    <a class="trending-link" src="#">
      <div class="trending-image-wrapper">
        ${createOptimizedPicture(imageUrl, imageAlt).outerHTML}
      </div>
      <div class="trending-text-wrapper">
        <h3 class="trending-title">${title}</h3>
      </div>
    </a>
  </li>
`

const placeholderHtml = `
<div class="loop-wrapper">
  <div class="trending-wrapper">
  <ul class="trending-content">
  <div class="trending-heading"><span>Trending</span>${trendingSvg}</div>
      ${placeholderTrendingItemHtml().repeat(6)}
    </ul>
    </div>
  </div>

  <div class="loop-header">
    <div class="loop-headline"><h1>This is the Loop</h1></div>
    <div class="loop-dash"></div>
    <div class="loop-description"><p>The modern handbook to sports, entertainment and everything else.</p></div>
    <div class="loop-social-share"></div>
  </div>

  <section class="loop-content-wrapper">
    ${placeholderLoopCardHtml().repeat(30)}
  </section>
</div>

`

export default async function decorate(block) {
  const id = getBlockId(block);
  console.log("\x1b[31m ~ id:", id)

  let loopData;

  
  // using placeholder html
  if (!loopData) {
    block.innerHTML = placeholderHtml;
  }

  // Rendering content upon fetch complete
  document.addEventListener(`query:${id}`, (event) => {
    loopData = event.detail.data;

    

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
