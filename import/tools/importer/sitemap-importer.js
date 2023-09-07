const BULK_URLS_STORAGE_ID = 'option-field-import-urls';

function append(s) {
  const logEL = document.querySelector('.log');
  const el = document.createElement('div');
  if (isJSONOutput) {
    el.innerText = s;
  } else {
    el.innerHTML = s;
  }
  logEL.append(el);
}

let counter = 0;
let totalCounter = 0;
let isJSONOutput = false;
let _showCount = false;
let callback = (url, props = {}, doc) => {
  counter++;
  if (isJSONOutput) {
    if (props && props.longURL) {
      append(`{ "${url}": "${props.longURL}" },`);
    } else {
      append(`"${url}",`);
    }
  } else {
    let output = `<a href="${url}" target="_blank">${url}</a>`;
    if (props && props.longURL) {
      output = output + ` : <a href="${props.longURL}" target="_blank">${props.longURL}</a>`
    }
    if (_showCount) append(`${counter} ${output}`);
    else append(output);
  }

  if (props.updateImporter) {
    (props.longURL) ? addToBulkImport(props.longURL) : addToBulkImport(url);
  }
};

function matchUrlsFilter(url) {
  // match everything if not root urls entered (aka full site import)
  if (urlsFilter.length === 0) return true;
  for (const filter of urlsFilter) {
    if (url.startsWith(filter)) return true;
  }
  return false;
}

async function fetchDocument(url) {
  const resp = await fetch(url);
  if (resp.ok) {
    const text = await resp.text();
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/html');
  } else {
    console.log(`Unable to fetch ${url}. Response status: ${resp.status}`);
  }
}

function isPageTypeDocument(doc, pageTypeSelector) {
  if (doc) {
    const el = doc.querySelector(pageTypeSelector);
    if (el) {
      return true;
    }
  }
  return false;
}

async function isPageType(url, pageTypeSelector, doc) {
  const d = (doc) ? doc : await fetchDocument(url);
  return isPageTypeDocument(d, pageTypeSelector);
}

export function addToBulkImport(url) {
  // console.log(`Add ${url} to importer localStorage`);
  let urls = localStorage.getItem(BULK_URLS_STORAGE_ID);
  if (urls) {
    urls = `${urls}\n${url}`;
  } else {
    urls = url;
  }
  localStorage.setItem(BULK_URLS_STORAGE_ID, urls);
}

function clearBulkImport() {
  // console.log(`Clearing ${BULK_URLS_STORAGE_ID} from localStorage`);
  localStorage.removeItem(BULK_URLS_STORAGE_ID);
}

async function decompress(blob) {
  /* eslint-disable no-undef */
  const ds = new DecompressionStream('gzip');
  const decompressedStream = blob.stream().pipeThrough(ds);
  return await new Response(decompressedStream).text();
}

function getLongURL(doc, shortURL) {
  const url = new URL(shortURL);
  const contentPath = doc.body.getAttribute('data-page-path');
  if (!contentPath) {
    throw new Error(`Can't get long path from document ${shortURL}. The data-page-path is undefined.`);
  }
  return `${url.protocol}//${url.hostname}${contentPath}.html`;
}

async function process(options) {
  let {url, showCount, updateImporter, pageTypeSelector, longForm, shortToLongMap} = options;
  let longUrl = url;
  let doc = null;
  let props = { showCount, updateImporter };
  if (longForm) {
    doc = await fetchDocument(longUrl);
    if (doc) {
      url = getLongURL(doc, longUrl);
    } else {
      return;
    }
  }
  if (shortToLongMap) {
    doc = await fetchDocument(longUrl);
    if (doc) {
      props.longURL = getLongURL(doc, longUrl);
    } else {
      return;
    }
  }
  const matchPageType = (!pageTypeSelector || pageTypeSelector === 'all') ? true : await isPageType(longUrl, pageTypeSelector, doc);
  if (matchPageType) {
    callback(url, props, doc);
  }
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function processAll(urls, options, concurrency = 1) {
  while (urls.length) {
    const dequeue = async () => {
      for (let i = 0; i < concurrency && urls.length; i += 1) {
        const url = urls.shift();
        options.url = url;
        try {
          process(options);
        } catch (e) {
          console.error(e);
        }
      }
    }

    dequeue();
    await sleep(200);
  }
}

export function setCallback(f) {
  callback = f;
}

export const urlsFilter = [];

export async function parse(options) {
  if (options.logAsJson && !isJSONOutput) {
    isJSONOutput = true;
    document.querySelector('.log').append('[');
  }
  await parseSitemap(options);
  if (isJSONOutput) {
    document.querySelector('.log').append(']');
  }
}

export async function parseSitemap(options) {
  let {
    path,
    showCount,
    updateImporter,
    pageTypeSelector,
    longForm,
    shortToLongMap
  } = options;

  _showCount = showCount;

  if (updateImporter && counter === 0) {
    clearBulkImport();
  }

  const resp = await fetch(path);
  if (!resp.ok) {
    return null;
  }

  let text = '';
  if (path.endsWith('.gz')) {
    const blob = await resp.blob();
    text = await decompress(blob);
  } else {
    text = await resp.text();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const sitemaps = [...doc.querySelectorAll('sitemap')];
  const links = [...doc.querySelectorAll('url')];

  for(const sitemap of sitemaps) {
    const url = sitemap.querySelector('loc').childNodes[0].nodeValue;
    await parseSitemap({path: url, showCount, updateImporter, pageTypeSelector, longForm: longForm, shortToLongMap});
  }

  let urls = [];
  while (links.length) {
    const el = links.shift();
    const url = el.querySelector('loc').childNodes[0].nodeValue;
    const matchUrlFilter = matchUrlsFilter(url);
    if (matchUrlFilter) {
      totalCounter++;
      console.log(`${totalCounter} ${url} matched url filter.`);
      urls.push(url);
    }

    if (urls.length > 500) {
      await processAll(urls, {showCount, updateImporter, pageTypeSelector, longForm, shortToLongMap}, 4);
    }
  }

  await processAll(urls, {showCount, updateImporter, pageTypeSelector, longForm, shortToLongMap}, 1);
}
