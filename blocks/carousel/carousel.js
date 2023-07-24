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
  

  const HTML_TEMPLATE = `
  <h4 style="color: crimson;" id="testing-here">${carouselType} Version:</h4>
  <div class="carousel-main-wrapper" style="border: 4px solid blue;">
    <div class="carousel-outer-frame">
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
  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, "p");

  block.innerHTML = "";
  block.append(...template.children);
}
