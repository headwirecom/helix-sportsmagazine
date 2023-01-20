import { bylineTemplate, shareTemplate, fullBleedArticleHero, imageEmbed } from "./templates.js";
import { loadCSS, getMetadata } from "../scripts/scripts.js"
import { articleStyles, createTag } from "../utils/utils.js";

function loadStyles(main, metadata) {
    if (metadata.rubric === 'The Loop') {
        loadCSS(`${window.hlx.codeBasePath}/styles/loop-article-styles.css`);
    }
    if (metadata.articleStyle == articleStyles.FullBleed) {
        loadCSS(`${window.hlx.codeBasePath}/styles/fullbleed-article-styles.css`);
    }
    if (metadata.articleStyle == articleStyles.Gallery) {
        loadCSS('https://golfdigest.sports.sndimg.com/etc/clientlibs/golfdigestcom/dist/photoGalleryPage.md5-c51fd0710d7ab2a6a2f540aad15984d7.css');
    }
}

function loadBlock(block, name) {
    import(`${window.hlx.codeBasePath}/blocks/${name}/${name}.js`).then(mod => {
        loadCSS(`${window.hlx.codeBasePath}/blocks/${name}/${name}.css`);
        mod.default(block);
    });
}

function buildArticleHero(main, metadata) {
    const titleEl = main.querySelector('h1');
    const picture = main.querySelector('picture');
    const renderData = {
        rubric : metadata.rubric,
        articleTitle: titleEl.innerHTML,
        imageEmbedCreditLine: getMetadata('image-credit')
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

function buildArticleLead(main, metadata) {
    const picture = main.querySelector('picture');
    const renderData = {
        imageEmbedCreditLine: getMetadata('image-credit')
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
    const rubricText = (metadata.rubric && metadata.rubric != 'undefined') ? metadata.rubric : '';
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
    loadBlock(shareBlock, 'share');
    const par = document.createElement('p');
    par.append(byline);
    return par;
}

function buildEmbedBlocks(main) {
    const EMBEDS = ['youtube', 'twitter', 'brightcove'];
    const links = main.getElementsByTagName('a');
    for (let link of links) {
        let url = link.innerHTML;
        if (EMBEDS.some(match => url.includes(match))) {
            loadBlock(link.parentElement, 'embed');
        }
    }
}

function buildShareBlock(main) {
    const defaultContent = main.querySelector('.default-content-wrapper');
    const shareBlock = shareTemplate();
    defaultContent.append(shareBlock);
    loadBlock(shareBlock, 'share');
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
    const template = 
    `
    <div class="slideshow-overflow rsOverflow" style="width: 1000px; height: 667px">
    <div
      class="slideshow-container rsContainer"
      style="
        transition-duration: 0ms;
        transform: translate3d(0px, 0px, 0px);
        transition-timing-function: cubic-bezier(0.445, 0.05, 0.55, 0.95);
      "
    ></div>
    <div class="rsArrow rsArrowLeft rsArrowDisabled" role="button" aria-label="Previous photo" style="display: block">
      <div class="rsArrowIcn"></div>
    </div>
    <div class="rsArrow rsArrowRight" role="button" aria-label="Next photo" style="display: block">
      <div class="rsArrowIcn"></div>
    </div>
  </div>
  <div class="slideshow-counter rsSlideCount">
    <span class="counter-display rsCurr">1/7</span>
  </div>
    `;
    return template
}
function decorateGallery(main, metadata) {
    const rubric = buildRubric(main, metadata);
    main.querySelector('.article-body').before(rubric);
    const headline = buildArticleHeadline(main);
    main.querySelector('.article-body').before(headline);
    const byline = buildBylineBlock(main, metadata);
    main.querySelector('.article-body').before(byline);

    const first = main.querySelector('.default-content-wrapper').firstChild;
    if (first) {
        byline.before(first);
    }

    const slideshowContainer = createTag(
        'div', 
        {
            class: "slideshow-wrapper",
            style: "height: 666.667px"
        },
        slideshowContainerHTML()); // document.createElement('div');
    slideshowContainer.classList.add('slideshow-wrapper');
    main.querySelector('.article-body').after(slideshowContainer);
    main.querySelectorAll('.galleryimage-wrapper').forEach(el => { slideshowContainer.querySelector('.slideshow-container').append(el); });

    const slideBtnPrev = document.createElement('div');
    slideBtnPrev.classList.add('slide-btn');
    slideBtnPrev.classList.add('slide-btn-prev');
    slideshowContainer.append(slideBtnPrev);

    const slideBtnNext = document.createElement('div');
    slideBtnNext.classList.add('slide-btn');
    slideBtnNext.classList.add('slide-btn-next');
    slideshowContainer.append(slideBtnNext);

    // just tmp placeholder text to test the UI
    slideBtnNext.innerHTML = "Next";
    slideBtnPrev.innerHTML = "Prev";
}

function decorateGalleryListicle(main, metadata) {
    const rubric = buildRubric(main, metadata);
    main.querySelector('.article-body').before(rubric);
    const headline = buildArticleHeadline(main);
    main.querySelector('.article-body').before(headline);
    const byline = buildBylineBlock(main, metadata);
    main.querySelector('.article-body').before(byline);

    const first = main.querySelector('.default-content-wrapper').firstChild;
    byline.before(first);
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
    main.querySelectorAll('.section').forEach(el => {
        articleBody.append(el);
    });
}

export default function decorate(main, metadata) {
    loadStyles(main, metadata);
    decorateMain(main);
    switch(metadata.articleStyle) {
        case articleStyles.FullBleed:
            decorateFullBleedArticle(main, metadata);
            break;
        case articleStyles.LongForm:
            break;
        case articleStyles.OpenArticle:
            break;
        case articleStyles.Gallery:
            decorateGallery(main, metadata) 
            break;
        case articleStyles.GalleryListicle:
            decorateGalleryListicle(main, metadata) 
            break;
        default:
            decorateDefaultArticle(main, metadata);
    }
}