import { createOptimizedPicture, decorateIcons } from '../../scripts/lib-franklin.js';
import {
  getBlockId, parseFragment, removeEmptyElements, render,
} from '../../scripts/scripts.js';

const placeholderTrendingItemHtml = ({
  image = '', imageAlt = 'alt-text', title = '', path = '#',
} = {}) => `
  <div class="trending-item">
    <a class="trending-link" href="${path}">
      <div class="trending-image-wrapper">
        ${
  image
    ? createOptimizedPicture(image, imageAlt, true, [
      { media: '(max-width: 768px)', width: '360' },
      { width: '440' },
    ]).outerHTML
    : '<picture></picture>'
}
      </div>
      <div class="trending-text-wrapper">
        <h2 class="trending-title">${title}</h2>
      </div>
    </a>
  </div>
`;

const generateTemplate = (loopData) => `
  <div class="trending-wrapper">
    <div class="trending-content">
      <div class="trending-heading"><span>Trending</span><span class="icon icon-trending"></span></div>
      ${
  !loopData
    ? placeholderTrendingItemHtml().repeat(6)
  // TODO have trending query and use it instead of loop articles
    : loopData
      .slice(0, 6)
      .map((loopItem) => placeholderTrendingItemHtml(loopItem))
      .join('')
}
      </div>
    </div>
  </div>`;

export default async function decorate(block) {
  const id = getBlockId(block);

  block.innerHTML = generateTemplate();

  document.addEventListener(`query:${id}`, (event) => {
    const HTML_TEMPLATE = generateTemplate(event.detail.data);

    // block reference from function argument is no longer
    // the node in the DOM, so we need to query it again.
    const blockInDom = document.getElementById(id);

    // Rendering
    const template = parseFragment(HTML_TEMPLATE);

    // Render template
    render(template, block);

    // Post-processing
    removeEmptyElements(template, 'p');

    blockInDom.innerHTML = '';
    blockInDom.append(template);

    decorateIcons(blockInDom);
  });

  // Trigger query
  window.store.query(block);
}
