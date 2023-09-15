import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { parseFragment, removeEmptyElements, render } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const response = await fetch('/custom-data.json?sheet=gd-plus-offers&sheet=gd-plus-benefits&limit=10');
  const data = await response.json();

  const offerCards = data['gd-plus-offers'].data;
  const benefits = data['gd-plus-benefits'].data;

  const HTML_TEMPLATE = `
  <div class="gd-plus-subscribe-content">
    <div class="background-image-wrapper">
      <div class="image-overlay"></div>
      ${
  createOptimizedPicture('/subscribe-background-mockup.jpg', 'hero background green', true, [
    { media: '(max-width: 768px)', width: '2270' },
    { media: '(max-width: 1297px)', width: '2560' },
    { width: '3380' },
  ]).outerHTML
}
      </div>
    <h1 class="subscribe-title">Become A Golf Digest<span class="red-plus">+</span> Subscriber</h1>
  
    <p class="subscribe-subtitle">
      Unlimited access to Golf Digest's premium journalism and storytelling. 
    </p>
  
    <ul class="offer-list">
      ${offerCards
    .map(
      (card) => `
          <li class="offer-card ${card.mostPopular ? 'most-popular' : ''}">
            <p class="card-title">${card.title}</p>
            <div class="price-wrapper">
              <strong class="price">${card.cost}</strong>
              <span class="scope">/${card.scope}</span>
            </div>
            <p class="billing-info">Billed <span class="billing-scope">${card.billScope}</span></p>
  
            <button class="offer-button" onclick="console.warn('billing popup not yet implemented');">
              Subscribe
            </button>
  
            <p class="offer-cancel">Cancel anytime</p>
          </li>
        `,
    )
    .join('')}
    </ul>
  
    <div class="gift-subscription-wrapper">
      <div class="gift-content">
        <div class="text-wrapper">
          <span class="gift-title">
            Gift Subscriptions
          </span>
  
          <p class="gift-description">
            Give the gift of a <strong class="highlight">Golf Digest<span class="red-plus">+</span></strong> digital and print subscription.
          </p>
        </div>
  
        <div class="button-wrapper">
          <button class="gift-button" onclick="console.warn('billing popup not yet implemented');">
            <span class="hide-on-mobile">Buy a </span>gift
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <h2 class="benefits-header">Subscriber Benefits</h2>
  <div class="gd-plus-benefits-content">
    ${
  createOptimizedPicture('/subscribe-device-mockup.png', 'Golf Digest Plus Promo Image', false, [
    { media: '(max-width: 768px)', width: '1414' },
    { media: '(max-width: 1297px)', width: '2472' },
    { width: '1428' },
  ]).outerHTML
}
    <ul class="benefits-list">
      ${benefits
    .map(
      (benefit) => `
        <li class="benefit-item">
          <strong class="benefit-title">${benefit.title}${benefit.info ? '*' : ''}</strong>
          ${benefit.info ? `<p class="info">*${benefit.info}</p>` : ''}
        </li>
      `,
    )
    .join('')}
    </ul>
  </div>
  `;
  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);
  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, 'p');

  block.innerHTML = '';
  block.append(template);
}
