import { createTag } from '../../utils/utils.js';

function getRowClassName(field) {
  return field.trim().replace(' ', '-').toLowerCase();
}

function getOrCreatePriceWrapper(textContainer) {
  let el = textContainer.querySelector('.price-wrapper');
  if (!el) {
    el = createTag('div', { class: 'price-wrapper' });
    textContainer.append(el);
  }
  return el;
}
function decorateRow(row, container, textContainer, mediaContainer) {
  const field = row.querySelector('div');
  const className = getRowClassName(field.innerHTML);
  field.remove();
  if (className === 'brand') {
    const brandText = row.querySelector('div').innerHTML.trim();
    if (brandText && brandText.length > 0) {
      const brandEl = createTag('h2', { class: 'brand' }, row.querySelector('div').innerHTML);
      textContainer.append(brandEl);
    }
    row.remove();
  } else if (className === 'title') {
    const titleEl = createTag('h1', { class: 'productTitle' }, row.querySelector('div').innerHTML);
    textContainer.append(titleEl);
    row.remove();
  } else if (className === 'price') {
    const priceWrapper = getOrCreatePriceWrapper(textContainer);
    priceWrapper.append(createTag('span', { class: 'price' }, row.querySelector('div').innerHTML));
    priceWrapper.append(createTag('span', { class: 'separator' }, '|'));
    row.remove();
  } else if (className === 'advertiser') {
    const priceWrapper = getOrCreatePriceWrapper(textContainer);
    priceWrapper.append(createTag('span', { class: className }, row.querySelector('div').innerHTML));
    row.remove();
  } else if (className === 'image') {
    mediaContainer.append(row.querySelector('picture'));
    row.remove();
  } else {
    row.classList.add(className);
    textContainer.append(row);
  }
}

export default function decorate(block) {
  const textContainer = createTag('div', { class: 'text-container' });
  const mediaContainer = createTag('div', { class: 'media-container' });
  block.querySelectorAll(':scope > div').forEach((row) => {
    decorateRow(row, block, textContainer, mediaContainer);
  });
  block.append(textContainer);
  block.append(mediaContainer);
}
