import importJs from "./import.js"

let counter = 0;

function matchUrlsFilter(url) {
    // match everything if not root urls entered (aka full site import)
    if (urlsFilter.length === 0) return true;
    for (let filter of urlsFilter) {
        if (url.startsWith(filter)) return true;
    }
    return false;
}

function append(s) {
    const el = document.createElement('div');
    el.innerText = s;
    document.querySelector('.log').append(el);
}

async function decompress(blob) {
    const ds = new DecompressionStream("gzip");
    const decompressedStream = blob.stream().pipeThrough(ds);
    return await new Response(decompressedStream).text();
}

export const urlsFilter = [];

export async function parseSitemap(path, showCount) {
    const resp = await fetch(path);
    if (!resp.ok) {
        return null;
    }

    let text = '';
    if (path.endsWith('.gz')) {
        const blob = await resp.blob()
        text = await decompress(blob);
    } else {
        text = await resp.text();
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');

    doc.querySelectorAll('sitemap').forEach(async (sitemap) => {
        const url = sitemap.querySelector('loc').childNodes[0].nodeValue;
        await parseSitemap(url, showCount);
    });

    doc.querySelectorAll('url').forEach(el => {
        const url = el.querySelector('loc').childNodes[0].nodeValue;
        if (matchUrlsFilter(url)) {
            counter++;
            if(showCount) append(`${counter} ${url}`);
            else append(`${url}`);
        }
    });
}