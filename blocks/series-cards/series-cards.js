import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  parseFragment,
  removeEmptyElements,
  render,
  getBlockId,
} from '../../scripts/scripts.js';

let seriesData;

const placeholderSeriesCard = ({
  image = '', imageAlt = '', path = '#', title = '',
} = {}, index = 0) => `
<div class="series-card-wrapper">
  <a class="card-link" href="${path}">
    <div class="image-wrapper">
      ${
  image
    ? createOptimizedPicture(image, imageAlt || title, index < 4, [
      { media: '(max-width: 768px)', width: '132' },
      { media: '(max-width: 1024px)', width: '276' },
      { width: '256' },
    ]).outerHTML
    : '<picture></picture>'
}
    </div>

    <div class="title-wrapper">
      <span class="title-span">${title}</span>
    </div>
  </a>
</div>
`;

const placeholderHtml = () => `
<div class="series-cards-content" >
  ${
  seriesData
    ? seriesData.map((seriesCard, index) => placeholderSeriesCard(seriesCard, index)).join('')
    : placeholderSeriesCard().repeat(30)
}
</div>
`;

export default async function decorate(block) {
  const id = getBlockId(block);

  // using placeholder html
  if (!seriesData) {
    block.innerHTML = placeholderHtml();
  }

  // Rendering content upon fetch complete
  document.addEventListener(`query:${id}`, (event) => {
    seriesData = event.detail.data;

    // Template rendering
    const template = parseFragment(placeholderHtml());
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
