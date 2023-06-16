import { getMetadata } from '../../scripts/lib-franklin.js';

function decorateMetadataContent(containerEL, key) {
  const value = getMetadata(key);
  if (value) {
    containerEL.innerHTML = value;
  }
}

function decorateAttribution(attributionEL) {
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

function decorateMain(main) {
  const defaultContent = main.querySelector('.default-content-wrapper');
  const defaultTitle = defaultContent.querySelector('h1');
  if (defaultTitle) {
    main.querySelector('.article-title span').innerHTML = defaultTitle.innerHTML;
    defaultTitle.remove();
  }
  main.querySelector('.article-lead-description').innerHTML = defaultContent.innerHTML;
  defaultContent.remove();
  decorateMetadataContent(main.querySelector('.article-topline .rubric span'), 'rubric');
  decorateAttribution(main.querySelector('.attribution-author-prefix'));
  decorateMetadataContent(main.querySelector('.article-byline .publish-date'), 'publication-date');
}

export default function decorate(main, template) {
  if (template) {
    const templateEl = template.querySelector('main');
    const articleBody = templateEl.querySelector('.article-body');
    main.querySelectorAll('.section').forEach((section) => { articleBody.append(section); });
    main.innerHTML = templateEl.innerHTML;
    main.classList = templateEl.classList;
    decorateMain(main);
  }
  document.body.classList.add('gallery');
}
