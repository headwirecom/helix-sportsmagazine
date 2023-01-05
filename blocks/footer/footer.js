import { readBlockConfig, decorateIcons, loadCSS } from '../../scripts/scripts.js';

function loadBlock(block, name) {
    import(`${window.hlx.codeBasePath}/blocks/${name}/${name}.js`).then(mod => {
        loadCSS(`${window.hlx.codeBasePath}/blocks/${name}/${name}.css`);
        mod.default(block);
    });
}

function decoratePicture(picture) {
  const container = document.createElement('div');
  container.classList.add('footer-column-ImageContainer');
  const storyCard = document.createElement('div');
  storyCard.classList.add('story-card');
  container.append(storyCard);
  picture.replaceWith(container);
  storyCard.append(picture);
}

function decorateSocial(socialBlock) {
  const socialHTML = `<ul class="socialLinks">
  <li>
    <a class="o-SocialLinks__a-Icon--facebook" href="https://www.facebook.com/GolfDigest/" target="_blank" rel="noopener" aria-label="Facebook Logo">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Facebook Logo">
      <title>Facebook Logo</title>
      <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>

          </a>
        </li>
        <li>
          <a class="o-SocialLinks__a-Icon--twitter" href="https://twitter.com/GolfDigest" target="_blank" rel="noopener" aria-label="Twitter Logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Twitter Logo">
      <title>Twitter Logo</title>
      <path d="M23 2.9998C22.0424 3.67528 20.9821 4.19191 19.86 4.5298C19.2577 3.83731 18.4573 3.34649 17.567 3.12373C16.6767 2.90096 15.7395 2.957 14.8821 3.28426C14.0247 3.61151 13.2884 4.1942 12.773 4.95352C12.2575 5.71283 11.9877 6.61214 12 7.5298V8.5298C10.2426 8.57537 8.50127 8.18561 6.93101 7.39525C5.36074 6.60488 4.01032 5.43844 3 3.9998C3 3.9998 -1 12.9998 8 16.9998C5.94053 18.3978 3.48716 19.0987 1 18.9998C10 23.9998 21 18.9998 21 7.4998C20.9991 7.22126 20.9723 6.9434 20.92 6.6698C21.9406 5.6633 22.6608 4.39251 23 2.9998V2.9998Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>

          </a>
        </li>
        <li>
          <a class="o-SocialLinks__a-Icon--instagram" href="https://www.instagram.com/golfdigest/" target="_blank" rel="noopener" aria-label="Instagram Logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Instagram Logo">
      <title>Instagram Logo</title>
      <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M16.0002 11.3698C16.1236 12.2021 15.9815 13.052 15.594 13.7988C15.2065 14.5456 14.5933 15.1512 13.8418 15.5295C13.0903 15.9077 12.2386 16.0394 11.408 15.9057C10.5773 15.7721 9.80996 15.3799 9.21503 14.785C8.62011 14.1901 8.22793 13.4227 8.09426 12.592C7.9606 11.7614 8.09226 10.9097 8.47052 10.1582C8.84878 9.40667 9.45438 8.79355 10.2012 8.40605C10.948 8.01856 11.7979 7.8764 12.6302 7.99981C13.4791 8.1257 14.265 8.52128 14.8719 9.12812C15.4787 9.73496 15.8743 10.5209 16.0002 11.3698Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M17.5 6.5H17.51" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>

          </a>
        </li>
        <li>
          <a class="o-SocialLinks__a-Icon--instagram" href="https://www.youtube.com/channel/UCkMOtD7MMYs1H55XH6CkWEw" target="_blank" rel="noopener" aria-label="Youtube Logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Youtube Logo">
      <title>Youtube Icon</title>
      <path d="M22.5401 6.42C22.4213 5.94541 22.1794 5.51057 21.8387 5.15941C21.4981 4.80824 21.0708 4.55318 20.6001 4.42C18.8801 4 12.0001 4 12.0001 4C12.0001 4 5.12008 4 3.40008 4.46C2.92933 4.59318 2.50206 4.84824 2.16143 5.19941C1.8208 5.55057 1.57887 5.98541 1.46008 6.46C1.1453 8.20556 0.991319 9.97631 1.00008 11.75C0.988863 13.537 1.14285 15.3213 1.46008 17.08C1.59104 17.5398 1.83839 17.9581 2.17823 18.2945C2.51806 18.6308 2.9389 18.8738 3.40008 19C5.12008 19.46 12.0001 19.46 12.0001 19.46C12.0001 19.46 18.8801 19.46 20.6001 19C21.0708 18.8668 21.4981 18.6118 21.8387 18.2606C22.1794 17.9094 22.4213 17.4746 22.5401 17C22.8524 15.2676 23.0064 13.5103 23.0001 11.75C23.0113 9.96295 22.8573 8.1787 22.5401 6.42V6.42Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M9.75 15.02L15.5 11.75L9.75 8.47998V15.02Z" stroke="#ED3E49" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>

          </a>
        </li>
      </ul>`;
  socialBlock.insertAdjacentHTML('beforebegin',socialHTML);
  socialBlock.remove();
    //loadBlock(socialBlock, 'share');
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
  section.querySelectorAll('.social').forEach(el => {
    decorateSocial(el);
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
