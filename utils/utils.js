import { getMetadata } from "../scripts/scripts.js"

const PRODUCTS_URL = '/products/test-product-list-ballmarker.json';
const PRODUCTS_REQUEST_LIMIT = 1000;
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

export const articleStyles = {
    Default:"DefaultArticle",
    FullBleed:"FullBleed",
    LongForm:"LongForm",
    OpenArticle:"OpenArticle",
    LiveStream:"LiveStream",
    Gallery:"Gallery",
    GalleryListicle:"Gallery Listicle"
};

export function getArticleStyle() {
    return getMetadata('article-style');
}

export async function loadJsonData(url) {
    const resp = await fetch(url);
    if (!resp.ok) return {};
    const json = await resp.json();
    return json;
}

export function clearProductCache() {
    while (productsCache.length > 0) {
        productsCache.pop();
    }
}

export async function loadProductRaw(raw) {
    const resp = await fetch(PRODUCTS_URL+'?offset='+raw+'&limit=1');
    if (!resp.ok) return {};
    const json = await resp.json();
    return json.data[0];
}

export async function loadProducts(url = PRODUCTS_URL, offset=0) {
    const resp = await fetch(url+'?offset='+offset+'&limit='+PRODUCTS_REQUEST_LIMIT);
    if (!resp.ok) return {};
    const json = await resp.json();
    return json;
}

export async function getProduct(productID) {
    console.log('getting product id ' + productID);
    if (productID.startsWith('raw-')) {
        const raw = productID.split('-')[1];
        return loadProductRaw(raw);
    }
    
    var p = findProductInCache(productID);
    if (p) {
        return p;
    }

    var offset = productsCache.length*PRODUCTS_REQUEST_LIMIT;
    var json = await loadProducts(PRODUCTS_URL, offset);
    if(!json.data) return;
    var totalRecords = json.total;
    var count = 0;
    
    do {
        addToProductsCache(json.data, productID);
        let p = findProduct(json.data, productID);
        if (p) return p;
        count =+ json.data.length;
        if (count < totalRecords) {
            offset = json.offset + json.limit;
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

export function createTagFromString(html, parentTag = 'div', attributes) {
    const el = createTag(parentTag, attributes, html);
    return el;
}

export function loadScript(url, callback, type) {
    const head = document.querySelector('head');
    const script = document.createElement('script');
    script.src = url;
    if (type) {
        script.setAttribute('type', type);
    }
    script.onload = callback;
    head.append(script);
    return script;
}

export function jsonp(url) {
    return new Promise(function(resolve, reject) {
        let scriptTag = document.createElement('script');
        const callbackFunc = "_jsonp_" + Math.round(100000 * Math.random());
        if (url.match(/\?/)) url += "&callback="+callbackFunc
        else url += "?callback="+callbackFunc
        scriptTag.src = url;
        window[callbackFunc] = function(data) {
            resolve(data);
            document.body.removeChild(scriptTag);
            delete window[callbackFunc];
        }
        document.body.append(scriptTag);
    });
}
