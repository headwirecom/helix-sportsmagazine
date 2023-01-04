import { readBlockConfig, decorateIcons } from '../../scripts/scripts.js';

function decoratePicture(picture) {
  const container = document.createElement('div');
  container.classList.add('footer-column-ImageContainer');
  const storyCard = document.createElement('div');
  storyCard.classList.add('story-card');
  container.append(storyCard);
  picture.replaceWith(container);
  storyCard.append(picture);
}

function decorateSection(section) {
  section.classList.add('footer-column');
  section.querySelectorAll('picture').forEach(pic => {
    const parent = pic.parentElement;
    if (parent && parent.tagName === 'A') {
      decoratePicture(parent);
    } else {
      decoratePicture(pic);
    }
  });
}

function decorateFooter(footer) {
  const sections = [...footer.children];
  const container = document.createElement('div');
  container.classList.add('footer-container');
  if (sections) {
    for (let i=0; i<sections.length; i++) {
      let section = sections[i];
      if (i === (sections.length-1)) {
        section.classList.add('footer-info');
      } else {
        decorateSection(section);
        // section.remove();
        container.append(section);
      }
    }
    footer.insertAdjacentElement('afterbegin', container);
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footerMain = document.createElement('div');
  footerMain.classList.add('footer-main');
  footerMain.innerHTML = html;
  decorateFooter(footerMain);
  await decorateIcons(footerMain);

  const footer = document.createElement('div');
  footer.classList.add('footer-body');
  footer.append(footerMain);
  block.append(footer);
}
