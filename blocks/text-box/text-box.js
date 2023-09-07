import {
  assignSlot, parseFragment, removeEmptyElements, render,
} from '../../scripts/scripts.js';

const HTML_TEMPLATE = `
<div class="text-box-content">
  <slot name="title"></slot>
  <slot></slot>
</div>
`;

export default async function decorate(block) {
  assignSlot(block, 'title', 'h1, h2, h3');
  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);
  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, 'p');

  block.innerHTML = '';
  block.append(template);
}
