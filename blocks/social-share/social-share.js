import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const title = getMetadata('og:title');
  const url = getMetadata('og:url');

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
    <span class="label">Share story</span>
    <ul class="columns">
      <li>
        <a href="https://www.facebook.com/sharer.php?u=${url}" target="_blank" title="Share on Facebook">
          <span class="icon icon-facebook"></span>
        </a>
      </li>
      <li>
        <a href="https://twitter.com/intent/tweet?text=${title}&url=${url}" target="_blank" title="Share on Twitter">
          <span class="icon icon-twitter"></span>
        </a>
      </li>
      <li>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" title="Share on LinkedIn">
          <span class="icon icon-linkedin"></span>
        </a>
      </li>
    </ul>
    `;

  block.innerHTML = HTML_TEMPLATE;

  decorateIcons(block);
}
