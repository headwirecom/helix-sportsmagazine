import {
  parseFragment,
  render,
  assignSlot,
} from '../../scripts/scripts.js';

import {
  decorateBlock, decorateIcons, loadBlock,
} from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  assignSlot(block, 'video', 'div > a');

  const heading = block.querySelector('h2');
  heading.parentElement.setAttribute('slot', 'content');

  // HTML template in JS
  const HTML_TEMPLATE = `
      <div class="columns-container">
        <div class="video-container">
          <div class="embed">
            <slot name="video"></slot>
          </div>  
        </div>
        <div class="content-container">
          <slot name="content"></slot>
        </div>
    </div>
`;

  // Parse the HTML template into a document fragment
  const template = parseFragment(HTML_TEMPLATE);

  // Render the template onto the block element
  render(template, block);

  // Clear the original block content
  block.innerHTML = '';
  block.append(template);

  // Post-processing
  const embed = block.querySelector('.embed');
  decorateBlock(embed);
  loadBlock(embed);

  const link = block.querySelector('.content-container a');
  if (link) {
    link.insertAdjacentHTML('afterbegin', '<div class="arrow-icon"><span class="icon icon-arrow-right"></span></div>');
    decorateIcons(link);
  }
}
