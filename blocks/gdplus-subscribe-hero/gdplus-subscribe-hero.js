import {
  parseFragment,
  removeEmptyElements,
  render,
} from '../../scripts/scripts.js';

const offerCards = [
  {
    title: 'Digital Only',
    cost: '$1.99',
    scope: 'mo',
    billScope: 'annually',
  },
  {
    title: 'Digital & Print',
    cost: '$39.99',
    scope: 'yr',
    billScope: 'annually',
    mostPopular: true,
  },
  {
    title: 'Digital + Print + Golf Digest Schools',
    cost: '$169.99',
    scope: 'yr',
    billScope: 'annually',
  },
];

const HTML_TEMPLATE = `
<div class="gd-plus-subscribe-content">
  <h1 class="subscribe-title">Become A Golf Digest<span class="red-plus">+</span> Subscriber</h1>

  <p class="subscribe-subtitle">
    Unlimited access to Golf Digest's premium journalism and storytelling. 
  </p>

  <ul class="offer-list">
    ${offerCards.map((card) => `
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
      `).join('')}
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
`;

export default async function decorate(block) {
  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);
  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, 'p');

  block.innerHTML = '';
  block.append(template);
}
