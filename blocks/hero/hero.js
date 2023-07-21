import {
  parseFragment,
  render,
  removeEmptyElements,
} from '../../scripts/scripts.js';

const arrowIcon = '<svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arrow Icon White" class="arrow-icon"><path d="M1.70612 0.819317L1.53333 0.654091L1.36055 0.819317L0.827218 1.32933L0.638272 1.51001L0.827218 1.69069L3.57161 4.31506L0.827218 6.93943L0.638272 7.12012L0.827218 7.3008L1.36055 7.81081L1.53333 7.97604L1.70612 7.81081L5.17278 4.49575L5.36173 4.31506L5.17278 4.13438L1.70612 0.819317Z" fill="#ffffff" stroke="#ffffff" stroke-width="0.5"></path></svg>';

export default async function decorate(block) {
  const imgSrc = block.querySelector('img').getAttribute('src');
  const buttonLink = block
    .querySelector('.button-container a')
    .getAttribute('href');
  const buttonText = block.querySelector('.button-container a').textContent;
  const headingText = block.querySelector('h2').textContent;

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
  <div class="hero-wrapper-middle">
    <div class="hero-image">
      <img src="${imgSrc}" alt="Hero Image">
      <div class="hero-content">
        <h2>${headingText}</h2>
        <p class="button-container">
         ${arrowIcon}
        <a href="${buttonLink}" title="Read story" class="button primary">${buttonText}</a></p>
      </div>
    </div>
  </div>
`;

  // Parse the HTML template into a document fragment
  const template = parseFragment(HTML_TEMPLATE);

  // Render the template onto the block element
  render(template, block);

  // Post-processing
  removeEmptyElements(template, 'p');

  // Clear the original block content
  block.innerHTML = '';
  block.append(...template.children);
}
