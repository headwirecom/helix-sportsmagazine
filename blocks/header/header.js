import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';
import leaderboard from './leaderboard.js';

const DEFAULT_NAV = '/golf-nav';

const isHomePage = document.body.classList.contains('home-page');

const searchButton = '<button class="header-search-button" data-type="button-search-toggle" aria-label="Search Toggle"><span class="icon icon-search"></span></button>';
const searchForm = '<form action="/search" method="get" data-module="search-form" class="search-form" data-mobile-search-box=""id="mod-search-form-1"><div class="search-form-area"><span class="search-form-inputWrap"><input aria-label="Search Input" id="typeaheadinput" class="search-form-input" type="text"autocomplete="off" data-type="search-input" placeholder="Search"></span><input type="submit"><button aria-label="Cancel Search" class="header-cancel-search-button" data-type="button-search-cancel"><span class="icon icon-close"></span></button></div></form>';

const config = {
  setNavTop: true,
  searchExposed: false,
  highlightHeader: true,
  useFixedMenus: false, // Area header uses fixed menus
  headerSelector: '.header',
  openClass: 'is-open',
  activeClass: 'is-Active',
  searchOpenClass: 'has-open-search',
  fixMenuOpen: 'has-FixedMenu',
  navMenuSel: '[data-module="golf-mobile-nav"]',
  navButtonSel: '[data-type="button-header-nav"]',
  searchBoxSel: '[data-mobile-search-box]',
  searchInputSel: '[data-type="search-input"]',
  anyHeadingSel: 'h1, h2, h3, h4, h5, h6',

};

const channelInfo = {};

let roots = Array.from(document.querySelectorAll('.header li.nav-level-0'));
let menuState = false;
let navTemplateDom = null;

function getNavTemplate() {
  const navTemplate = `
    <div data-type="nav-title">
      <a class="header-logo" href="" aria-label="">
          <span class="icon icon-gd-logo"></span>
      </a>
    </div>
    <div data-type="nav-search">
        <div class="header-search-form">
            <form method="get" class="header-search-form-container">
                <span class="icon icon-search"></span>
                <input type="text" aria-label="Search Input" autocomplete="off" placeholder="Search">
                <input type="submit">
            </form>
        </div>
    </div>
    <div class="profile-info-top-wrapper" data-type="nav-profile">
        <div data-logged-in="false" class="profile-info-wrapper">
            <div class="profile-info-overtitle account-email"></div>
            <ul class="profile-info">
              <li class="profile-info-button-wrapper">
                <a class="profile-info-nickname profile-info-button o-button" href="/my-account">MY ACCOUNT</a>
                <a class="profile-info-button-logout o-button o-button-transparent" href="#" data-type="idsp-logout">Log Out</a>
              </li>
            </ul>
        </div>
        <div class="profile-info-wrapper">
            <div class="profile-info-overtitle">My Golf Digest Account</div>
            <ul class="profile-info">
              <li class="profile-info-button-wrapper">
                <a class="login-dialog-open-button profile-info-button-login  o-button" href="#" data-type="idsp-login">Log In</a>
                <a id="signup-button"class="profile-info-button-register o-button o-button-no-styles" href="#" data-type="idsp-register">Sign Up</a>
              </li>
            </ul>
        </div>
    </div>
    <div data-type="mid-nav-link">
        <a target="_blank" class="plus-link" href="/subscribe-golf-digest-plus?utm_medium=web&amp;utm_source=programmarketing&amp;utm_campaign=programmarketing&amp;utm_content=gd_plus_subscribe_hamburgernav" title="Golf Digest Plus">
            <span class="plus-link-overtitle">SUBSCRIBE TO</span>
            <span class="icon icon-gd-plus-logo"></span>
        </a>
    </div>
    <div data-type="social-icons">
        <a class="social-icon-facebook" href="" target="_blank" rel="noopener" aria-label="Facebook Logo">
            <span class="icon icon-facebook-red"></span>
        </a>
        <a class="social-icon-twitter" href="" target="_blank" rel="noopener" aria-label="Twitter Logo">
            <span class="icon icon-twitter-red"></span>
        </a>
        <a class="social-icon-instagram" href="" target="_blank" rel="noopener" aria-label="Instagram Logo">
            <span class="icon icon-instagram-red"></span>
        </a>
        <a class="social-icon-youtube" href="" target="_blank" rel="noopener" aria-label="Youtube Logo">
            <span class="icon icon-youtube-red"></span>
        </a>
    </div>
    <div class="leaderboard">
        <div class="o-leaderboard" data-module="leaderboard" id="mod-leaderboard-1" style="display: flex;">
            <div class="o-leaderboard__a-Data hidden" data-year="2023" data-partner="pga" data-event-id="R2023521" data-event-title="The CJ Cup"></div>
            <div class="o-leaderboard-event-info">
                <h4 class="o-leaderboard-event-info-event-title">
                The CJ Cup
                </h4>
                <p class="o-leaderboard-event-info-event-location">
                Congaree Golf Club
                </p>
            </div>
            <div class="o-leaderboard-players"></div>
            <div class="o-leaderboard-link-container">
                <a target="_blank" rel="noopener noreferrer" href="https://www.pgatour.com/leaderboard.html" class="o-leaderboard-link-container-link">
                See Full Leaderboard
                <span class="icon icon-arrow-right"></span>
                </a>
            </div>
        </div>
    </div>
  `;

  const parser = new DOMParser();
  navTemplateDom = parser.parseFromString(navTemplate, 'text/html');
}

getNavTemplate();

function getHeaderTemplate() {
  const homeHeaderTemplate = `
    <div class="header-top-bar homepage-header-bar">
      <div class="header-top-left">
          <a target="_blank" class="plus-link"
             href="/subscribe-golf-digest-plus?utm_medium=web&utm_source=programmarketing&utm_campaign=programmarketing&utm_content=gd_plus_subscribe_homepage"
             title="Golf Digest Plus"
             aria-label="Golf Digest Plus Logo">
              <span class="plus-link-overtitle">SUBSCRIBE TO</span>
              <svg xmlns="http://www.w3.org/2000/svg" aria-label="Golf Digest Plus" role="img" viewBox="0 0 3725 710">
                  <title>Golf Digest Plus</title>
                  <path d="M2211.19 404.05v-5.852c-12.43-2.915-24.86-35.093-24.86-106.758 0-72.372 12.43-105.256 24.86-108.215v-5.83c-65.05 2.208-151.27 36.572-151.27 114.045s86.22 109.695 151.27 112.61Zm90.61 35.822h-157.85c-14.61 0-23.39-5.853-23.39-18.287 0-10.225 5.85-16.055 11.69-20.45l-3.64-4.417c-31.43 14.62-75.27 41.674-75.27 90.658 0 59.231 39.45 86.285 94.28 86.285h143.23c29.93 0 48.21 8.834 48.21 35.093 0 44.589-59.93 65.061-113.99 71.643v6.625c116.17-7.31 200.87-62.875 200.87-138.184.09-78.975-45.23-108.966-124.14-108.966Zm95.73-213.494a46.575 46.575 0 0 0 33.11-13.653 46.693 46.693 0 0 0 10.14-15.196 46.7 46.7 0 0 0 3.52-17.926 47.106 47.106 0 0 0-46.77-46.798 46.45 46.45 0 0 0-32.69 13.874 46.432 46.432 0 0 0-13.35 32.924 46.03 46.03 0 0 0 3.28 17.854 45.997 45.997 0 0 0 9.94 15.193 45.88 45.88 0 0 0 15.03 10.167 45.92 45.92 0 0 0 17.79 3.561Z" fill="#8A8A81"></path>
                  <path d="M2119.12 629.977c0-24.138 11.04-37.279 18.28-43.86l-1.48-3.666c-61.39 5.123-93.52 19.744-93.52 48.255 0 38.03 53.32 55.565 162.21 56.294v-6.625c-49.71-2.209-85.49-13.848-85.49-50.398Zm257.95-338.537c0-77.473-85.51-111.108-149.81-114.045v5.852c12.42 2.937 23.4 35.821 23.4 108.215 0 71.665-11.04 103.799-23.4 106.758v5.852c64.3-2.937 149.81-35.092 149.81-112.632Z" fill="#8A8A81"></path>
                  <path d="M352.871 514.452a134.759 134.759 0 0 1-38.717 11.042v10.226c87.675-2.209 149.06-16.807 188.527-34.364V327.284h-149.81v187.168ZM490.96 175.208V77.24c-31.41-8.834-82.553-14.62-136.633-15.349v10.226c55.559 26.325 95.003 56.293 136.633 103.091ZM224.25 298.772c0-138.184 41.652-211.307 101.537-226.655V62.002C162.136 72.845 54 159.175 54 298.772c0 135.976 95.709 229.682 240.399 236.881v-10.225c-52.6-9.497-70.149-94.324-70.149-226.656Zm498.412-121.377v8.038a37.525 37.525 0 0 1 18.277 12.434c16.069 20.473 19.711 61.418 19.711 157.928 0 97.173-3.642 138.184-19.711 158.657-4.415 5.124-12.427 11.042-18.277 12.434v8.039c102.288-7.31 186.342-74.581 186.342-179.13 0-104.549-84.143-171.068-186.342-178.4ZM517.316 355.729c0 104.549 84.761 171.819 187.07 179.129v-7.972c-6.622-1.48-13.884-7.31-18.277-12.434-16.797-20.473-19.711-61.418-19.711-158.657 0-96.51 2.914-137.455 19.711-157.928a34.53 34.53 0 0 1 18.277-12.434v-8.038c-102.309 7.332-187.07 73.851-187.07 178.334Zm406.742 173.343h143.232V26.048L924.058 39.21v489.862Zm344.472-430.63c0-43.86 32.87-60.69 59.2-64.355v-8.04c-92.71 5.124-202.43 25.597-202.43 125.022v32.178h-43.15v48.984h43.13v296.841h143.25V232.231h67.94v-48.984h-67.94V98.441Z" fill="#000"></path>
                  <path d="M1355.88 37.708a53.73 53.73 0 0 0-29.88 9.056 53.82 53.82 0 0 0-19.82 24.14 53.87 53.87 0 0 0-3.07 31.085 53.93 53.93 0 0 0 14.71 27.551 53.763 53.763 0 0 0 58.61 11.672 53.797 53.797 0 0 0 33.19-49.705 53.808 53.808 0 0 0-15.74-38.034 53.754 53.754 0 0 0-38-15.765Z" fill="#000"></path>
                  <path d="M1590.18 68.45h-165.15v460.622h165.15V68.45Zm25.56 0v11.043c65.05 5.852 95.73 51.192 95.73 219.346 0 160.843-32.13 214.95-94.91 220.074v10.225c164.42-2.208 265.25-79.682 265.25-230.299-.06-164.576-104.56-228.18-266.07-230.389Zm280.13 460.622h142.51V181.789l-142.51 13.163v334.12Z" fill="#8A8A81"></path>
                  <path d="M1967.1 23a71.71 71.71 0 0 0-66.2 44.335 71.8 71.8 0 0 0-4.06 41.449 71.715 71.715 0 0 0 56.35 56.346 71.664 71.664 0 0 0 41.42-4.085 71.738 71.738 0 0 0 32.18-26.418 71.835 71.835 0 0 0 12.1-39.852c0-9.43-1.86-18.768-5.46-27.48A71.777 71.777 0 0 0 2017.86 44a71.635 71.635 0 0 0-23.29-15.556A71.667 71.667 0 0 0 1967.1 23Z" fill="#ED3E49"></path>
                  <path d="M3257.32 466.925c-37.28 0-54.8-15.348-54.8-57.773V232.96h90.5v-49.713h-90.5l3.33-126.48-145.84 50.442v76.038h-44.56v49.713h43.86v189.376c0 81.869 47.47 112.633 114.78 112.633 65.05 0 108.15-30.72 127.87-66.52v-11.042c-7.27 4.329-29.19 9.518-44.64 9.518ZM2950.2 300.959l-62.12-29.152c-25.58-11.705-40.19-23.388-40.19-48.255 0-27.054 21.19-35.844 39.47-38.03v-8.127c-85.52 5.123-146.17 61.417-146.17 124.292 0 59.961 38.01 92.138 78.93 111.131l44.57 20.472c37.28 17.536 49.71 29.97 49.71 51.922 0 26.325-19.01 38.008-42.39 41.674v8.039c103.75-5.124 147.61-51.9 147.61-130.875 0-49.712-31.43-85.556-69.42-103.091Zm-203.16 131.603v88.471c26.31 7.31 73.08 13.251 108.16 13.891v-8.038c-32.17-15.349-72.34-55.588-108.16-94.324Zm252.84-162.964v-77.517c-21.91-6.626-62.09-14.62-96.45-14.62v8.039c35.07 13.096 66.5 42.358 96.45 84.098Zm-462.52 39.422c0-97.99 9.49-118.463 29.96-123.675v-7.95c-99.33 8.038-174.65 81.161-174.65 177.671 0 91.387 54.06 179.859 176.83 179.859 106.68 0 146.88-75.309 158.58-116.255v-12.411c-20.47 15.327-54.81 25.574-92.71 25.574-65.87 0-98.01-43.86-98.01-122.813Z" fill="#8A8A81"></path>
                  <path d="m2603.96 306.06-48.23 7.332v9.497H2726c0-64.333-39.47-140.371-144.69-145.494v8.038c13.82 3.666 22.65 45.34 22.65 120.627Z" fill="#8A8A81"></path>
                  <path d="M3532 184h50v230h-50z" style="fill: #ED3E49"></path>
                  <path d="M3440 321v-50h230v50z" style="fill: #ED3E49"></path>
              </svg>
          </a>
          <button aria-label="Open Navigation Menu" class="header-menu-button">
              <span class="icon icon-menu"></span>
          </button>
      </div>
      <a class="header-logo" href="/" aria-label="Golf Digest Logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="171.5" height="35.1" viewBox="0 0 171.5 35.1" role="img"
               aria-label="Golf Digest Logo">
              <title>Golf Digest Logo</title>
              <path d="M68.8 6.5c1.6 0 2.8-1.3 2.8-2.8S70.3.9 68.8.9C67.2.9 66 2.2 66 3.7s1.2 2.8 2.8 2.8M12.7 27.1v-.5C9.9 26 9 21.5 9 14.6c0-7.3 2.2-11.2 5.4-12v-.5C5.7 2.6 0 7.2 0 14.6c0 7.1 5.1 12.1 12.7 12.5m1 0c4.6-.1 7.9-.9 10-1.8v-9.2h-7.9V26c-.5.2-1.4.5-2 .6v.5h-.1zM23.1 8V2.9c-1.7-.5-4.4-.8-7.2-.8v.5c2.9 1.4 5 3 7.2 5.4M34.3 27v-.4c-.3-.1-.7-.4-1-.7-.9-1.1-1-3.2-1-8.4 0-5.1.2-7.3 1-8.3.2-.3.6-.6 1-.7v-.4c-5.4.4-9.9 3.9-9.9 9.4.1 5.6 4.5 9.1 9.9 9.5m1 0c5.4-.4 9.8-3.9 9.8-9.5 0-5.5-4.4-9-9.8-9.4v.4c.3.1.7.3 1 .7.8 1.1 1 3.2 1 8.3 0 5.1-.2 7.3-1 8.4-.2.3-.7.6-1 .7v.4zM46 26.7h7.5V.2L46 .9v25.8z"></path>
              <path d="M64.1 26.7V11h3.6V8.5h-3.6V4c0-2.3 1.7-3.2 3.1-3.4V.2c-4.9.3-10.7 1.4-10.7 6.6v1.7h-2.3V11h2.3v15.7h7.6z"></path>
              <path fill="#ED1C24"
                    d="M101 7.6c2.1 0 3.8-1.7 3.8-3.8S103.1 0 101 0s-3.8 1.7-3.8 3.8 1.7 3.8 3.8 3.8"></path>
              <path fill="#A8A9A3"
                    d="M114.7 35.1v-.3c2.9-.3 6-1.4 6-3.8 0-1.4-1-1.9-2.5-1.9h-7.6c-2.9 0-5-1.4-5-4.6 0-2.6 2.3-4 4-4.8l.2.2c-.3.2-.6.5-.6 1.1 0 .7.5 1 1.2 1h8.3c4.2 0 6.6 1.6 6.6 5.8 0 3.9-4.5 6.9-10.6 7.3m-1.1 0c-5.8 0-8.6-1-8.6-3 0-1.5 1.7-2.3 4.9-2.5l.1.2c-.4.3-1 1-1 2.3 0 1.9 1.9 2.5 4.5 2.7v.3m1.3-15v-.3c.7-.2 1.2-1.9 1.2-5.6 0-3.8-.6-5.6-1.2-5.7v-.4c3.4.2 7.9 1.9 7.9 6s-4.5 5.9-7.9 6m-.9 0c-3.4-.2-8-1.9-8-5.9s4.6-5.9 8-6v.3c-.7.2-1.3 1.9-1.3 5.7 0 3.8.7 5.5 1.3 5.6v.3m9.9-9.4c-1.3 0-2.4-1.1-2.4-2.5s1.1-2.5 2.4-2.5c1.4 0 2.5 1.1 2.5 2.5-.1 1.5-1.2 2.5-2.5 2.5M82.5 26.7v-.5c3.3-.3 5-3.1 5-11.6 0-8.9-1.6-11.3-5.1-11.6v-.6c8.5.1 14 3.5 14 12.2.1 7.9-5.2 12-13.9 12.1m-1.4 0h-8.7V2.4h8.7v24.3M104.8 26.7h-7.5V9.1l7.5-.7v18.3M164.8 27c-3.5 0-6.1-1.6-6.1-5.9v-10h-2.3V8.5h2.4v-4l7.7-2.7-.2 6.7h4.8v2.6h-4.8v9.3c0 2.2.9 3 2.9 3 .8 0 2-.3 2.4-.5v.6c-1.1 1.9-3.4 3.5-6.8 3.5M148.8 27v-.4c1.2-.2 2.2-.8 2.2-2.2 0-1.2-.7-1.8-2.6-2.7l-2.4-1.1c-2.2-1-4.2-2.7-4.2-5.9 0-3.3 3.2-6.3 7.7-6.6v.4c-1 .1-2.1.6-2.1 2 0 1.3.8 1.9 2.1 2.5l3.3 1.5c2 .9 3.7 2.8 3.7 5.4.1 4.4-2.2 6.9-7.7 7.1m-.9 0c-1.9 0-4.3-.3-5.7-.7v-4.7c1.9 2 4 4.2 5.7 5v.4m7.7-14c-1.6-2.2-3.2-3.7-5.1-4.4v-.5c1.8 0 3.9.4 5.1.8V13M132.9 27c-6.5 0-9.3-4.7-9.3-9.5 0-5.1 4-9 9.2-9.4v.4c-1.1.3-1.6 1.4-1.6 6.5 0 4.2 1.7 6.5 5.2 6.5 2 0 3.8-.5 4.9-1.4v.7c-.7 2.2-2.8 6.2-8.4 6.2m8.2-11.2h-9v-.5l2.5-.4c0-4-.5-6.2-1.2-6.4v-.4c5.6.3 7.7 4.3 7.7 7.7"></path>
          </svg>
      </a>
      <div class="header-top-right">
          <a target="_blank" href="/subscribe-golf-digest-plus" class="header-mobile-subscribe header-link">Subscribe</a>
          <div class="profile-info">
              <a data-logged-in="false" class="profile-info-profile-photo" id="nav-photo"
                 href="/my-account">
              </a>
              <a class="login-dialog-open-button profile-info-button-login" href="#" data-type="gigya-login">Log In</a>
          </div>
      </div>
  </div>
  <hr>
  <div class="header-bottom-bar no-children">
      <!-- Bar -->
      <div class="header-bottom-left">
          <button aria-label="Open Navigation Menu" class="header-menu-button">
              <span class="icon icon-menu"></span>
              <span class="label">Menu</span>
          </button>
      </div>
      <div class="header-sub-nav"></div>
      <div class="header-bottom-right">
          ${searchForm}
          ${searchButton}
      </div>
  </div>
  <hr>
  <!-- Burger -->
  <nav class="header-nav-menu nav-menu" data-module="golf-mobile-nav" id="mod-golf-mobile-nav-1">
      <!-- placeholder nav --></nav>
  <div class="header-overlay" data-type="button-close" style="display: none">
      <button data-type="close" class="header-close" aria-label="Close Icon">
          <span class="icon icon-close"></span>
      </button>
  </div>
  
  <!-- Log in -->
  <dialog class="login-dialog" id="loginDialog">
    <div class="login-dialog-content">
        <div class="login-dialog-header">
            <span class="login-dialog-logo icon icon-gd-logo"></span>
            <span class="login-dialog-close"></span>
        </div>
        <h2>LOG IN</h2>
        <form class="login-dialog-form">
            <label for="email-input">
                Email <span class="required">*</span>
            </label>
            <input id="email-input" type="email" required>
  
            <label for="password-input">
                Password <span class="required">*</span>
            </label>
            <input id="password-input" type="password" required>
  
            <div class="login-dialog-forgot">
                <a href="#">Forgot Password?</a>
            </div>
            <div class="login-dialog-button-container">
                <button class="login-dialog-button" type="submit">LOG IN</button>
            </div>
        </form>
        <div class="login-dialog-signup">
          <a href="#" id="signup-link">Don't have an account? <span class="red">SIGN UP</span></a>
        </div>
        <div class="login-dialog-agreement">
            View our<br>
            <a href="/visitor-agreement">VISITOR AGREEMENT</a> and <a href="/privacy-and-cookies-notice">PRIVACY POLICY</a>
        </div>
    </div>
  </dialog>
  
  
  <!-- Sign up dialog  -->
  <dialog class="login-dialog" id="signupDialog">
    <div class="login-dialog-content">
        <div class="login-dialog-header">
          <span class="login-dialog-logo icon icon-gd-logo"></span>
          <span class="signup-dialog-close">X</span>
        </div>
        <h2>CREATE AN ACCOUNT</h2>
        <form class="login-dialog-form">
            <label for="signup-email-input">
                Email <span class="required">*</span>
            </label>
            <input id="signup-email-input" type="email" required>
  
            <label for="signup-password-input">
                Password <span class="required">*</span>
            </label>
            <input id="signup-password-input" type="password" required>
            <div class="login-dialog-agreement">
                By creating an account, you agree to our<br>
                <a href="/visitor-agreement">Visitor Agreement</a> and acknowledge our <a href="/privacy-and-cookies-notice">Privacy Policy</a>
            </div>
            <div class="gd-agreement-checkbox">
                <input type="checkbox" id="gigya-checkbox" name="gigya-checkbox" />
                <label class="gigya-label" for="gigya-checkbox">
                    Golf Digest and its <a href="https://urldefense.com/v3/__https:/www.warnermediaprivacy.com/policycenter/b2c/affiliateslist/*affiliates__;Iw!!AQdq3sQhfUj4q8uUguY!kbf1JPRxedrBfVvxF1h2IAyH7aS5afcHoUr8zB61e_XxSeMKCF26U-F7SlvJVQe0PhJoqvaTNvCqHSHKGOspvNHvBpL5wC1cEtZnZOOW5w$">affiliates</a> may use your email address to send updates, news, ads, and offers. You can opt out or learn more about your rights via the <a href="/privacy-and-cookies-notice">Privacy Policy</a>.
                </label>
            </div>
  
            <div class="login-dialog-button-container">
                <button class="login-dialog-button" type="submit">CREATE AN ACCOUNT</button>
            </div>
        </form>
        <div class="login-dialog-signup">
          <a href="#" id="login-link">Already have an account? <span class="red">LOG IN</span></a>
      </div>
    </div>
  </dialog>
  `;

  const defaultHeaderTemplate = `
    <div class="header-top-bar">
      <div class="header-top-left">
          <button aria-label="Open Navigation Menu" class="header-menu-button">
              <span class="icon icon-menu"></span>
          </button>
          <div class="header-channel-crumb">
              <a class="header-channel header-link inactive" href=""></a>
              <div class="separator"></div>
              <a class="header-subchannel header-link" href=""></a>
          </div>
      </div>
      <a class="header-logo" href="/" aria-label="Golf Digest Logo">
          <span class="icon icon-gd-logo"></span>
      </a>
      <div class="header-top-right">
          <a target="_blank" href="/subscribe-golf-digest-plus" class="header-mobile-subscribe header-link">Subscribe</a>
          ${searchForm}
          ${searchButton}
          <div class="profile-info">
              <a data-logged-in="false" class="profile-info-profile-photo" id="nav-photo"
                 href="/my-account">
              </a>
              <a class="login-dialog-open-button profile-info-button-login" href="#" data-type="gigya-login">Log In</a>
          </div>
      </div>
  </div>
  <hr>
  <div class="header-bottom-bar no-children">
      <!-- Bar -->
      <a class="header-subchannel header-link" href=""></a>
      <div class="separator"></div>
      <div class="header-sub-nav"></div>
      <div class="header-bottom-right">
      </div>
  </div>
  <hr>
  <!-- Burger -->
  <nav class="header-nav-menu nav-menu" data-module="golf-mobile-nav" id="mod-golf-mobile-nav-1">
      <!-- placeholder nav --></nav>
  <div class="header-overlay" data-type="button-close" style="display: none">
      <button data-type="close" class="header-close" aria-label="Close Icon">
          <span class="icon icon-close"></span>
      </button>
  </div>
  
  <!-- Log in -->
  <dialog class="login-dialog" id="loginDialog">
      <div class="login-dialog-content">
          <div class="login-dialog-header">
              <span class="icon icon-gd-logo login-dialog-logo"></span>
              <span class="login-dialog-close"></span>
          </div>
          <h2>LOG IN</h2>
          <form class="login-dialog-form">
              <label for="email-input">
                  Email <span class="required">*</span>
              </label>
              <input id="email-input" type="email" required>
  
              <label for="password-input">
                  Password <span class="required">*</span>
              </label>
              <input id="password-input" type="password" required>
  
              <div class="login-dialog-forgot">
                  <a href="#">Forgot Password?</a>
              </div>
              <div class="login-dialog-button-container">
                  <button class="login-dialog-button" type="submit">LOG IN</button>
              </div>
          </form>
          <div class="login-dialog-signup">
              <a href="#" id="signup-link">Don't have an account? <span class="red">SIGN UP</span></a>
          </div>
          <div class="login-dialog-agreement">
              View our<br>
              <a href="/visitor-agreement">VISITOR AGREEMENT</a> and <a href="/privacy-and-cookies-notice">PRIVACY POLICY</a>
          </div>
      </div>
  </dialog>
  
  
  <!-- Sign up dialog  -->
  <dialog class="login-dialog" id="signupDialog">
      <div class="login-dialog-content">
          <div class="login-dialog-header">
              <span class="icon icon-gd-logo login-dialog-logo"></span>
              <span class="signup-dialog-close">X</span>
          </div>
          <h2>CREATE AN ACCOUNT</h2>
          <form class="login-dialog-form">
              <label for="signup-email-input">
                  Email <span class="required">*</span>
              </label>
              <input id="signup-email-input" type="email" required>
  
              <label for="signup-password-input">
                  Password <span class="required">*</span>
              </label>
              <input id="signup-password-input" type="password" required>
              <div class="login-dialog-agreement">
                  By creating an account, you agree to our<br>
                  <a href="/visitor-agreement">Visitor Agreement</a> and acknowledge our <a href="/privacy-and-cookies-notice">Privacy Policy</a>
              </div>
              <div class="gd-agreement-checkbox">
                  <input type="checkbox" id="gigya-checkbox" name="gigya-checkbox" />
                  <label class="gigya-label" for="gigya-checkbox">
                      Golf Digest and its <a href="https://urldefense.com/v3/__https:/www.warnermediaprivacy.com/policycenter/b2c/affiliateslist/*affiliates__;Iw!!AQdq3sQhfUj4q8uUguY!kbf1JPRxedrBfVvxF1h2IAyH7aS5afcHoUr8zB61e_XxSeMKCF26U-F7SlvJVQe0PhJoqvaTNvCqHSHKGOspvNHvBpL5wC1cEtZnZOOW5w$">affiliates</a> may use your email address to send updates, news, ads, and offers. You can opt out or learn more about your rights via the <a href="/privacy-and-cookies-notice">Privacy Policy</a>.
                  </label>
              </div>
  
              <div class="login-dialog-button-container">
                  <button class="login-dialog-button" type="submit">CREATE AN ACCOUNT</button>
              </div>
          </form>
          <div class="login-dialog-signup">
              <a href="#" id="login-link">Already have an account? <span class="red">LOG IN</span></a>
          </div>
      </div>
  </dialog>
  `;

  return isHomePage ? homeHeaderTemplate : defaultHeaderTemplate;
}

function handleRootExpand() {
  const anyExpanded = roots.reduce((expanded, current) => expanded || current.classList.contains('expanded'), false);
  roots.forEach((root) => {
    if (!anyExpanded) {
      root.style.display = 'block';
    } else {
      root.style.display = null;
    }
  });
}

function handleExpand(expandButton) {
  const item = expandButton.closest('.nav-menu-nav-list-item');
  const expanded = item.parentNode.querySelector('.expanded');

  if (expanded === item) {
    item.classList.toggle('expanded');
  } else {
    item.classList.toggle('expanded');
    if (!item.classList.contains('nav-level-0')) expanded?.classList.remove('expanded');
  }

  handleRootExpand();
}

function showSearch(state) {
  const searchContainer = document.querySelector(config.searchBoxSel);
  const searchBtn = document.querySelector('[data-type=button-search-toggle]');
  const mainHeader = document.querySelector(config.headerSelector);

  const outsideClickListener = (event) => {
    if (!searchContainer.contains(event.target) && !searchBtn.contains(event.target)) {
      showSearch(false);
    }
  };

  if (state) {
    if (config.highlightHeader) {
      mainHeader.classList.add(config.searchOpenClass); // used for main header
      document.body.classList.add(config.fixMenuOpen);
      // context.broadcast('openSearch');
    }
  } else {
    document.removeEventListener('click', outsideClickListener);
    document.querySelectorAll(config.searchInputSel).value = '';
    if (config.highlightHeader) {
      mainHeader.classList.remove(config.searchOpenClass);
      document.body.classList.remove(config.fixMenuOpen);
      // context.broadcast('closeSearch');
    }
  }
  searchContainer.classList.toggle(config.openClass, state);
  if (state) {
    document.querySelector(config.searchInputSel).focus();
    document.addEventListener('click', outsideClickListener);
  }
}

function toggleNav(state) {
  menuState = (typeof state === 'undefined') ? !state : state;
  if (menuState) {
    showSearch(false);
  }
  // setNavTop();
  const menuButtons = document.querySelectorAll('.header .header-menu-button');
  const menuEl = document.querySelector('.header .header-nav-menu');
  menuButtons.forEach((menuBtn) => {
    menuBtn.classList.toggle(config.activeClass, menuState);
  });
  menuEl.classList.toggle(config.openClass, menuState);
  document.querySelector('.header .header-overlay').style = `display: ${menuState ? 'block' : 'none'}`;

  const outsideClickListener = (event) => {
    if (!menuEl.contains(event.target) && !menuButtons[0].contains(event.target)
      && (menuButtons[1] && !menuButtons[1].contains(event.target))) {
      toggleNav(false);
    }
  };

  if (menuState) {
    document.addEventListener('click', outsideClickListener);
  } else {
    document.removeEventListener('click', outsideClickListener);
  }
}

function toggleSearch(state) {
  if (state) {
    toggleNav(false);
    showSearch(true);
  } else {
    showSearch(false);
  }
}

function registerSubMenuEvents(rootMenu) {
  const allSubMenus = rootMenu.querySelectorAll('.nav-menu-nav-list');
  allSubMenus.forEach((menu) => {
    const buttons = menu.querySelectorAll('.expand-button');
    buttons.forEach((btn) => {
      btn.onclick = () => {
        handleExpand(btn);
      };
    });
  });
}

function registerRootMenuEvents(rootMenu) {
  const menuBtn = rootMenu.querySelector('.expand-button');
  if (menuBtn) {
    menuBtn.onclick = () => {
      rootMenu.classList.toggle('expanded');
      handleRootExpand();
    };
  }
  registerSubMenuEvents(rootMenu);
}

function registerMenuEvents() {
  roots = Array.from(document.querySelectorAll('.header li.nav-level-0'));
  const menuButtons = document.querySelectorAll('.header .header-menu-button');
  const menuCloseBtn = document.querySelector('.header .header-close');
  const searchBtn = document.querySelector('.header [data-type=button-search-toggle]');
  const searchCancelBtn = document.querySelector('.header [data-type=button-search-cancel]');
  menuButtons.forEach((menuBtn) => {
    menuBtn.onclick = () => {
      toggleNav();
    };
  });

  menuCloseBtn.onclick = () => {
    toggleNav(false);
  };
  roots.forEach((menu) => { registerRootMenuEvents(menu); });
  searchBtn.onclick = () => {
    toggleSearch(true);
  };
  searchCancelBtn.onclick = (event) => {
    event.preventDefault();
    toggleSearch(false);
  };
}

function decorateNavHeader(section) {
  const sectionLink = section.querySelector('a');
  const url = (sectionLink.getAttribute('href')) ? sectionLink.getAttribute('href') : '/';
  const text = sectionLink.innerHTML;
  const wrapper = document.createElement('div');

  if (navTemplateDom) {
    const logo = navTemplateDom.querySelector('[data-type="nav-title"]');
    if (logo) {
      logo.querySelectorAll('[aria-label]').forEach((el) => el.setAttribute('aria-label', text));
      const el = logo.firstElementChild;
      el.setAttribute('href', url);
      const titleElem = el.querySelector('title');
      if (titleElem) titleElem.innerHTML = text;
      wrapper.append(el);
    }

    const search = navTemplateDom.querySelector('[data-type="nav-search"]');
    if (search) {
      wrapper.append(search);
    }

    return wrapper;
  }

  const el = createTag('a', { class: 'header-logo', href: url, 'aria-label': text });
  el.innerHTML = text;
  wrapper.append(el);

  return wrapper;
}

function getChannelPathPart(url) {
  const parts = url.split('/');
  if (parts[parts.length - 1].length === 0) {
    parts.pop();
  }
  return `/${parts.pop()}`;
}

function isActiveMenuURL(url) {
  const channelPath = getChannelPathPart(url);
  return (getMetadata('hlx:long-form-path').lastIndexOf(channelPath) > -1);
}

let activeItem = null;
function decorateMainMenuLevel(listEl, level) {
  const navLevel = `nav-level-${level}`;
  const nextLevel = level + 1;
  listEl.classList.add('nav-menu-nav-list');
  listEl.classList.add(navLevel);
  listEl.querySelectorAll(':scope > li').forEach((listItem) => {
    listItem.classList.add('nav-menu-nav-list-item');
    listItem.classList.add(navLevel);
    if (level === 0) {
      listItem.style.display = 'block';
    }
    const menuLink = listItem.querySelector('a');
    const linkHref = (menuLink.href) ? menuLink.href : '';
    const link = createTag('a', { class: 'expand-title', href: linkHref }, menuLink.innerHTML);
    const menuItemDiv = createTag('div', { class: `nav-menu-nav-link ${navLevel}` });
    const submenus = listItem.querySelectorAll(':scope > ul');
    menuItemDiv.append(link);
    menuLink.replaceWith(menuItemDiv);
    if (isHomePage && level === 0) {
      // get top level menus for horizontal nav on homepage
      if (!channelInfo.submenus) {
        channelInfo.submenus = listItem.parentElement;
      }
    }
    if (isActiveMenuURL(linkHref)) {
      if (activeItem) {
        activeItem.classList.remove('active');
        activeItem.querySelector('.nav-menu-nav-link').classList.remove('active');
        activeItem.querySelector('.nav-menu-nav-link').querySelector('.active-indicator').remove();
      }
      listItem.classList.add('active');
      listItem.querySelector('.nav-menu-nav-link').classList.add('active');
      listItem.querySelector('.nav-menu-nav-link').append(createTag('span', { class: 'active-indicator' }));
      channelInfo.submenus = listItem.parentElement;
      activeItem = listItem;
      if (submenus && submenus.length > 0) {
        listItem.classList.add('expanded');
      }
      if (level === 0) {
        channelInfo.mainChannelHref = linkHref;
        channelInfo.mainChannelText = menuLink.innerHTML;
      } else if (linkHref !== channelInfo.mainChannelHref
        && linkHref !== channelInfo.subChannelHref) {
        channelInfo.subChannelHref = linkHref;
        channelInfo.subChannelText = menuLink.innerHTML;
      }
    }
    if (submenus && submenus.length > 0) {
      menuItemDiv.classList.add('has-children');
      menuItemDiv.insertAdjacentHTML('beforeend', `
        <button aria-label="Expand Section" class="expand-button " data-type="expand-button"><span class="icon icon-arrow-right"></span></button>
        `);
      submenus.forEach((subm) => {
        decorateMainMenuLevel(subm, nextLevel);
      });
    }
  });
}

function decorateSubNav() {
  if (channelInfo.submenus) {
    const submenusContainer = document.querySelector('.header .header-sub-nav');
    const submenus = channelInfo.submenus.cloneNode(true);
    submenus.removeAttribute('class');
    submenus.querySelectorAll('li').forEach((listItem) => {
      const linkContainer = listItem.querySelector('div');
      const link = listItem.querySelector('a');
      const isActive = listItem.classList.contains('active');
      listItem.removeAttribute('class');
      link.removeAttribute('class');
      if (linkContainer) {
        listItem.append(link);
        linkContainer.remove();
      }
      listItem.querySelectorAll('ul').forEach((list) => { list.remove(); });
      if (isActive) {
        listItem.classList.add('active');
      }
    });
    document.querySelector('.header-bottom-bar').classList.remove('no-children');
    submenusContainer.append(submenus);
  }
}

function decorateMainSideNav(section) {
  const main = section.querySelector('ul');
  decorateMainMenuLevel(main, 0);
  decorateSubNav();
  return main;
}

function decorateMidNavLink(section) {
  const sectionLink = section.querySelector('a');
  const url = (sectionLink.getAttribute('href')) ? sectionLink.getAttribute('href') : '/';
  const text = sectionLink.innerHTML;

  if (navTemplateDom) {
    const template = navTemplateDom.querySelector('[data-type="mid-nav-link"]');
    if (template) {
      template.querySelectorAll('[title]').forEach((el) => el.setAttribute('title', text));
      template.querySelectorAll('[aria-label]').forEach((el) => el.setAttribute('aria-label', text));
      const el = template.firstElementChild;
      el.setAttribute('href', url);
      const titleElem = el.querySelector('title');
      if (titleElem) titleElem.innerHTML = text;
      return el;
    }
  }

  const el = createTag('a', { class: 'plus-link', href: url, 'aria-label': text });
  el.innerHTML = text;
  return el;
}

function decorateSideNav(section, sectionClass) {
  const el = createTag('div', { class: sectionClass });
  const sectionLinks = section.querySelector('ul');
  el.append(sectionLinks);
  sectionLinks.querySelectorAll('li').forEach((item) => {
    item.querySelector('a').classList.add('a-nav-link');
  });
  return el;
}

function decorateSecondarySideNav(section) {
  return decorateSideNav(section, 'o-NavMenu__m-Secondary');
}

function decorateLogin() {
  return navTemplateDom.querySelector('[data-type="nav-profile"]');
}

function decorateTertiarySideNav(section) {
  return decorateSideNav(section, 'o-NavMenu__m-Tertiary');
}

function getSocialIcon(url, match) {
  const template = navTemplateDom.querySelector('[data-type="social-icons"]');
  const el = template.querySelector(`.social-icon-${match}`);
  el.setAttribute('href', url);
  return el;
}

function getSocialLinkIconFromURL(url) {
  const iconTemplates = [
    {
      match: ['facebook'],
      getIcon: (href) => getSocialIcon(href, 'facebook'),
    },
    {
      match: ['twitter'],
      getIcon: (href) => getSocialIcon(href, 'twitter'),
    },
    {
      match: ['instagram'],
      getIcon: (href) => getSocialIcon(href, 'instagram'),
    },
    {
      match: ['youtube'],
      getIcon: (href) => getSocialIcon(href, 'youtube'),
    },
  ];
  const template = iconTemplates.find((e) => e.match.some((match) => url.includes(match)));
  return ((template) ? template.getIcon(url) : '');
}

function decorateSocialSideNav(section) {
  const heading = section.querySelector(config.anyHeadingSel);
  const el = createTag('div', { class: 'social-links' }, heading);
  const iconsWrapper = createTag('div', { class: 'social-links-icon-wrapper' });
  el.append(iconsWrapper);
  section.querySelectorAll('a').forEach((link) => {
    const url = link.getAttribute('href');
    const icon = getSocialLinkIconFromURL(url);
    iconsWrapper.insertAdjacentElement('beforeend', icon);
  });
  return el;
}

function decorateNavSection(container, section, sectionIndex) {
  const navDecorators = [
    decorateNavHeader,
    decorateMainSideNav,
    decorateLogin,
    decorateMidNavLink,
    decorateSecondarySideNav,
    decorateTertiarySideNav,
    decorateSocialSideNav,
  ];

  const decorator = navDecorators[sectionIndex];
  const el = decorator(section);
  container.append(el);
}

function updateHeaderLink(block, selector, text, url) {
  block.querySelectorAll(selector).forEach((el) => {
    el.innerHTML = text;
    el.setAttribute('href', url);
  });
}

function updateChannelCrumb(block) {
  const separatorElement = block.querySelector('.header-channel-crumb .separator');
  if (!channelInfo.mainChannelHref) {
    if (separatorElement) separatorElement.style.display = 'none';
    return;
  }
  updateHeaderLink(block, '.header-channel', channelInfo.mainChannelText, channelInfo.mainChannelHref);
  if (channelInfo.subChannelHref) {
    updateHeaderLink(block, '.header-subchannel', channelInfo.subChannelText, channelInfo.subChannelHref);
  } else {
    const elements = block.querySelectorAll('.header-channel-crumb .header-subchannel, .header-channel-crumb .separator');
    elements.forEach((element) => element.remove());
    updateHeaderLink(block, '.header-subchannel', channelInfo.mainChannelText, channelInfo.mainChannelHref);
  }
}

async function buildHeader(block, html) {
  block.innerHTML = getHeaderTemplate();

  const nav = block.querySelector('nav');
  const bottomNav = createTag('div', { class: 'nav-menu-bottom' });
  const navSections = createTag('div', {}, html).children;

  if (navSections) {
    for (let i = 0; i < navSections.length; i += 1) {
      if (i < 2) decorateNavSection(nav, navSections[i], i);
      else decorateNavSection(bottomNav, navSections[i], i);
    }
  }

  updateChannelCrumb(block);
  // decorateChannelNav(block);

  nav.append(bottomNav);
}

function decorateLeaderboard(block) {
  const leaderboardEl = navTemplateDom.querySelector('.leaderboard');
  leaderboard(block, leaderboardEl);
}

function handleScrolling(el) {
  window.addEventListener('scroll', () => {
    el.classList.toggle('is-scrolling', window.scrollY > 330);
  });
}

function handleLoginButtonEvent() {
  const loginButtons = document.querySelectorAll('.login-dialog-open-button');
  const signupButton = document.getElementById('signup-button');
  const signupLink = document.getElementById('signup-link');
  const loginLink = document.getElementById('login-link');
  const loginDialog = document.getElementById('loginDialog');
  const signupDialog = document.getElementById('signupDialog');
  const loginClose = loginDialog.querySelector('.login-dialog-close');
  const signupClose = signupDialog.querySelector('.signup-dialog-close');

  // Show login dialog
  loginButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      signupDialog.close();
      loginDialog.showModal();
    });
  });

  // show sign up dialog
  signupButton.addEventListener('click', (event) => {
    event.preventDefault();
    loginDialog.close();
    signupDialog.showModal();
  });

  // Show signup dialog when clicking link "sign up"
  signupLink.addEventListener('click', (event) => {
    event.preventDefault();
    loginDialog.close();
    signupDialog.showModal();
  });

  // Show login dialog when clicking link "log in"
  loginLink.addEventListener('click', (event) => {
    event.preventDefault();
    signupDialog.close();
    loginDialog.showModal();
  });

  // Close dialogs
  loginClose.addEventListener('click', () => loginDialog.close());
  signupClose.addEventListener('click', () => signupDialog.close());
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const header = block.closest('header');
  if (header) {
    header.setAttribute('data-module', 'golf-header');
  }

  decorateLeaderboard(block);

  const resp = await fetch(`${DEFAULT_NAV}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();
    await buildHeader(block, html);
    registerMenuEvents();
    handleRootExpand();
    handleScrolling(header.querySelector('.header'));
    handleLoginButtonEvent();
    decorateIcons(block);
    decorateIcons(document.querySelector('.leaderboard'));
  }
}
