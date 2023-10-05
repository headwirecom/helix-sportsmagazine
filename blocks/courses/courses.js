const ratingElements = document.querySelectorAll('.courses-rating');
const panelistElements = document.querySelectorAll('.courses-panelists');
// generate stars
ratingElements.forEach((ratingElement, index) => {
  const number = parseInt(ratingElement.textContent.trim(), 10);
  if (!Number.isNaN(number) && number >= 1 && number <= 5) {
    const stars = '★'.repeat(number) + '☆'.repeat(5 - number);
    const span = document.createElement('span');
    span.className = 'stars';
    span.textContent = stars;

    // get number of panelists
    const panelistText = panelistElements[index].textContent;
    const panelistNumber = panelistText.match(/(\d+)/)[1];

    const panelistCount = document.createElement('span');
    panelistCount.className = 'courses-panelist-count';
    panelistCount.textContent = ` ${panelistNumber}`;

    const panelistLabel = document.createElement('span');
    panelistLabel.className = 'courses-panelist-text';
    panelistLabel.textContent = ' Panelists';

    ratingElement.textContent = '';
    ratingElement.appendChild(span);
    ratingElement.appendChild(panelistCount);
    ratingElement.appendChild(panelistLabel);

    panelistElements[index].remove();
  }
});

const buttonElements = document.querySelectorAll('.courses-button');

buttonElements.forEach((button) => {
  button.innerHTML += '<span class="icon icon-arrow-right icon-container"></span>';
});

// wrap courses info
const courseBlocks = document.querySelectorAll('.courses.block > div > div');

courseBlocks.forEach((block) => {
  const baseSelectors = ['p > picture', '.photo-credit', 'h5', 'h6', '.courses-rating'];
  const additionalSelector = '.courses-tags';
  const selectors = [...baseSelectors];

  if (block.querySelector(additionalSelector)) {
    selectors.push(additionalSelector);
  }

  const elementsToWrap = selectors.map((selector) => block.querySelector(selector)).filter(Boolean);

  let wrapperDiv;
  if (elementsToWrap.length === selectors.length) {
    wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'courses-info-wrapper';

    elementsToWrap.forEach((el) => wrapperDiv.appendChild(el));

    block.insertBefore(wrapperDiv, block.firstChild);
  }
});

// wrap courses text info
const infoWrappers = document.querySelectorAll('.courses-info-wrapper');

infoWrappers.forEach((wrapper) => {
  const pictureElement = wrapper.querySelector('.courses-info-wrapper > picture');

  if (pictureElement) {
    const textWrapper = document.createElement('div');
    textWrapper.className = 'courses-text-wrapper';
    pictureElement.parentNode.insertBefore(textWrapper, pictureElement.nextSibling);

    const elementsToMove = ['.courses-photo-credit', '.courses-title', '.courses-subtitle', '.courses-rating', '.courses-tags'];
    elementsToMove.forEach((selector) => {
      const el = wrapper.querySelector(selector);
      if (el) {
        textWrapper.appendChild(el);
      }
    });
  }
});
