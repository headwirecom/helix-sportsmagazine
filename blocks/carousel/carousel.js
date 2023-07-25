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
  <div class="carousel-main-wrapper" style="border: 4px solid blue;">
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

  // window.addEventListener("resize", () => {

  // })

  // initialize variables required for carousel features
  let pressed = false;
  let x = 0;
  let maxScroll = 1440

  const roundX = (step) => {
    x = Math.round(x / step) * step
  }

  const setX = (addValue) => {
    let newValue = x + addValue;
    if (newValue > 0) {
      x =  0
    } else if (newValue < -maxScroll) {
      x =  -maxScroll
    } else {
      x = newValue
    }
  }

  const carouselWrapper = template.querySelector('.carousel-main-wrapper');
  const carouselFrame = template.querySelector('.carousel-frame');
  
  // drag logic
  const mouseMoveHandler = (e) => {
    if (!pressed) return;
    e.preventDefault();
    setX(e.movementX)
    carouselFrame.style.transform = `translateX(${x}px)`
  }

  const mouseUpHandler = () => {
    pressed = false
    carouselWrapper.classList.remove("grabbed")
    roundX(carouselFrame.children[0].getBoundingClientRect().width + 26)
    carouselFrame.style.transform = `translateX(${x}px)`
    window.removeEventListener("mouseup", mouseUpHandler)
    window.removeEventListener("mousemove", mouseMoveHandler)
  }

  carouselWrapper.onmousedown = (e) => {
    carouselWrapper.classList.add("grabbed")
    pressed = true;
    maxScroll = carouselFrame.children.length * (carouselFrame.children[0].getBoundingClientRect().width + 26) - carouselFrame.getBoundingClientRect().width

    window.addEventListener("mouseup", mouseUpHandler)
    window.addEventListener("mousemove", mouseMoveHandler)
  };


  // button logic
  const rightOnClick = () => {
    setX(-carouselFrame.getBoundingClientRect().width - 8)
    carouselFrame.style.transform = `translateX(${x}px)`
  }

  const leftOnClick = () => {
    setX(carouselFrame.getBoundingClientRect().width + 8)
    carouselFrame.style.transform = `translateX(${x}px)`
  }
  
  template.querySelector(".controls .right-button").onclick = rightOnClick;
  template.querySelector(".controls .left-button").onclick = leftOnClick;



  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, "p");

  block.innerHTML = "";
  block.append(...template.children);
}
