import { parseFragment, parseSectionMetadata, render } from '../../scripts/scripts.js';
import {
  buildBlock, decorateBlock, getMetadata, loadBlocks,
} from '../../scripts/lib-franklin.js';

const rubric = getMetadata('rubric');
const author = getMetadata('author');
const authorURL = getMetadata('author-url');
const publicationDate = getMetadata('publication-date');

// HTML template in JS to avoid extra waterfall for LCP blocks
const HTML_TEMPLATE = `
<div class="container">
  <div class="container-article">
    <article class="article-content">
      ${rubric ? `<p class="rubric">
        <span>${rubric}</span>
      </p>` : ''}
      <div class="headline">
        <slot name="headline"></slot>
      </div>
      <div class="byline">
        <div class="attribution">
            <span>By</span>
            <a href="${authorURL}">${author}</a>
        </div>
        <div class="publication">
            <span>${publicationDate}</span>
        </div>
        <div class="sharing">
            <slot name="share"></slot>
        </div>
      </div>
      <div class="article-body">
        <slot></slot>
        <slot name="share"></slot>  
      </div>
    </article>
    <div class="container-aside">
        <!-- ADVERTISEMENT HERE -->    
    </div>
  </div>
</div>
`;

/**
 * Add carousel interactions
 * @param {Element} carousel The carousel element
 */
function addEventListeners(carousel) {
  // Slide to the sibling item
  const slide = (item, sibling) => {
    carousel.classList.add('is-transitioning');
    item.hidden = true;
    item[`${sibling}ElementSibling`].hidden = false;
    carousel.classList.remove('is-transitioning');
  };

  // Listen for button or img click events and slide accordingly
  carousel.addEventListener('click', (event) => {
    const nextButton = event.target.closest('button.next');
    const prevButton = event.target.closest('button.prev');
    const img = event.target.closest('img');

    if (nextButton) {
      if (nextButton.classList.contains('has-label')) {
        nextButton.classList.remove('has-label');
        // Preload images
        carousel.querySelectorAll('img[loading]').forEach((el) => el.removeAttribute('loading'));
      } else {
        slide(nextButton.closest('div'), 'next');
      }
    } else if (prevButton) {
      slide(prevButton.closest('div'), 'previous');
    } else if (img) {
      slide(img.closest('div'), 'next');
    }
  });

  // Support left and right arrow keys to slide
  window.addEventListener('keydown', (event) => {
    // Dont steal focus on active elements
    if (document.activeElement === document.body) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();

        const item = [...carousel.children].find((child) => !child.hidden);
        const nextButton = item.querySelector('button.next');
        if (nextButton) {
          nextButton.click();
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();

        const item = [...carousel.children].find((child) => !child.hidden);
        const prevButton = item.querySelector('button.prev');
        if (prevButton) {
          prevButton.click();
        }
      }
    }
  });
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // Identify slots
  const heading = block.querySelector('h1');
  if (heading) {
    heading.parentElement.setAttribute('slot', 'headline');
  }

  // Pre-processing
  const share = buildBlock('social-share', { elems: [] });
  share.setAttribute('slot', 'share');
  block.append(share);

  // Render template
  render(template, block);

  // Post-procesing
  const carousel = template.querySelector('.article-body > div > div');
  carousel.classList.add('carousel');

  const carouselItemsLength = carousel.children.length;
  [...carousel.children].forEach((item, index) => {
    const isFirst = index === 0;
    item.hidden = !isFirst;

    const imageContainer = item.querySelector('picture').parentElement;

    // Get photo metadata for image credit
    let credit;
    const metadataEl = item.querySelector('.template-section-metadata');
    if (metadataEl) {
      const sectionMetadata = parseSectionMetadata(metadataEl);
      if (sectionMetadata.photoCredit) {
        credit = sectionMetadata.photoCredit;
      }
    }

    // Add credits, next and prev buttons and slide counter
    imageContainer.insertAdjacentHTML('beforeend', `
      ${credit ? `<div class="photo-credit">Photo By: ${credit}</div>` : ''}
      ${!isFirst ? `
        <button class="prev">   
          <svg viewBox="0 0 16 16">
            <path fill="#FFF" d="M11.311 16l1.354-1.355L6.033 8l6.632-6.645L11.311 0 3.335 7.989l.01.011-.01.01z"/>
          </svg>
        </button>  
      ` : ''}
      ${index !== carouselItemsLength - 1 ? `
        <button class="next ${isFirst ? 'has-label' : ''}">
          ${isFirst ? '<span>View the Gallery</span>' : ''}  
          <svg viewBox="0 0 16 16">
            <path fill="#FFF" d="M4.689 0L3.335 1.354 9.968 8l-6.633 6.644L4.689 16l7.976-7.99-.01-.01.01-.011z"/>
          </svg>    
        </button>
      ` : ''}
      <div class="count">${index + 1}/${carouselItemsLength}</div>  
    `);

    // Add photo credit again at the end
    if (credit) {
      item.insertAdjacentHTML('beforeend', `
        <span class="photo-credit">Photo By: ${credit}</span>
      `);
    }
  });

  addEventListeners(carousel);

  // Update block with rendered template
  block.innerHTML = '';
  block.append(...template.children);

  // Inner block loading
  block.querySelectorAll('.social-share').forEach((innerBlock) => decorateBlock(innerBlock));
  loadBlocks(document.querySelector('main'));
}