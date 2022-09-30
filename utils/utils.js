const PRODUCTS_URL = '/products/test-product-list-ballmarker.json';

export async function loadProducts(url = PRODUCTS_URL) {
    const resp = await fetch(url);
    if (!resp.ok) return {};
    const json = await resp.json();
    return json.data;
}

export async function getProduct(productID) {
    const productData = await loadProducts();
    for (let i in productData) {
        var p = productData[i];
        if (p['Product ID'] === productID) {
            return p;
        }
    }
}

export function createTag(tag, attributes, html) {
    const el = document.createElement(tag);
    if (html) {
      if (html instanceof HTMLElement || html instanceof SVGElement) {
        el.append(html);
      } else {
        el.insertAdjacentHTML('beforeend', html);
      }
    }
    if (attributes) {
      Object.entries(attributes).forEach(([key, val]) => {
        el.setAttribute(key, val);
      });
    }
    return el;
}