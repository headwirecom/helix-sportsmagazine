const BULK_URLS_STORAGE_ID = 'option-field-import-urls';

let counter = 0;
let totalCounter = 0;
let isJSONOutput = false;

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

function append(s) {
  const logEL = document.querySelector('.log');
  const el = document.createElement('div');
  if (isJSONOutput) {
    const txt = `"${s}",`;
    el.innerText = txt;
  } else {
    el.innerHTML = s;
  }
  logEL.append(el);
}

function addToBulkImport(url) {
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
  return `${url.protocol}//${url.hostname}${contentPath}.html`;
}

async function process(options) {
  let {url, showCount, updateImporter, pageTypeSelector, longForm} = options;
  let longUrl = url;
  let doc = null;
  if (longForm) {
    doc = await fetchDocument(longUrl);
    url = getLongURL(doc, longUrl);
  }
  const matchPageType = (!pageTypeSelector || pageTypeSelector === 'all') ? true : await isPageType(longUrl, pageTypeSelector, doc);
  totalCounter++;
  if (matchPageType) {
    counter++;
    if (isJSONOutput) {
      append(url);
    } else {
      if (showCount) append(`${counter} <a href="${url}" target="_blank">${url}</a>`);
      else append(`<a href="${url}" target="_blank">${url}</a>`);
    }
    if (updateImporter) {
      addToBulkImport(url);
    }
  }
} 

export const urlsFilter = [];

export async function parse(options) {
  if (options.logAsJson && !isJSONOutput) {
    isJSONOutput = true;
    document.querySelector('.log').append('[');
  }
  parseSitemap(options).then(() => {
    if (isJSONOutput) {
      document.querySelector('.log').append(']');
    }
  });
}

export async function parseSitemap(options) {
  let {
    path, 
    showCount, 
    updateImporter, 
    pageTypeSelector,
    longForm 
  } = options;

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
    await parseSitemap({path: url, showCount, updateImporter, pageTypeSelector, longForm: longForm});
  }

  let urls = [];
  for(const el of links) {
    const url = el.querySelector('loc').childNodes[0].nodeValue;
    const matchUrlFilter = matchUrlsFilter(url);
    if (matchUrlFilter) {
      urls.push(url);
    }
  }
  
  if ((!pageTypeSelector || pageTypeSelector === 'all') && !longForm) {
    while (urls.length) {
      const url = urls.shift();
      await process({url, showCount, updateImporter, pageTypeSelector, longForm});
    }
  } else {
    const dequeue = async () => {
      while (urls.length) {
        const url = urls.shift();
        try {
          // console.log(`(${totalCounter}) Document ${url} processing ... of ${urls.length}`);
          await process({url, showCount, updateImporter, pageTypeSelector, longForm});
        } catch (error) {
          console.error(`error processing ${url} : ${error.message}`);
        }
      }
    }
  
    const concurrency = 5;
    for (let i = 0; i < concurrency; i += 1) {
      dequeue();
    }
  }

}
