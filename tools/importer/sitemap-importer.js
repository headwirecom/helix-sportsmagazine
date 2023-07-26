const BULK_URLS_STORAGE_ID = 'option-field-import-urls';

let counter = 0;

function matchUrlsFilter(url) {
  // match everything if not root urls entered (aka full site import)
  if (urlsFilter.length === 0) return true;
  for (const filter of urlsFilter) {
    if (url.startsWith(filter)) return true;
  }
  return false;
}

async function isPageType(url, pageTypeSelector) {
  if (!pageTypeSelector || pageTypeSelector === 'all') {
    return true;
  }

  const resp = await fetch(url);
  if (!resp.ok) {
    return false;
  }

  const text = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const el = doc.querySelector(pageTypeSelector);
  if (el) {
    return true;
  }

  return false;
}

function append(s) {
  const el = document.createElement('div');
  el.innerHTML = s;
  document.querySelector('.log').append(el);
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

export const urlsFilter = [];

export async function parseSitemap(path, showCount, updateImporter, pageTypeSelector) {
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

  doc.querySelectorAll('sitemap').forEach(async (sitemap) => {
    const url = sitemap.querySelector('loc').childNodes[0].nodeValue;
    await parseSitemap(url, showCount, updateImporter, pageTypeSelector);
  });

  doc.querySelectorAll('url').forEach(async (el) => {
    const url = el.querySelector('loc').childNodes[0].nodeValue;
    if (matchUrlsFilter(url) && await isPageType(url, pageTypeSelector)) {
      counter++;
      if (showCount) append(`${counter} <a href="${url}" target="_blank">${url}</a>`);
      else append(`<a href="${url}" target="_blank">${url}</a>`);
      if (updateImporter) {
        addToBulkImport(url);
      }
    }
  });
}
