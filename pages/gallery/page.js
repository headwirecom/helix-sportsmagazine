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

function getImageDimentions(screenWidth) {
  const d = [];
  if (screenWidth < 1395) {
    const imgWidth = Math.round(screenWidth * 0.7);
    d.push(imgWidth);
    d.push(Math.round(imgWidth * 0.6667));
  } else {
    const imgWidth = 966;
    d.push(imgWidth);
    d.push(Math.round(imgWidth * 0.6667));
  }
  return d;
}

function getImageContainerDimentions(screenWidth, imgWidth, imgHeight) {
  const d = [];
  if (screenWidth < 1400) {
    let w = screenWidth - 40;
    d.push(w);
    d.push(Math.round(w * 0.6667));
  } else if(screenWidth < 1016) {
    d.push(imgWidth);
    d.push(imgHeight);
  } else {
    d.push(imgWidth + 2);
    d.push(imgHeight + 10);
  }
  return d;
}

function decorateSlideImgSize() {
  const screenWidth = window.innerWidth || document.documentElement.clientWidth
  || document.body.clientWidth;
  console.log(`Screen Width: ${screenWidth}`);
  const [imgWidth, imgHeight] = getImageDimentions(screenWidth);
  const [containerWidth, containerHeight] = getImageContainerDimentions(screenWidth, imgWidth, imgHeight);
  document.querySelector('.slideshow-overflow').style.width = `${containerWidth}px`;
  document.querySelector('.slideshow-overflow').style.height = `${containerHeight}px`;
  document.querySelector('.slideshow-container').style.width = `${containerWidth}px`;
  document.querySelector('.slideshow-wrapper').style.width = `${containerWidth}px`;
  document.querySelectorAll('.galleryimage-wrapper').forEach((wrap) => {
    const slide = wrap.querySelector('.carousel');
    const img = slide.querySelector('img');
    const imageDiv = slide.querySelector('.image');
    wrap.style.width = `${containerWidth}px`;
    wrap.style.height = `${containerHeight}px`;
    slide.style.width = `${containerWidth}px`;
    slide.style.height = `${containerHeight}px`;
    imageDiv.style.width = `${containerWidth}px`;
    imageDiv.style.height = `${containerHeight}px`;
    img.style.width = `${imgWidth}px`;
    img.style.height = `${imgHeight}px`;
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
  decorateSlideImgSize();
  window.addEventListener('resize', decorateSlideImgSize);
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

function updatePhotoCredit(slide) {
  const nameEl = slide.querySelector('.photo-credit-name');
  const creditEl = document.querySelector('.pv-photo-info');
  if (nameEl) {
    creditEl.style.display = 'block';
    creditEl.querySelector('.pv-photo-credit').innerHTML = `Photo By: <span class="photo-credit-name">${nameEl.innerHTML}</span>`;
  } else {
    creditEl.style.display = 'none';
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
    updatePhotoCredit(slides[i]);
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
