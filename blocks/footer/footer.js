const FOOTER_CONTEN_PATH = '/footer';
const FOOTER_TEMPLATE_PATH = '/blocks/footer/footer.html';

let templateDom = null;

async function fetchTemplate() {
  const resp = await fetch(FOOTER_TEMPLATE_PATH);
  if (resp.ok) {
    const text = await resp.text();
    const parser = new DOMParser();
    templateDom = parser.parseFromString(text, 'text/html');
  }
}

await fetchTemplate();

function decoratePicture(picture) {
  const container = document.createElement('div');
  container.classList.add('footer-column-image-container');
  const storyCard = document.createElement('div');
  storyCard.classList.add('story-card');
  container.append(storyCard);
  picture.replaceWith(container);
  storyCard.append(picture);
}

function decorateSocial(socialBlock) {
  const el = templateDom.querySelector('.social-links');
  socialBlock.insertAdjacentElement('beforebegin', el);
  socialBlock.remove();
}

function decorateSection(section) {
  section.classList.add('footer-column');
  section.querySelectorAll('picture').forEach((pic) => {
    const parent = pic.parentElement;
    if (parent && parent.tagName === 'A') {
      decoratePicture(parent);
    } else {
      decoratePicture(pic);
    }
  });
  section.querySelectorAll('.social').forEach((el) => {
    decorateSocial(el);
  });
}

function decorateSections(block) {
  const footer = block.querySelector('.footer-container');
  const sections = [...footer.children];
  if (sections) {
    sections.forEach((section) => {
      if (section.querySelector('.disclaimer')) {
        section.classList.add('footer-info');
        block.querySelector('.footer-main').append(section);
      } else {
        decorateSection(section);
      }
    });
  }
}

/**
 * decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.textContent = '';

  const logoEl = templateDom.querySelector('.footer-logo');
  block.append(logoEl);

  const bodyEl = templateDom.querySelector('.footer-body-wrapper');
  block.append(bodyEl);

  const resp = await fetch(`${FOOTER_CONTEN_PATH}.plain.html`);
  const html = await resp.text();
  const footerContainer = block.querySelector('.footer-container');
  footerContainer.innerHTML = html;
  decorateSections(block);
}
