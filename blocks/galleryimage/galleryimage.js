import { articleStyles, getArticleStyle, createTag } from "../../utils/utils.js";
import { isBlockLibrary } from "../../scripts/scripts.js";

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
    if (container && className != 'image') {
        container.append(row);
    }
}

function showSlide(i) {
    let slides = document.getElementsByClassName("galleryimage-wrapper");
    slides[currentIndex].style.display = "none";
    slides[i].style.display = "block";
    let slideContent = slides[i].querySelector('.slide-info').innerHTML;
    let slideInfoDiv = document.querySelector('.slideshow-slide-info');
    if (slideInfoDiv) {
        slideInfoDiv.innerHTML = slideContent;
    }
    currentIndex = i;
    updateCounter();
    updateNav();
}

function nextSlide() {
    if (currentIndex < imageBlockCount-1) {
        showSlide(currentIndex + 1);
    } 
}

function previousSlide() {
    if (currentIndex > 0) {
        showSlide(currentIndex - 1);
    }
}

function updateCounter() {
    let counterEl = document.querySelector('.slideshow-counter > .counter-display');
    if (counterEl) {
        counterEl.innerHTML = `${currentIndex+1}/${imageBlockCount}`;
    }
}

function updateNav() {
    const btnPrev = document.querySelector('.slide-btn-prev');
    const btnNext = document.querySelector('.slide-btn-next');
    if (btnPrev && btnNext) {
        switch(currentIndex) {
            case 0:
                btnPrev.style.display = 'none';
                btnNext.style.display = 'block';
                break;
            case imageBlockCount-1:
                btnPrev.style.display = 'block';
                btnNext.style.display = 'none';
                break;
            default:
                btnPrev.style.display = 'block';
                btnNext.style.display = 'block';
        }
    }
}

function currentSlide() {
    let slides = document.getElementsByClassName("carousel");
    return slides[currentIndex];
}

function decorateSlideshowStart() {
    const btn = document.querySelector('.start-slideshow-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            btn.remove();
        });
    }
}

function addButtonListeners() {
    const btnPrev = document.querySelector('.slide-btn-prev');
    const btnNext = document.querySelector('.slide-btn-next');
    if (btnPrev && btnNext) {
        btnPrev.addEventListener('click', previousSlide);
        btnNext.addEventListener('click', nextSlide);
    }
}

export default function decorate(block) {
    const style = getArticleStyle();
    block.classList.add('gallery-slide');
    if (style === articleStyles.GalleryListicle || isBlockLibrary()) {
        block.classList.add('listicle');
        block.querySelectorAll(':scope > div').forEach(row => decorateRow(row));
    } else {
        block.classList.add('carousel');
        let slideInfoContainer = document.createElement('div');
        slideInfoContainer.classList.add('slide-info');
        block.append(slideInfoContainer);
        block.querySelectorAll(':scope > div').forEach(row => { 
            if (!row.classList.contains('slide-info')) {
                decorateRow(row, slideInfoContainer);
            }
        });
        if (imageBlockCount === 0) {
            showSlide(0);
            decorateSlideshowStart();
            addButtonListeners();
            setTimeout(updateCounter, 500);
            setTimeout(updateNav, 500);
        }
    }
    imageBlockCount++;
}