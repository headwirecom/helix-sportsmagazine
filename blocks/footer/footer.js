import { decorateIcons } from '../../scripts/lib-franklin.js';

const FOOTER_CONTENT_PATH = '/footer';
let templateDom = null;

function getTemplate() {
  const footerTemplate = `
    <div class="footer-logo">
      <span class="icon icon-gd-logo"></span>
    </div>
    <div class="footer-body-wrapper">
      <div class="footer-body">
        <div class="footer-main">
          <div class="footer-promo-list desktop">
            <div class="footer-container"></div>
          </div>
        </div>
      </div>
    </div>
    <ul class="social-links">
      <li>
        <a class="social-links-icon--facebook" href="https://www.facebook.com/GolfDigest/" target="_blank" rel="noopener" aria-label="Facebook Logo">
          <span class="icon icon-facebook-red"></span>
        </a>
      </li>
      <li>
        <a class="social-links-icon--twitter" href="https://twitter.com/GolfDigest" target="_blank" rel="noopener" aria-label="Twitter Logo">
          <span class="icon icon-twitter-red"></span>
        </a>
      </li>
      <li>
        <a class="social-links-icon--instagram" href="https://www.instagram.com/golfdigest/" target="_blank" rel="noopener" aria-label="Instagram Logo">
          <span class="icon icon-instagram-red"></span>
        </a>
      </li>
      <li>
        <a class="social-links-icon--instagram" href="https://www.youtube.com/channel/UCkMOtD7MMYs1H55XH6CkWEw" target="_blank" rel="noopener" aria-label="Youtube Logo">
          <span class="icon icon-youtube-red"></span>
        </a>
      </li>
    </ul>
    <span class="footer-arrow-icon icon icon-arrow-right"></span>
  `;

  const parser = new DOMParser();
  templateDom = parser.parseFromString(footerTemplate, 'text/html');
}

getTemplate();

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

function createMobileFooter(block) {
  const desktopEl = block.querySelector('.footer-promo-list');
  const mobileEl = desktopEl.cloneNode(true);
  mobileEl.classList.remove('desktop');
  mobileEl.classList.add('mobile');
  desktopEl.insertAdjacentElement('afterend', mobileEl);
  return mobileEl;
}

function decorateMobileSectionIcon(section) {
  const heading = section.querySelector(':is(h1, h2, h3)');
  const icon = templateDom.querySelector('.footer-arrow-icon').cloneNode(true);
  heading.append(icon);
  heading.addEventListener('click', () => {
    icon.closest('.accordion-item').classList.toggle('open');
  });
}

function decorateMobileSection(section) {
  section.classList.add('accordion-item');
  section.setAttribute('tabindex', '0');
  section.setAttribute('role', 'button');
  section.setAttribute('arialabel', 'Open Section Sub Menu');
  section.setAttribute('aria-expanded', 'false');
  section.setAttribute('arial-controls', section.querySelector(':is(h1, h2, h3)').innerText);
  decorateMobileSectionIcon(section);
}

function decorateMobileFooter(block) {
  const mobileEl = createMobileFooter(block);
  const newsletterHeading = mobileEl.querySelector('#newsletter');
  const signupBtn = mobileEl.querySelector('.signup');
  mobileEl.insertAdjacentElement('afterbegin', newsletterHeading);
  newsletterHeading.insertAdjacentElement('afterend', signupBtn);
  mobileEl.querySelector('.social-links').parentElement.insertAdjacentElement('afterend', mobileEl.querySelector('#magazine').parentElement);
  mobileEl.querySelectorAll('ul').forEach((listEl) => {
    const section = listEl.parentElement;
    if (!section.querySelector('.social-links')) {
      decorateMobileSection(section);
    }
  });
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

  const resp = await fetch(`${FOOTER_CONTENT_PATH}.plain.html`);
  const html = await resp.text();
  const footerContainer = block.querySelector('.footer-container');
  footerContainer.innerHTML = html;
  decorateSections(block);
  decorateMobileFooter(block);

  decorateIcons(block);
}
