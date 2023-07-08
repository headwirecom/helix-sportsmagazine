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
  if (className === 'photo-credit') {
    const el = row.querySelector('div');
    el.innerHTML = `Photo By: <span class="photo-credit-name">${el.innerHTML}</span>`;
  }
}

export default function decorate(block) {
  const isListicle = document.body.classList.contains('gallery-listicle');
  const isGallery = document.body.classList.contains('gallery');
  if (isListicle) {
    block.classList.add('listicle');
    block.querySelectorAll(':scope > div').forEach((row) => decorateRow(row));
  } else if (isGallery) {
    block.classList.add('carousel');
    block.classList.add('carousel');
    const slideInfoContainer = document.createElement('div');
    slideInfoContainer.classList.add('slide-info');
    block.append(slideInfoContainer);
    block.querySelectorAll(':scope > div').forEach((row) => {
      if (!row.classList.contains('slide-info')) {
        decorateRow(row, slideInfoContainer);
      }
    });
  } else {
    // eslint-disable-next-line no-console
    console.log('unsupported gallery page template');
  }
}
