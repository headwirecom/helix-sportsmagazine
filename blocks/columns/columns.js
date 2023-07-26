import {
  parseFragment,
  render,
  removeEmptyElements,
} from "../../scripts/scripts.js";

import {
  buildBlock,
  decorateBlock,
  loadBlocks,
} from "../../scripts/lib-franklin.js";

const arrowIcon =
  '<svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arrow Icon White" class="arrow-icon"><path d="M1.70612 0.819317L1.53333 0.654091L1.36055 0.819317L0.827218 1.32933L0.638272 1.51001L0.827218 1.69069L3.57161 4.31506L0.827218 6.93943L0.638272 7.12012L0.827218 7.3008L1.36055 7.81081L1.53333 7.97604L1.70612 7.81081L5.17278 4.49575L5.36173 4.31506L5.17278 4.13438L1.70612 0.819317Z" fill="#ffffff" stroke="#ffffff" stroke-width="0.5"></path></svg>';

export default async function decorate(block) {
  const videoLink = block.querySelector("a");
  const headingText = block.querySelector("h2").textContent;
  const paragraphText = block.querySelector("p").textContent;
  const buttonText = block.querySelector(".button-container a").textContent;
  const buttonLink = block
    .querySelector(".button-container a")
    .getAttribute("href");

  // HTML template in JS
  const HTML_TEMPLATE = `
    <div class="columns-wrapper">
      <div class="columns block">
        <div class="video-container"><a>${videoLink}</a></div>
        <div>
          <div>
            <h2 id="golf-digest-videos">${headingText}</h2>
            <p>${paragraphText}</p>
            <p class="button-container">${arrowIcon}<a href="${buttonLink}" title="See all" class="button primary">${buttonText}</a></p>
          </div>
        </div>
      </div>
    </div>
`;

  // Parse the HTML template into a document fragment
  const template = parseFragment(HTML_TEMPLATE);

  //embed video
  const videoContainer = template.querySelector(".video-container");
  const embeds = ["youtube", "twitter", "brightcove"];
  block
    .querySelectorAll(embeds.map((embed) => `a[href*="${embed}"]`).join(","))
    .forEach((embedLink) => {
      console.log(embedLink);
      const embed = buildBlock("embed", { elems: [embedLink] });
      videoContainer.replaceWith(embed);
    });

  // Render the template onto the block element
  render(template, block);

  // Post-processing
  removeEmptyElements(template, "p");

  // Clear the original block content
  block.innerHTML = "";
  block.append(...template.children);

  decorateBlock(block.querySelector(".embed"));
  loadBlocks(document.querySelector(".columns-wrapper"));
}
