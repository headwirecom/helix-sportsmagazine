import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  getBlockId,
  parseFragment,
  removeEmptyElements,
  render,
} from '../../scripts/scripts.js';

const placeholderHtml = (isLarge) => `<div class="carousel-main-wrapper" style="${isLarge ? 'aspect-ratio: 2/1; ' : 'height: 949px;'} width: 100%; visibility: hidden;"><div>`;

let carouselData;

export default async function decorate(block) {
  const id = getBlockId(block);
  const query = window.store.getQuery(block);

  const isWedges = block.classList.contains('wedges');
  const isLarge = block.classList.contains('large');
  const isCourses = block.classList.contains('courses');
  const variants = Array.from(block.classList).filter(
    (className) => className !== 'carousel' && className !== 'block',
  ).join(' ');

  let heading = block.querySelector('h3')?.textContent ?? '';
  if (isWedges) {
    heading = heading.replace('(year)', new Date().getFullYear());
  }

  // Adding placeholder html
  if (!carouselData) {
    block.innerHTML = placeholderHtml(isLarge);
  }

  // Render content upon fetch complete
  document.addEventListener(`query:${id}`, (event) => {
    carouselData = event.detail.data;

    const carouselHeadingType = isWedges ? 'h2' : 'h4';

    // Mobile version of wedges displays them all and disables swiping,
    // but is only checked for on the initial render
    const isMobileWedges = isWedges && window.innerWidth < 779;

    const HTML_TEMPLATE = `
    ${isLarge ? '' : `<div class="carousel-title-wrapper">
        <${carouselHeadingType} class="carousel-title ${variants}">${heading}</${carouselHeadingType}>
      </div>
    `}
  <div class="carousel-main-wrapper ${isMobileWedges ? 'mobile-wedges' : ''}">
  <div class="controls">
    <button aria-label="Scroll Left" class="left-button"></button>
    <button aria-label="Scroll Right" class="right-button"></button>
  </div>
  <div class="carousel-inner-wrapper">
      <div class="carousel-frame" style="transform: translateX(0px);">
        ${carouselData
    .map(
      (carouselItem) => `
          <a class="carousel-item" href="${carouselItem.path}" >
            <div class="carousel-item-wrapper">
              <div class="carousel-image-wrapper">
                ${createOptimizedPicture(carouselItem.image, carouselItem.imageAlt || 'carousel cover image', false, isLarge ? [{ width: '700' }] : [{ width: '500' }]).outerHTML}
              </div>
              
              <div class="carousel-text-content">
                ${carouselItem.rubric ? `<span class="sub-heading">${carouselItem.rubric}</span>` : ''}
                <h3 class="carousel-item-title">${carouselItem.title}</h3>
                ${isCourses && carouselItem.location ? `<span class="carousel-item-location">${carouselItem.location}</span>` : ''}
  
                ${Array.isArray(carouselItem.awards) && carouselItem.awards.length ? `<ul class="carousel-item-pills">${carouselItem.awards.map((award) => `<li class="pill-item">${award}</li>`).join('')}</ul>` : ''}
              </div>
            </div>
          </a>`,
    ).join('')}
      </div>
      </div>
    </div>
    `;

    // Template rendering
    const template = parseFragment(HTML_TEMPLATE);

    if (!isMobileWedges) {
      // initialize variables & functions required for carousel features
      const carouselWrapper = template.querySelector('.carousel-main-wrapper');
      const carouselFrame = template.querySelector('.carousel-frame');
      const carouselCardLinks = carouselFrame.children;
      const rightButton = template.querySelector('.controls .right-button');
      const leftButton = template.querySelector('.controls .left-button');
      let pressed = false;
      let x = 0;
      let maxScroll = 1440;

      let gapOffset = 27;
      const updateGapOffset = () => {
        if (!isWedges) {
          gapOffset = isLarge ? 13 : 27;
          return;
        }
        if (window.innerWidth <= 1280) {
          gapOffset = 10.5;
        } else {
          gapOffset = 40;
        }
      };
      updateGapOffset();

      const refreshMaxScroll = () => {
        maxScroll = carouselCardLinks.length
          * (carouselCardLinks[0].getBoundingClientRect().width + gapOffset) // prettier-ignore
          - carouselFrame.getBoundingClientRect().width;
      };

      const roundX = (step = carouselCardLinks[0].getBoundingClientRect().width + gapOffset) => {
        const rounded = Math.round(x / step) * step;
        x = Math.min(0, Math.max(rounded, -maxScroll));
      };

      const addToX = (addValue) => {
        const newValue = x + addValue;
        // while dragging over the edge, value is reduced
        if (newValue > 0) {
          x = !pressed ? 0 : x + addValue / 8;
        } else if (newValue < -maxScroll) {
          x = !pressed ? -maxScroll : x + addValue / 8;
        } else {
          x = newValue;
        }
      };

      const updateButtonVisibility = () => {
        if (x > -40) {
          leftButton.classList.add('hidden');
        } else {
          leftButton.classList.remove('hidden');
        }
        if (x < -maxScroll + 40) {
          rightButton.classList.add('hidden');
        } else {
          rightButton.classList.remove('hidden');
        }
      };
      updateButtonVisibility();

      // drag logic starting with initialization for mobile
      let previousTouch;

      const mouseMoveHandler = (e) => {
        if (!pressed) return;
        if (!e?.touches?.[0]) {
          e.preventDefault();
        }
        addToX(e.movementX);
        carouselFrame.style.transform = `translateX(${x}px)`;
        // prettier-ignore
      };

      const touchMoveHandler = (e) => {
        const touch = e.touches[0];
        if (previousTouch) {
          e.movementX = touch.pageX - previousTouch.pageX;
          mouseMoveHandler(e);
        }
        previousTouch = touch;
      };

      // mouse drag handlers
      const mouseUpHandler = () => {
        pressed = false;
        carouselWrapper.classList.remove('grabbed');
        roundX();
        carouselFrame.style.transform = `translateX(${x}px)`;
        updateButtonVisibility();
        // cleanup
        window.removeEventListener('mouseup', mouseUpHandler);
        window.removeEventListener('touchend', mouseUpHandler);

        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('touchmove', touchMoveHandler);
      };

      const mouseDownHandler = (e) => {
        if (e?.touches?.[0]) {
          [previousTouch] = e.touches;
        }
        carouselWrapper.classList.add('grabbed');
        pressed = true;
        refreshMaxScroll();

        window.addEventListener('mouseup', mouseUpHandler);
        window.addEventListener('touchend', mouseUpHandler);

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('touchmove', touchMoveHandler);
      };
      carouselWrapper.onmousedown = mouseDownHandler;
      carouselWrapper.addEventListener('touchstart', mouseDownHandler);

      // button logic
      const rightOnClick = () => {
        addToX(-carouselFrame.getBoundingClientRect().width);
        roundX();
        carouselFrame.style.transform = `translateX(${x}px)`;
        updateButtonVisibility();
      };

      const leftOnClick = () => {
        addToX(carouselFrame.getBoundingClientRect().width);
        roundX();
        carouselFrame.style.transform = `translateX(${x}px)`;
        updateButtonVisibility();
      };

      rightButton.onclick = rightOnClick;
      leftButton.onclick = leftOnClick;

      // preventing drag from triggering a page switch & focus logic
      const cardFocusHandler = (cardLink, index) => {
        refreshMaxScroll();
        const width = cardLink.getBoundingClientRect().width + gapOffset;
        x = width * -index;
        roundX(width);
        updateButtonVisibility();
        carouselFrame.style.transform = `translateX(${x}px)`;
      };

      [...carouselCardLinks].forEach((anchor, index) => {
        const clickLocation = {};
        const keyUpHandler = (e) => {
          if (e.keyCode === 9) {
            cardFocusHandler(anchor, index);
          }
          window.removeEventListener('keyup', keyUpHandler);
        };
        anchor.onkeyup = (e) => {
          if (e.key === 'Enter') {
            window.location.href = anchor.href.startsWith('#') ? window.location.href + anchor.href : anchor.href;
          }
        };
        // waiting for keyup stops mouse clicks from triggering the focus logic
        anchor.onfocus = () => {
          window.addEventListener('keyup', keyUpHandler);
        };
        anchor.onmousedown = (e) => {
          e.preventDefault();
          clickLocation.x = e.clientX;
          clickLocation.y = e.clientY;
        };
        // prevent opening links when dragging
        // retains middle-click, shift-click, ctrl-click, etc. functionality
        anchor.onclick = (e) => {
          if (e.clientX !== clickLocation.x || e.clientY !== clickLocation.y) {
            e.preventDefault();
          }
        };
      });

      // resize listener
      let timeout = false;
      const debouncedResizeHandler = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          refreshMaxScroll();
          addToX(0);
          roundX();
          carouselFrame.style.transform = `translateX(${x}px)`;
          updateButtonVisibility();
          if (isWedges) {
            updateGapOffset();
          }
        }, 150);
      };
      window.addEventListener('resize', debouncedResizeHandler);
    }

    // Render template
    render(template, block);

    // Post-processing
    removeEmptyElements(template, 'p');

    block.innerHTML = '';
    block.append(...template.children);
  });

  window.store.query({ id, query, limit: 20 });
}
