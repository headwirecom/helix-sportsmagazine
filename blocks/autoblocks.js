import {
  bylineTemplate, shareTemplate, fullBleedArticleHero, imageEmbed,
} from './templates.js';
import { loadCSS, getMetadata, loadBlock } from '../scripts/scripts.js';
import { articleStyles, createTag } from '../utils/utils.js';

function loadStyles(main, metadata) {
  if (metadata.rubric === 'The Loop') {
    loadCSS(`${window.hlx.codeBasePath}/styles/loop-article-styles.css`);
  }
  if (metadata.articleStyle === articleStyles.FullBleed) {
    loadCSS(`${window.hlx.codeBasePath}/styles/fullbleed-article-styles.css`);
  }
  if (metadata.articleStyle === articleStyles.ProductListing) {
    loadCSS(`${window.hlx.codeBasePath}/styles/product-page-styles.css`);
  }
  if (metadata.articleStyle === articleStyles.Gallery
    || metadata.articleStyle === articleStyles.GalleryListicle) {
    loadCSS(`${window.hlx.codeBasePath}/styles/gallery-styles.css`);
  }
}

function buildArticleHero(main, metadata) {
  const titleEl = main.querySelector('h1');
  const picture = main.querySelector('picture');
  const credit = getMetadata('image-credit');
  const renderData = {
    rubric: metadata.rubric,
    articleTitle: titleEl.innerHTML,
    imageEmbedCreditLine: (credit) || '',
  };
  if (picture) {
    let tmpEl = document.createElement('div');
    tmpEl.append(picture);
    renderData.pictureHTML = tmpEl.innerHTML;
    picture.remove();
  } else {
    renderData.pictureHTML = '';
  }
  const articleHero = fullBleedArticleHero(renderData);
  titleEl.before(articleHero);
  titleEl.remove();
  return articleHero;
}

function buildArticleLead(main) {
  const picture = main.querySelector('picture');
  const credit = getMetadata('image-credit');
  const renderData = {
    imageEmbedCreditLine: (credit) || '',
  };
  const el = document.createElement('div');
  el.classList.add('article-lead');
  if (picture) {
    let tmpEl = document.createElement('div');
    tmpEl.append(picture);
    renderData.pictureHTML = tmpEl.innerHTML;
    const imgEmbed = imageEmbed(renderData);
    el.append(imgEmbed);
  }
  return el;
}

function buildRubric(main, metadata) {
  const rubricText = (metadata.rubric && metadata.rubric !== 'undefined') ? metadata.rubric : '';
  const rubric = `<span>${rubricText}</span>`;
  const el = document.createElement('p');
  el.setAttribute('class', 'rubric');
  el.innerHTML = rubric;
  return el;
}

function buildArticleHeadline(main) {
  const h1 = main.querySelector('h1');
  const text = h1.innerText;
  h1.innerHTML = `<span class="assetTitle-HeadlineText">${text}</span>`;
  h1.classList.add('assetTitle-Headline');
  const div = document.createElement('div');
  div.classList.add('assetTitle');
  div.append(h1);
  return div;
}

function buildBylineBlock(main, metadata) {
  const byline = bylineTemplate(metadata);
  const shareBlock = byline.querySelector('.share');
  shareBlock.setAttribute('data-block-name', 'share');
  loadBlock(shareBlock);

  const par = document.createElement('p');
  if (!byline.querySelector('.o-Attribution') && byline.querySelector('.byline-divider')) {
    byline.querySelector('.byline-divider').remove();
  }
  par.append(byline);
  return par;
}

function buildEmbedBlocks(main) {
  const EMBEDS = ['youtube', 'twitter', 'brightcove'];
  const links = main.getElementsByTagName('a');
  for (let link of links) {
    let url = link.innerHTML;
    if (EMBEDS.some((match) => url.includes(match))) {
      const embed = link.parentElement;
      embed.setAttribute('data-block-name', 'embed');
      loadBlock(embed);
    }
  }
}

function buildShareBlock(main, selector) {
  const defaultContent = (selector) ? main.querySelector(selector) : main.querySelector('.default-content-wrapper');
  const shareBlock = shareTemplate();
  defaultContent.append(shareBlock);
  loadBlock(shareBlock);
}

function decorateDocumentTitle(document) {
  const titleMetadata = getMetadata('pagetitle');
  if (titleMetadata && titleMetadata.length > 0) {
    document.querySelector('title').innerText = titleMetadata;
  }
}

function decorateFullBleedArticle(main, metadata) {
  const articleHero = buildArticleHero(main, metadata);
  const byline = buildBylineBlock(main, metadata);
  main.insertAdjacentElement('beforebegin', articleHero);
  main.querySelector('.default-content-wrapper').insertAdjacentElement('afterbegin', byline);
  buildEmbedBlocks(main);
  buildShareBlock(main);
}

function decorateDefaultArticle(main, metadata) {
  main.querySelector('article').classList.add('article-default');
  const rubric = buildRubric(main, metadata);
  main.querySelector('.article-body').before(rubric);
  const headline = buildArticleHeadline(main);
  main.querySelector('.article-body').before(headline);
  const byline = buildBylineBlock(main, metadata);
  main.querySelector('.article-body').before(byline);
  const lead = buildArticleLead(main, metadata);
  main.querySelector('.article-body').before(lead);
  buildEmbedBlocks(main);
  buildShareBlock(main);
}

function slideshowContainerHTML() {
  const template = `
    <div class="slideshow-overflow" style="width: 912px; height: 667px">
    <div class="start-slideshow-btn" role="button"><div class="start-slideshow-txt" role="presentation">View The Gallery</div></div>
    <div
      class="slideshow-container"
      style="
        transition-duration: 0ms;
        transform: translate3d(0px, 0px, 0px);
        transition-timing-function: cubic-bezier(0.445, 0.05, 0.55, 0.95);
      "
    ></div>
    <div class="slide-btn slide-btn-prev"></div>
    <div class="slide-btn slide-btn-next"></div>
  </div>
  <div class="slideshow-counter">
    <span class="counter-display">1/7</span>
  </div> 
    `;
  return template;
}
function decorateGallery(main, metadata) {
  const rubric = buildRubric(main, metadata);
  main.querySelector('.article-body').before(rubric);
  const headline = buildArticleHeadline(main);
  main.querySelector('.article-body').before(headline);
  const byline = buildBylineBlock(main, metadata);
  main.querySelector('.article-body').before(byline);

  const shareLabel = byline.querySelector('.o-SocialShare__a-ShareLabel');
  if (shareLabel) {
    console.log('removing share label');
    // byline share block does not have label on Gallery pages
    shareLabel.remove();
  } else {
    console.log('no share label?');
  }

  const first = main.querySelector('.default-content-wrapper').firstChild;
  if (first) {
    byline.before(first);
  }

  const slideshow = createTag(
    'div',
    {
      class: 'slideshow',
    },
  );
  const slideshowContainer = createTag(
    'div',
    {
      class: 'slideshow-wrapper',
      style: 'height: 667px',
    },
    slideshowContainerHTML(),
  ); // document.createElement('div');

  main.querySelector('.article-body').after(slideshow);
  main.querySelectorAll('.galleryimage-wrapper').forEach((el) => {
    el.querySelector('img').style.height = '667px';
    slideshowContainer.querySelector('.slideshow-container').append(el);
  });
  slideshow.append(slideshowContainer);

  const slideshowInfo = createTag(
    'div',
    {
      class: 'slideshow-slide-info',
    },
  );
  slideshow.append(slideshowInfo);

  const shareContainer = createTag('div', { class: 'share-wrapper' });
  slideshow.append(shareContainer);
  buildShareBlock(main, '.share-wrapper');
}

function decorateGalleryListicle(main, metadata) {
  const rubric = buildRubric(main, metadata);
  main.querySelector('.article-body').before(rubric);
  const headline = buildArticleHeadline(main);
  main.querySelector('.article-body').before(headline);
  const byline = buildBylineBlock(main, metadata);
  main.querySelector('.article-body').before(byline);

  const defaultContent = main.querySelector('.default-content-wrapper');
  if (defaultContent) {
    byline.before(defaultContent);
  }
}

function decorateProductPage() {

}

function decorateMain(main) {
  main.classList.add('container-site');
  const container = document.createElement('div');
  container.classList.add('container-article');
  container.innerHTML = `
    <article class='article-content'>
        <div class='content-wall'>
            <div class='article-body'></div>
        </div>
    </article>
    `;
  const articleBody = container.querySelector('.article-body');
  main.insertAdjacentElement('afterbegin', container);
  main.querySelectorAll('.section').forEach((el) => {
    articleBody.append(el);
  });
}

export default function decorate(main, metadata) {
  decorateDocumentTitle(document);
  loadStyles(main, metadata);
  decorateMain(main);
  switch (metadata.articleStyle) {
    case articleStyles.FullBleed:
      decorateFullBleedArticle(main, metadata);
      break;
    case articleStyles.LongForm:
      break;
    case articleStyles.OpenArticle:
      break;
    case articleStyles.Gallery:
      decorateGallery(main, metadata);
      break;
    case articleStyles.GalleryListicle:
      decorateGalleryListicle(main, metadata);
      break;
    case articleStyles.ProductListing:
      decorateProductPage(main);
      break;
    default:
      decorateDefaultArticle(main, metadata);
  }
}
