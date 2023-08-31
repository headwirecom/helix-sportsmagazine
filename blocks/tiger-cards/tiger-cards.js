import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  parseFragment,
  removeEmptyElements,
  render,
  getBlockId,
} from '../../scripts/scripts.js';

const playIcon = '<svg width="9" height="10" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.624607 9.99995C0.537162 9.99995 0.399748 9.97497 0.312303 9.90002C0.124921 9.77509 0 9.58771 0 9.37535V0.630853C0 0.405994 0.124921 0.193628 0.312303 0.093691C0.499685 -0.0312303 0.749528 -0.0312303 0.93691 0.093691L8.43219 4.46594C8.61957 4.59086 8.74449 4.77824 8.74449 4.99061C8.74449 5.21547 8.61957 5.42783 8.43219 5.52777L0.93691 9.90002C0.849465 9.97497 0.724544 9.99995 0.624607 9.99995Z" fill="white"></path></svg>';

let tigerSeriesData;

const placeholderSeriesCard = ({
  image = '', imageAlt = '', path = '#', title = '', description = '', videoDuration = '2:20',
} = {}) => `
<div class="tiger-card-wrapper">
  <a class="card-link" href="${path}">
    <div class="image-wrapper">
      <div class="timestamp-wrapper">
        <span class="timestamp">${image ? videoDuration : ''}</span>
        <span class="play-icon">${playIcon}</span>
      </div>
      ${
  image
    ? createOptimizedPicture(image, imageAlt || title, false, [
      { media: '(max-width: 768px)', width: '150' },
      { media: '(max-width: 1024px)', width: '256' },
      { width: '356' },
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
  });

  // Trigger query
  window.store.query(block);
}
