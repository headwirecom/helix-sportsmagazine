import {
  assignSlot,
  parseFragment,
  render,
  ARTICLE_TEMPLATES,
} from '../../scripts/scripts.js';
import {
  getMetadata,
} from '../../scripts/lib-franklin.js';

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const latestChanges = getMetadata('latest-changes');

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
<div class="title-wrapper">
  <slot name="title"></slot>
</div>

${latestChanges ? `<div class="last-changes-wrapper">
  <span name="last-changes">Last Changes to Visitor Agreement: ${latestChanges}.</span>
</div>` : ''}

<div class="content">
  <slot></slot>
</div>
`;

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // Identify slots
  assignSlot(block, 'title', 'h1');

  // Render template
  render(template, block, ARTICLE_TEMPLATES.FullBleed);

  // Update block with rendered template
  block.innerHTML = '';
  block.append(template);
}
