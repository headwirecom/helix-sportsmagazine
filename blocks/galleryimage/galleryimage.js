import { articleStyles } from '../../utils/utils.js';
import { getMetadata } from '../../scripts/scripts.js';

let imageBlockCount = 0;
let currentIndex = 0;

function getRowClassName(field) {
  return field.trim().replace(' ', '-').toLowerCase();
}

function decorateRow(row, container) {
  const field = row.querySelector('div');
  const className = getRowClassName(field.innerHTML);
  row.classList.add(className);
  field.remove();
  if (container && className !== 'image') {
    container.append(row);
  }
}

function showSlide(i) {
  let slides = document.getElementsByClassName('galleryimage-wrapper');
  slides[currentIndex].style.display = 'none';
  slides[i].style.display = 'block';
  let slideContent = slides[i].querySelector('.slide-info');
  let slideInfoDiv = document.querySelector('.slideshow-slide-info');
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

function decorateSlideshowStart() {
  const btn = document.querySelector('.start-slideshow-btn');
  if (btn) {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      startGallery(btn);
    });
  }
}

export default function decorate(block) {
  const style = getMetadata('article-style');
  block.classList.add('gallery-slide');
  if (style === articleStyles.GalleryListicle) {
    block.classList.add('listicle');
    block.querySelectorAll(':scope > div').forEach((row) => decorateRow(row));
  } else {
    block.classList.add('carousel');
    let slideInfoContainer = document.createElement('div');
    slideInfoContainer.classList.add('slide-info');
    block.append(slideInfoContainer);
    block.querySelectorAll(':scope > div').forEach((row) => {
      if (!row.classList.contains('slide-info')) {
        decorateRow(row, slideInfoContainer);
      }
    });
    if (imageBlockCount === 0) {
      showSlide(0);
      decorateSlideshowStart();
      document.querySelector('.slide-btn-prev').addEventListener('click', previousSlide);
      document.querySelector('.slide-btn-next').addEventListener('click', nextSlide);
      document.querySelector('.slideshow-wrapper').addEventListener('click', nextSlide);
      setTimeout(updateCounter, 500);
      setTimeout(updateNav, 500);
    }
  }
  imageBlockCount++;
}
