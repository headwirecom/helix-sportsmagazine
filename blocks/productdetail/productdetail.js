import { getProduct, createTag } from '../../utils/utils.js';

export default function decorate(block) {
  const container = block.children[0];
  const productID = container.children[0].innerHTML;
  getProduct(productID).then((product) => decorateProductDetail(container, productID, product));
}

function decorateProductDetail(container, productID, product) {
  if (product) {
    const titleTag = createTag('h2', {}, product.Title);
    container.appendChild(titleTag);

    const imgTag = createTag(
      'img',
      {
        src: product['Image URL'],
        width: '966',
        height: '966',
      },
    );
    container.appendChild(imgTag);

    const priceTag = createTag('p', {}, `$${product.Price} | ${product.Source}`);
    container.appendChild(priceTag);

    const buttonLinkTag = createTag('a', {
      href: product['Product URL'],
      title: product['Product URL'],
      class: 'button primary',
    }, 'BUY NOW');
    const buttonContainerTag = createTag('p', { class: 'button-container' }, buttonLinkTag);
    container.appendChild(buttonContainerTag);
  } else {
    container.children[0].innerHTML = `Product ${productID} not found!`;
  }
}
