const PRODUCTS_URL = '/products/test-product-list-ballmarker.json';

const productsCache = [];
function addToProductsCache(products) {
    // could use window.sessionStorage
    if (isCached(products)) return;
    if (productsCache.length === 0) {
        console.log('Register DOMContentLoaded listener');
        document.addEventListener('DOMContentLoaded', function (e) { 
            console.log('DOM Loaded. Clearing cache'); 
        });
    }
    productsCache.push(products);
    console.log("products added to chache: " + (productsCache.length+1));
}

function findProductInCache(productID) {
    for (let i in productsCache) {
        let p = findProduct(productsCache[i], productID);
        if (p) {
            console.log("found in cheche: " + productID);
            return p;
        }
    }
}

function isCached(products) {
    for (let i in productsCache) {
        if (productsCache[i][0]['Product ID'] === products[0]['Product ID']) {
            return true;
        }
    }
    return false;
}

function findProduct(products, productID) {
    return products.find(p => p['Product ID'] === productID);
}

export function clearProductCache() {
    while (productsCache.length > 0) {
        productsCache.pop();
    }
}

export async function loadProducts(url = PRODUCTS_URL, offset=0, limit=1000) {
    const resp = await fetch(url+'?offset='+offset+'&limit='+limit);
    if (!resp.ok) return {};
    const json = await resp.json();
    return json;
}

export async function getProduct(productID) {
    console.log('getting product id ' + productID);
    var p = findProductInCache(productID);
    if (p) {
        return p;
    }

    var json = await loadProducts();
    if(!json.data) return;
    var totalRecords = json.total;
    var count = 0;
    
    do {
        addToProductsCache(json.data, productID);
        let p = findProduct(json.data, productID);
        if (p) return p;
        count =+ json.data.length;
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