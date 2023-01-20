import { articleStyles, getArticleStyle } from "../../utils/utils.js";

let imageBlockCount = 0;
let currentIndex = 0;

function getRowClassName(field) {
    return field.trim().replace(' ', '-').toLowerCase();
}

function decorateRow(row) {
    const field = row.querySelector('div');
    const className = getRowClassName(field.innerHTML);
    row.classList.add(className);
    field.remove();
}

function showSlide(i) {
    let slides = document.getElementsByClassName("carousel");
    slides[currentIndex].style.display = "none";
    slides[i].style.display = "block";
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
    document.querySelector('.slideshow-counter > .counter-display').innerHTML = `${currentIndex+1}/${imageBlockCount}`;
}

function updateNav() {
    const btnPrev = document.querySelector('.slide-btn-prev');
    const btnNext = document.querySelector('.slide-btn-next');
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

function currentSlide() {
    let slides = document.getElementsByClassName("carousel");
    return slides[currentIndex];
}

export default function decorate(block) {
    const style = getArticleStyle();
    block.classList.add('gallery-slide');
    block.querySelectorAll(':scope > div').forEach(row => decorateRow(row));
    if (style === articleStyles.GalleryListicle) {
        block.classList.add('listicle');
    } else {
        block.classList.add('carousel');
        if (imageBlockCount === 0) {
            // show 1st slide and register event listeners
            block.style.display = "block";
            document.querySelector('.slide-btn-prev').addEventListener('click', previousSlide);
            document.querySelector('.slide-btn-next').addEventListener('click', nextSlide);
            setTimeout(updateCounter, 500);
            setTimeout(updateNav, 500);
        }
    }
    imageBlockCount++;
}