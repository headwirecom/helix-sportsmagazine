import {
  parseFragment, render,
} from '../../scripts/scripts.js';

export default async function decorate(block) {
  const noteContent = block.querySelector('div > div > div').innerHTML;

  const HTML_TEMPLATE = `
    <div class="editors-note-content">
      <p><i>Editor's Note: ${noteContent}</i></p>
    </div>
  `;
  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // Render template
  render(template, block);

  // Update block with rendered template
  block.innerHTML = '';
  block.append(template);
}
