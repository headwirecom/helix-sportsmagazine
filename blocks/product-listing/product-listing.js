import {
  assignSlot,
  parseFragment, parseSectionMetadata, render,
} from '../../scripts/scripts.js';

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const metadataEl = block.querySelector('.template-section-metadata');
  let sectionMetadata = {};
  if (metadataEl) {
    sectionMetadata = parseSectionMetadata(metadataEl);
  }

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
    <div class="container">
      <article class="article-content">
        <div class="content">
            <slot name="heading"></slot>
            <div class="awards">${sectionMetadata.awards ? sectionMetadata.awards : ''}</div>
            <div class="description">
                <slot name="description"></slot>
            </div>
            <div class="details">
                <span>${sectionMetadata.price}</span>
                ${sectionMetadata.price && sectionMetadata.advertiser ? '<span class="separator">|</span>' : ''}
                <span class="advertiser">${sectionMetadata.advertiser}</span>
            </div>
            <div class="link">
                <slot name="link"></slot>
            </div>
            <div class="disclaimer">${sectionMetadata.disclaimer ? 'All products featured on Golf Digest are independently selected by our editors. However, when you buy something through our retail links, we may earn an affiliate commission.' : ''}</div>
        </div>
        <slot name="image"></slot>
      </article>
    </div>
    `;

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // Identify slots
  assignSlot(block, 'heading', 'h1');

  // Description is optional
  [...block.querySelectorAll('h1 ~ p:not(:last-of-type)')].some((p) => {
    if (!p.querySelector('picture')) {
      p.setAttribute('slot', 'description');
      return true;
    }

    return false;
  });
  assignSlot(block, 'image', 'picture');
  assignSlot(block, 'link', 'p:last-of-type > a');

  // Render template
  render(template, block);

  // URL check
  block.querySelectorAll('.advertiser').forEach((el) => {
    const url = el.textContent.trim();
    if (url.includes('.') && !url.includes(' ')) {
      try {
        new URL(`https://${url}`);
        el.innerHTML = `<a href='https://${url}'>${url}</a>`;
      } catch (e) {}
    }
  });
  
  // Update block with rendered template
  block.innerHTML = '';
  block.append(template);
}
