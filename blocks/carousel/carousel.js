import { parseFragment, removeEmptyElements, render, convertExcelDate, timeSince } from "../../scripts/scripts.js";

let carouselData;

const fetchCarouselData = async (type) => {
  const response = await fetch('/blocks/carousel/mockData.json')
  const data = await response.json()

  carouselData = data
}

const testImage = 'https://placekitten.com/300/400'

export default async function decorate(block) {
  if (!carouselData) {
    await fetchCarouselData()
  }
  
  const carouselType = Array.from(block.classList).filter(className => className !== 'carousel' && className !== 'block')[0]
  console.log("\x1b[31m ~ carouselType:", carouselType)

  const carouselItems = carouselData.data
  // const carouselItems = []

  

  const HTML_TEMPLATE = `
  <h4 style="color: crimson;" id="testing-here">${carouselType} Version:</h4>
  <div class="carousel-main-wrapper" >
    <div class="controls">
      <button class="left-button"></button>
      <button class="right-button"></button>
    </div>
    <div class="carousel-frame" >
      ${carouselItems.map((carouselItem, index) => {
        return `
        <a class="carousel-item" href="${carouselItem.path}" >
          <div class="carousel-item-wrapper">
            <div class="carousel-image-wrapper">
              <img loading="lazy" src="${testImage}" alt="${carouselItem.imageAlt}" />
            </div>
            
            <div class="carousel-text-content">
              ${carouselItem.courseType ? `<span class="course-type">${carouselItem.courseType}</span>` : ''}
              <h3 class="carousel-item-title">${carouselItem.title}</h3>
              <span class="carousel-item-location">${carouselItem.author}</span>

              ${carouselItem.awards ? `<ul class="carousel-item-pills">${carouselItem.awards.map((award) => '<li class="pill-item">'+award+'</li>').join('')}</ul>` : ''}

            </div>
          </div>
        </a>
        `
      }).join('')}
    </div>
  </div>
  `;

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);

  // initialize variables & functions required for carousel features
  const carouselWrapper = template.querySelector('.carousel-main-wrapper');
  const carouselFrame = template.querySelector('.carousel-frame');
  const rightButton = template.querySelector(".controls .right-button");
  const leftButton = template.querySelector(".controls .left-button");
  let pressed = false;
  let x = 0;
  let maxScroll = 1440

  const refreshMaxScroll = () => {
    maxScroll = carouselFrame.children.length * (carouselFrame.children[0].getBoundingClientRect().width + 25) - carouselFrame.getBoundingClientRect().width // prettier-ignore
  }

  const roundX = (step=carouselFrame.children[0].getBoundingClientRect().width + 25) => {
    const rounded = Math.round(x / step) * step
    x = Math.min(0, Math.max(rounded, -maxScroll))
  }

  const addToX = (addValue) => {
    const newValue = x + addValue;
    if (newValue > 0) {
      x = !pressed ? 0 : x + (addValue / 8)
    } else if (newValue < -maxScroll) {
      x = !pressed ? -maxScroll : x + (addValue / 8)
    } else {
      x = newValue
    }
  }

  const updateButtonVisibility = () => {
    if (x > -40) {
      leftButton.classList.add("hidden")
    } else {
      leftButton.classList.remove("hidden")
    }
    if (x < (-maxScroll + 40)) {
      rightButton.classList.add("hidden")
    } else {
      rightButton.classList.remove("hidden")
    }
  }
  updateButtonVisibility()

  
  // drag logic
  const mouseMoveHandler = (e) => {
    if (!pressed) return;
    e.preventDefault();
    addToX(e.movementX)
    carouselFrame.style.transform = `translateX(${x}px)`
  }

  const mouseUpHandler = (e) => {
    pressed = false
    carouselWrapper.classList.remove("grabbed")
    roundX()
    carouselFrame.style.transform = `translateX(${x}px)`
    updateButtonVisibility()
    // cleanup
    window.removeEventListener("mouseup", mouseUpHandler)
    window.removeEventListener("mousemove", mouseMoveHandler)
  }

  carouselWrapper.onmousedown = (e) => {
    carouselWrapper.classList.add("grabbed")
    pressed = true;
    refreshMaxScroll()

    window.addEventListener("mouseup", mouseUpHandler)
    window.addEventListener("mousemove", mouseMoveHandler)
  };

  // button logic
  const rightOnClick = () => {
    addToX(-carouselFrame.getBoundingClientRect().width)
    roundX()
    carouselFrame.style.transform = `translateX(${x}px)`
    updateButtonVisibility()
  }

  const leftOnClick = () => {
    addToX(carouselFrame.getBoundingClientRect().width)
    roundX()
    carouselFrame.style.transform = `translateX(${x}px)`
    updateButtonVisibility()
  }
  
  rightButton.onclick = rightOnClick;
  leftButton.onclick = leftOnClick;

  // preventing drag from triggering a page switch
  const anchors = carouselFrame.querySelectorAll("a.carousel-item")
  anchors.forEach((anchor) => {
    const clickLocation = {}
    anchor.onfocus = (e) => {
    }
    anchor.onclick = (e) => {
      e.preventDefault()
    }
    anchor.onmousedown = (e) => {
      e.preventDefault()
      clickLocation.x = e.clientX
      clickLocation.y = e.clientY
    }
    anchor.onmouseup = (e) => {
      e.preventDefault()
      if (e.clientX === clickLocation.x && e.clientY === clickLocation.y) {
        window.location.href = e.target.href
      }
    }
  })
  

  // resize listener
  let timeout = false
  const debouncedResizeHandler = (event) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      refreshMaxScroll()
      addToX(0)
      roundX()
      carouselFrame.style.transform = `translateX(${x}px)`
      updateButtonVisibility()
    }, 150)
  }
  window.addEventListener("resize", debouncedResizeHandler)

  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, "p");

  block.innerHTML = "";
  block.append(...template.children);
}
