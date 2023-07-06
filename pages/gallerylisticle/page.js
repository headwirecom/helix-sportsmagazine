import { decorateSocialShare, decorateMetadataContent, decorateAttribution } from '../common/common.js';

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
  decorateSocialShare(main);
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
