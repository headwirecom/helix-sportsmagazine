import { createOptimizedPicture } from "../../scripts/lib-franklin.js";
import {
  parseFragment,
  removeEmptyElements,
  render,
  convertExcelDate,
  timeSince,
  prependImage,
} from "../../scripts/scripts.js";

let cardData;
let cardDataIndex = 0;

async function getCardData() {
  const response = await fetch(`/article-query-index.json?limit=60&sheet=golf-news-tours-features`);
  const data = await response.json();

  cardData = data.data;
}

export default async function decorate(block) {
  if (!cardData) {
    await getCardData();
  }

  const cardsType = Array.from(block.classList).filter(
    (className) => className !== "cards" && className !== "block"
  )[0];

  const isLatestCardBlock = cardsType === "latest";

  const cardsTitle = block.querySelector(".cards.block h3, .cards.block h3")?.innerText || (isLatestCardBlock ? 'The Latest' : '');

  const gdPlusCards = block.classList.contains("gd");

  const cardBlocks = [...document.querySelectorAll(".cards.block[data-block-name='cards']")];
  const indexInPage = cardBlocks.findIndex((element) => element.isEqualNode(block));
  const reverse = !(indexInPage === 0 || indexInPage % 2 === 0);

  const cardOffset = cardsType === "hero" ? 2 : cardsType === "latest" ? 10 : cardsType === "columns" ? 5 : 4;
  const cardList = cardData.slice(cardDataIndex, cardDataIndex + cardOffset);
  cardDataIndex = cardDataIndex + cardOffset;

  const mainCard = cardList[0];

  const generateMainCard = (card = mainCard) => {
    if (isLatestCardBlock) {
      return '<div class="latest-rail"></div>';
    }
    return `
    <a class="main-card" href="${card.href || card.path}">
      <div class="image-bg">
        ${createOptimizedPicture(card.image, card.imageAlt, false, [{width: '700'}]).outerHTML}
      </div>
      <div class="main-text-wrapper">
        <div class="section">${card.rubric}</div>
        ${
          !gdPlusCards
            ? ""
            : `<img loading="lazy" src="/icons/${
                gdPlusCards ? "gd-plus-light" : "gd-plus-dark"
              }.svg" class="gd-plus-icon-img" alt="Golf Digest Plus Icon" />`
        }
        <div class="headline"><h3>${card.title}</h3></div>
      </div>
    </a>
    `;
  };

  const generateSecondaryCards = (cardArray = cardList.splice(1)) =>
    cardArray
      .map(
        (card) => `
      <a class="small-card" href="${card.href || card.path}">
        <div class="image-wrapper">
          ${createOptimizedPicture(card.image, card.imageAlt, false, [{width: '350'}]).outerHTML}
        </div>
        <div class="small-text-wrapper">
          <div class="section">${card.rubric}</div>
          ${
            !gdPlusCards && !card?.gdPlus
              ? ""
              : '<img loading="lazy" src="/icons/gd-plus-dark.svg" class="gd-plus-icon-img" alt="Golf Digest Plus Icon" />'
          }
          <div class="headline"><h3>${card.title}</h3></div>
          <div class="date-string">${timeSince(convertExcelDate(card.dateValue))}</div>
        </div>
      </a>
    `
      )
      .join("");

  const HTML_TEMPLATE = `
  ${
    cardsTitle
      ? `
    <div class="cards-title-wrapper">
      <h2 class="cards-title">${cardsTitle}
    </div>`
      : ""
  }
  <div class="card-block-wrapper ${reverse ? "reverse" : ""}">
    ${
      cardsType === "hero"
        ? cardList.map((card) => generateMainCard(card)).join("")
        : `
      ${generateMainCard()}
      ${!gdPlusCards ? "" : '<div class="gd-cards-wrapper">'}
      <div class="secondary-cards">
        ${
          !gdPlusCards
            ? ""
            : `
          <h2 class="gd-plus-title">GD+ Latest</h2> 
        `
        }
        ${generateSecondaryCards(isLatestCardBlock ? cardList : cardList.splice(1))}
      </div>
      ${!gdPlusCards ? "" : "</div>"}
    `
    }
  </div>
  `;

  // Template rendering
  const template = parseFragment(HTML_TEMPLATE);
  // Render template
  render(template, block);

  // Post-processing
  removeEmptyElements(template, "p");

  block.innerHTML = "";
  block.append(template);
}
