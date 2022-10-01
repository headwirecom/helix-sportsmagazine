const PRODUCTS_URL = '/products/test-product-list-ballmarker.json';

export async function loadProducts(url = PRODUCTS_URL, offset=0, limit=1000) {
    console.log("loading products from " + url+'?offset='+offset+'&limit='+limit);
    const resp = await fetch(url+'?offset='+offset+'&limit='+limit);
    if (!resp.ok) return {};
    const json = await resp.json();
    return json;
}

export async function getProduct(productID) {
    var json = await loadProducts();
    if(!json.data) return;

    var totalRecords = json.total;
    var count = 0;
    
    do {
        let productData = json.data;
        for (let i in productData) {
            var p = productData[i];
            if (p['Product ID'] === productID) {
                console.log("found product [" + productID + "] after offset " + json.offset);
                return p;
            }
            count++;
        }

        if (count < totalRecords) {
            let offset = json.offset + json.limit;
            json = await loadProducts(PRODUCTS_URL, offset);
        }
    } while(count < totalRecords);
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