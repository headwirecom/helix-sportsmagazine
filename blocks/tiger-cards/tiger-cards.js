import { createOptimizedPicture, decorateIcons } from '../../scripts/lib-franklin.js';
import {
  parseFragment,
  removeEmptyElements,
  render,
  getBlockId,
} from '../../scripts/scripts.js';

let tigerSeriesData;

const placeholderSeriesCard = ({
  image = '', imageAlt = '', path = '#', title = '', description = '', videoDuration = '2:20',
} = {}) => `
<div class="tiger-card-wrapper">
  <a class="card-link" href="${path}">
    <div class="image-wrapper">
      <div class="timestamp-wrapper">
        <span class="timestamp">${image ? videoDuration : ''}</span>
        <span class="icon icon-play"></span>
      </div>
      ${
  image
    ? createOptimizedPicture(image, imageAlt || title, false, [
      { media: '(max-width: 768px)', width: '300' },
      { media: '(max-width: 1024px)', width: '460' },
      { width: '712' },
    ]).outerHTML
    : '<picture></picture>'
}
    </div>

    <div class="text-wrapper">
      <span class="title-span">${title}</span>
      <p class="description">${description}</p>
    </div>
  </a>
</div>
`;

const placeholderHtml = () => (tigerSeriesData
  ? tigerSeriesData.map((seriesCard, index) => placeholderSeriesCard(seriesCard, index)).join('')
  : placeholderSeriesCard().repeat(30));

export default async function decorate(block) {
  const id = getBlockId(block);

  // using placeholder html
  if (!tigerSeriesData) {
    block.innerHTML = placeholderHtml();
  }

  // Rendering content upon fetch complete
  document.addEventListener(`query:${id}`, (event) => {
    tigerSeriesData = event.detail.data;

    // Template rendering
    const template = parseFragment(placeholderHtml());
    // Render template
    render(template, block);

    // Post-processing
    removeEmptyElements(template, 'p');

    block.innerHTML = '';
    block.append(template);

    decorateIcons(block);
  });

  // Trigger query
  window.store.query(block);
}
