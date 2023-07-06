import { getMetadata } from '../../scripts/lib-franklin.js';

function decorateSocialShareList(list) {
  const url = encodeURIComponent(window.location.href);
  const uuid = crypto.randomUUID();
  list.querySelectorAll('.social-share-btn').forEach((btn) => {
    const network = btn.getAttribute('data-social-share-network');
    const id = `icon-${network}-${uuid}`;
    btn.querySelector('symbol').id = id;
    btn.querySelector('use').setAttribute('xlink:href', `#${id}`);
    btn.href = `${btn.href}${url}`;
  });
}

export function decorateSocialShare(main) {
  main.querySelectorAll('.socialshare-icons').forEach((list) => {
    decorateSocialShareList(list);
  });
}

export function decorateMetadataContent(containerEL, key) {
  const value = getMetadata(key);
  if (value) {
    containerEL.innerHTML = value;
  }
}

export function decorateAttribution(attributionEL) {
  const authorMetadata = getMetadata('author');
  const authorUrlMetadata = getMetadata('author-url');
  if (authorMetadata) {
    const names = authorMetadata.split(',');
    const urls = (authorUrlMetadata) ? authorUrlMetadata.split(',') : [];

    let i = 0;
    let s = '';
    names.forEach((n) => {
      let span = null;
      if (i < urls.length) {
        span = `<span class="attribution-name"><a href="${urls[i]}">${n}</a></span>`;
      } else {
        span = `<span class="attribution-name">${n}</span>`;
      }

      if (s.length > 0) {
        s = `${s} and ${span}`;
      } else {
        s = `${span}`;
      }
      i += 1;
    });
    attributionEL.innerHTML = s;
  }
}
