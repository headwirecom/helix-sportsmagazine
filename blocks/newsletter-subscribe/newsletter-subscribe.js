import {
  assignSlot,
  parseFragment,
  render,
  ARTICLE_TEMPLATES,
  validateEmail,
  debouncedFunction,
} from '../../scripts/scripts.js';
import {
  createOptimizedPicture,
} from '../../scripts/lib-franklin.js';

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const response = await fetch('/custom-data.json?sheet=email-subscribe-list&limit=25');
  const { data } = await response.json();

  const subscriptionsObj = {};

  const generateListItem = (
    {
      title = '', description = '', image = '', imageAlt = '', subscriptionValue = '',
    } = {},
    index=0,
  ) => {
    subscriptionsObj[subscriptionValue] = true;
    return `
  <li class="subscribe-item">
    <div class="image-wrapper">
      ${
  createOptimizedPicture(image, imageAlt, index < 2, [
    { media: '(max-width: 600px)', width: '115' },
    { width: '285' },
  ]).outerHTML
}
    </div>

    <div class="text-wrapper">
      <label class="item-title" for="checkbox-${index}">
        ${title}
      </label>
      <p>
        ${description}
      </p>
    </div>

    <div class="checkbox-wrapper">
      <input type="checkbox" id="checkbox-${index}" value="${subscriptionValue}" checked class="toggle"></input>
    </div>
  </li>
  `;
  };

  // HTML template in JS to avoid extra waterfall for LCP blocks
  const HTML_TEMPLATE = `
<div class="form-wrapper">
  <form class="subscribe-form">
    <div class="title-wrapper">
      <slot name="title"></slot>
      <slot name="description"></slot>
      <slot name="tos-top"></slot>
    </div>

    <div class="controls-wrapper">
      <div class="email-input-wrapper">
        <input class="email-input" type="email" placeholder="email address *"></input>
        <span class="invalid-email-text">Invalid email</span>
      </div>
      <div class="subscribe-to-all-wrapper">
        <label for="all-checkbox" class="toggle-label">Subscribe to all</label>
        <input type="checkbox" checked id="all-checkbox" class="toggle"></input>
      </div>
    </div>

    <div class="subscribe-list-wrapper">
      <ul class="subscribe-list">
        ${data.map((item, index) => generateListItem(item, index)).join('')}
      </ul>
    </div>

    <div class="form-footer">
      <input type="submit" class="sign-up-button">
        Sign Up
      </input>

      <slot name="footer-privacy"></slot>
      <slot name="footer-tos-links"></slot>
    </div>
  </form>
</div>
`;

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // Identify slots
  assignSlot(block, 'title', 'h1, h2, h3');
  assignSlot(block, 'description', '.newsletter-subscribe.block > div > div > div:has(h2) + div:has(p)');
  assignSlot(block, 'tos-top', '.newsletter-subscribe.block > div > div > div:has(h2) + div:has(p) + div:has(p a)');
  assignSlot(
    block,
    'footer-privacy',
    '.newsletter-subscribe.block > div > div > div:has(h2) + div:has(p) + div:has(p a) + div:has(p a)',
  );
  assignSlot(
    block,
    'footer-tos-links',
    '.newsletter-subscribe.block > div > div > div:has(h2) + div:has(p) + div:has(p a) + div:has(p a) + div:has(p a)',
  );

  render(template, block, ARTICLE_TEMPLATES.NewsletterSubscribe);

  // Update block with rendered template
  block.innerHTML = '';
  block.append(template);

  // handle email input & debounced validation
  const emailField = document.querySelector('.subscribe-form .email-input');

  emailField.oninput = () => {
    debouncedFunction(() => {
      const valid = !!validateEmail(emailField.value);
      if (valid) {
        emailField.classList.remove('invalid');
        emailField.classList.add('valid');
      } else {
        emailField.classList.remove('valid');
        emailField.classList.add('invalid');
      }
    }, 1000);
  };

  // handle on clicks
  const subscribeToAllCheckbox = document.querySelector('.subscribe-form input[type="checkbox"]#all-checkbox');

  const handleAllClick = (event) => {
    if (event.target.checked === true) {
      for (const subscription in subscriptionsObj) {
        subscriptionsObj[subscription] = true;
        document.querySelector(
          `.subscribe-form .subscribe-list input[type="checkbox"][value="${subscription}"]`,
        ).checked = true;
      }
    }
  };

  subscribeToAllCheckbox.onclick = handleAllClick;

  const clickHandler = (event) => {
    subscriptionsObj[event.target.value] = event.target.checked;
    if (event.target.checked === false) {
      subscribeToAllCheckbox.checked = false;
    }
  };

  const checkboxes = document.querySelectorAll('.subscribe-form .subscribe-list input[type="checkbox"]');
  checkboxes.forEach((input) => {
    input.onclick = clickHandler;
  });

  // handling submit
  const subscribeForm = document.querySelector('form.subscribe-form');

  subscribeForm.onsubmit = (e) => {
    e.preventDefault();
    if (validateEmail(emailField.value)) {
      emailField.classList.remove('valid');
      emailField.classList.add('invalid');
      emailField.focus();
      return;
    }
    const selectedSubscriptions = Object.keys(subscriptionsObj)
      .filter((subscription) => subscriptionsObj[subscription])
      .join(', ');

    console.warn(`Form Submit not implemented\n
\x1b[34memail: ${emailField.value}
\x1b[31mselected Subscriptions: ${selectedSubscriptions}`);
  };
}
