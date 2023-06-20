import { getMetadata } from '../../scripts/lib-franklin.js';

let imageBlockCount = 0;
let currentIndex = 0;

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

function decorateSocialShare(main) {
  main.querySelectorAll('.socialshare-icons').forEach((list) => {
    decorateSocialShareList(list);
  });
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
  decorateSocialShare(main);
}

function updateCounter() {
  document.querySelector('.slideshow-counter > .counter-display').innerHTML = `${currentIndex + 1}/${imageBlockCount}`;
}

function updateNav() {
  const btnPrev = document.querySelector('.slide-btn-prev');
  const btnNext = document.querySelector('.slide-btn-next');
  switch (currentIndex) {
    case 0:
      btnPrev.style.display = 'none';
      btnNext.style.display = 'block';
      break;
    case imageBlockCount - 1:
      btnPrev.style.display = 'block';
      btnNext.style.display = 'none';
      break;
    default:
      btnPrev.style.display = 'block';
      btnNext.style.display = 'block';
  }
}

function showSlide(i) {
  const slides = document.getElementsByClassName('galleryimage-wrapper');
  slides[currentIndex].style.display = 'none';
  slides[i].style.display = 'block';
  const slideContent = slides[i].querySelector('.slide-info');
  const slideInfoDiv = document.querySelector('.slideshow-slide-info');
  if (slideInfoDiv) {
    slideInfoDiv.innerHTML = slideContent.outerHTML;
    slideContent.remove();
  }
  currentIndex = i;
  updateCounter();
  updateNav();
}

function startGallery(btn = document.querySelector('.start-slideshow-btn')) {
  if (btn) {
    btn.remove();
  }
}

function nextSlide(event) {
  event.stopPropagation();
  startGallery();
  if (currentIndex < imageBlockCount - 1) {
    showSlide(currentIndex + 1);
  }
}

function previousSlide(event) {
  event.stopPropagation();
  startGallery();
  if (currentIndex > 0) {
    showSlide(currentIndex - 1);
  }
}

function decorateSlideshowStart() {
  const btn = document.querySelector('.start-slideshow-btn');
  if (btn) {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      startGallery(btn);
    });
  }
}

function startSlideshow(main) {
  showSlide(0);
  decorateSlideshowStart();
  main.querySelector('.slide-btn-prev').addEventListener('click', previousSlide);
  main.querySelector('.slide-btn-next').addEventListener('click', nextSlide);
  main.querySelector('.slideshow-wrapper').addEventListener('click', nextSlide);
  setTimeout(updateCounter, 500);
  setTimeout(updateNav, 500);
}

export default function decorate(main, template) {
  if (template) {
    const templateEl = template.querySelector('main');
    const articleBody = templateEl.querySelector('.article-body');
    const slideshowContainer = templateEl.querySelector('.slideshow-container');
    main.querySelectorAll('.section').forEach((section) => {
      articleBody.append(section);
      section.querySelectorAll('.galleryimage-wrapper').forEach((slide) => { slideshowContainer.append(slide); });
    });
    main.innerHTML = templateEl.innerHTML;
    main.classList = templateEl.classList;
    decorateMain(main);
    imageBlockCount = main.querySelectorAll('.galleryimage-wrapper').length;
    startSlideshow(main);
  }
  document.body.classList.add('gallery');
}
