import { createTagFromString } from "../../utils/utils.js";

function getAttributionHTML(data) {
    let attribution = '';
    if (data.author_url && data.author) {
        attribution = `
        <div class="o-Attribution">
        <div class="o-Attribution__m-Body">
            <div class="o-Attribution__m-TextWrap">
                <div class="o-Attribution__a-Author">
                    <span class="o-Attribution__a-Author--Label">By</span>
                    <span class="o-Attribution__a-Author--Prefix">
                    <span class="o-Attribution__a-Name">
                        <a href="${data.author_url}">${data.author}</a>
                        </span>
                    </span>
                </div>      
            </div>       
        </div>        
        </div>`;
    }
    return attribution;
}

export function bylineTemplate(data) {
    const attributionHTML = getAttributionHTML(data);
    const publishDate = (data.publication_date) ? data.publication_date : '';
    let template = 
        `<div class="attribution">
            ${attributionHTML}
        </div>
        <div class="publishDate">
            <span style="display: none" class="clicktracking"></span>
            <div class="o-AssetPublishDate">${publishDate}</div>
        </div>
        <div class="share block">
            <div class="socialSharing">
                <span style="display: none" class="clicktracking"></span>
                <div class="o-SocialShare">
                    <ul>
                        <li>Share Story</li>
                        <li>Facebook</li>
                        <li>Twitter</li>
                        <li>Linkedin</li>
                    </ul>
                </div>
            </div>
        </div>`
    let el = createTagFromString(template.trim());
    el.classList.add('articleByline');
    return el;
}

export function shareTemplate() {
    const template = `
                <div class="share block">
                    <div class="socialSharing">
                        <span style="display: none" class="clicktracking"></span>
                        <div class="o-SocialShare">
                            <ul>
                                <li>Share Story</li>
                                <li>Facebook</li>
                                <li>Twitter</li>
                                <li>Linkedin</li>
                            </ul>
                        </div>
                    </div>
                </div>`;
    return createTagFromString(template.trim());
}

export function leaderboardTemplate(data) {
    const template = `
    <div class="leaderboard"><span style="display: none" class="clicktracking" data-resource-type="golfdigestcom/components/general/leaderboard"></span>
    <div class="o-Leaderboard" data-module="leaderboard" id="mod-leaderboard-1" style="display: flex;">
        <div class="o-Leaderboard__a-Data hidden" data-year="2023" data-partner="pga" data-event-id="R2023521" data-event-title="The CJ Cup"></div>
        <div class="o-Leaderboard__m-EventInfo">
            <h4 class="o-Leaderboard__m-EventInfo__a-EventTitle">
            The CJ Cup
            </h4>
            <p class="o-Leaderboard__m-EventInfo__a-EventLocation">
            Congaree Golf Club
            </p>
        </div>
        <div class="o-Leaderboard__m-Players"></div>
        <div class="o-Leaderboard__m-LinkContainer">
            <a target="_blank" rel="noopener noreferrer" href="https://www.pgatour.com/leaderboard.html" class="o-Leaderboard__m-LinkContainer__a-Link">
            Full Leaderboard
            <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arrow Icon">
                <path d="M1.70612 0.819317L1.53333 0.654091L1.36055 0.819317L0.827218 1.32933L0.638272 1.51001L0.827218 1.69069L3.57161 4.31506L0.827218 6.93943L0.638272 7.12012L0.827218 7.3008L1.36055 7.81081L1.53333 7.97604L1.70612 7.81081L5.17278 4.49575L5.36173 4.31506L5.17278 4.13438L1.70612 0.819317Z" fill="#151517" stroke="#151517" stroke-width="0.5"></path>
            </svg>
            </a>
        </div>
    </div>
    `
    return template.trim();
}

export function headerTemplate(data) {
    let template = `<header class="o-Header" data-module="golf-header">
<span style="display: none" class="clicktracking" data-resource-type="golfdigestcom/components/hidden/header"></span>
<script type="text/x-config">
{
    "gigyaScreensets": {
    "login": "CoreFn-RegistrationLogin"
    },
    "setNavTop": false,
    "searchExposed": false
}
</script>
<div class="o-Header__m-TopBar">
    <div class="o-Header__m-TopLeft">
        <button aria-label="Open Navigation Menu" class="o-Header__a-MenuButton" data-type="button-header-nav">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Menu Icon">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M15 2V0H0V2H15ZM15 6V8H0V6H15ZM15 12V14H0V12H15Z" fill="#151517"></path>
        </svg>
        </button>
        <div class="o-Header__m-ChannelCrumb">
        <a class="o-Header__a-Channel o-Header__a-Link inactive" href="//www.golfdigest.com/the-loop">
            The Loop
        </a>
        </div>
    </div>
    <a class="o-Header__a-Logo" href="//www.golfdigest.com" aria-label="Golf Digest Logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="171.5" height="35.1" viewBox="0 0 171.5 35.1" role="img" aria-label="Golf Digest Logo">
            <title>Golf Digest Logo</title>
            <path d="M68.8 6.5c1.6 0 2.8-1.3 2.8-2.8S70.3.9 68.8.9C67.2.9 66 2.2 66 3.7s1.2 2.8 2.8 2.8M12.7 27.1v-.5C9.9 26 9 21.5 9 14.6c0-7.3 2.2-11.2 5.4-12v-.5C5.7 2.6 0 7.2 0 14.6c0 7.1 5.1 12.1 12.7 12.5m1 0c4.6-.1 7.9-.9 10-1.8v-9.2h-7.9V26c-.5.2-1.4.5-2 .6v.5h-.1zM23.1 8V2.9c-1.7-.5-4.4-.8-7.2-.8v.5c2.9 1.4 5 3 7.2 5.4M34.3 27v-.4c-.3-.1-.7-.4-1-.7-.9-1.1-1-3.2-1-8.4 0-5.1.2-7.3 1-8.3.2-.3.6-.6 1-.7v-.4c-5.4.4-9.9 3.9-9.9 9.4.1 5.6 4.5 9.1 9.9 9.5m1 0c5.4-.4 9.8-3.9 9.8-9.5 0-5.5-4.4-9-9.8-9.4v.4c.3.1.7.3 1 .7.8 1.1 1 3.2 1 8.3 0 5.1-.2 7.3-1 8.4-.2.3-.7.6-1 .7v.4zM46 26.7h7.5V.2L46 .9v25.8z"></path><path d="M64.1 26.7V11h3.6V8.5h-3.6V4c0-2.3 1.7-3.2 3.1-3.4V.2c-4.9.3-10.7 1.4-10.7 6.6v1.7h-2.3V11h2.3v15.7h7.6z"></path><path fill="#ED1C24" d="M101 7.6c2.1 0 3.8-1.7 3.8-3.8S103.1 0 101 0s-3.8 1.7-3.8 3.8 1.7 3.8 3.8 3.8"></path><path fill="#A8A9A3" d="M114.7 35.1v-.3c2.9-.3 6-1.4 6-3.8 0-1.4-1-1.9-2.5-1.9h-7.6c-2.9 0-5-1.4-5-4.6 0-2.6 2.3-4 4-4.8l.2.2c-.3.2-.6.5-.6 1.1 0 .7.5 1 1.2 1h8.3c4.2 0 6.6 1.6 6.6 5.8 0 3.9-4.5 6.9-10.6 7.3m-1.1 0c-5.8 0-8.6-1-8.6-3 0-1.5 1.7-2.3 4.9-2.5l.1.2c-.4.3-1 1-1 2.3 0 1.9 1.9 2.5 4.5 2.7v.3m1.3-15v-.3c.7-.2 1.2-1.9 1.2-5.6 0-3.8-.6-5.6-1.2-5.7v-.4c3.4.2 7.9 1.9 7.9 6s-4.5 5.9-7.9 6m-.9 0c-3.4-.2-8-1.9-8-5.9s4.6-5.9 8-6v.3c-.7.2-1.3 1.9-1.3 5.7 0 3.8.7 5.5 1.3 5.6v.3m9.9-9.4c-1.3 0-2.4-1.1-2.4-2.5s1.1-2.5 2.4-2.5c1.4 0 2.5 1.1 2.5 2.5-.1 1.5-1.2 2.5-2.5 2.5M82.5 26.7v-.5c3.3-.3 5-3.1 5-11.6 0-8.9-1.6-11.3-5.1-11.6v-.6c8.5.1 14 3.5 14 12.2.1 7.9-5.2 12-13.9 12.1m-1.4 0h-8.7V2.4h8.7v24.3M104.8 26.7h-7.5V9.1l7.5-.7v18.3M164.8 27c-3.5 0-6.1-1.6-6.1-5.9v-10h-2.3V8.5h2.4v-4l7.7-2.7-.2 6.7h4.8v2.6h-4.8v9.3c0 2.2.9 3 2.9 3 .8 0 2-.3 2.4-.5v.6c-1.1 1.9-3.4 3.5-6.8 3.5M148.8 27v-.4c1.2-.2 2.2-.8 2.2-2.2 0-1.2-.7-1.8-2.6-2.7l-2.4-1.1c-2.2-1-4.2-2.7-4.2-5.9 0-3.3 3.2-6.3 7.7-6.6v.4c-1 .1-2.1.6-2.1 2 0 1.3.8 1.9 2.1 2.5l3.3 1.5c2 .9 3.7 2.8 3.7 5.4.1 4.4-2.2 6.9-7.7 7.1m-.9 0c-1.9 0-4.3-.3-5.7-.7v-4.7c1.9 2 4 4.2 5.7 5v.4m7.7-14c-1.6-2.2-3.2-3.7-5.1-4.4v-.5c1.8 0 3.9.4 5.1.8V13M132.9 27c-6.5 0-9.3-4.7-9.3-9.5 0-5.1 4-9 9.2-9.4v.4c-1.1.3-1.6 1.4-1.6 6.5 0 4.2 1.7 6.5 5.2 6.5 2 0 3.8-.5 4.9-1.4v.7c-.7 2.2-2.8 6.2-8.4 6.2m8.2-11.2h-9v-.5l2.5-.4c0-4-.5-6.2-1.2-6.4v-.4c5.6.3 7.7 4.3 7.7 7.7"></path>
        </svg>   
    </a>
    <div class="o-Header__m-TopRight">
        <a target="_blank" href="/subscribe-golf-digest-plus" class="o-Header__a-Subscribe o-Header__a-Link">Subscribe</a>
        <div class="m-ProfileInfo">
            <a data-logged-in="false" class="m-ProfileInfo__a-ProfilePhoto" id="nav-photo" href="//www.golfdigest.com/my-account">
            </a>
            <a class="m-ProfileInfo__a-Button--Login" href="#" data-type="gigya-login">Log In</a>
        </div>
        <button class="o-Header__a-SearchButton" data-type="button-search-toggle" aria-label="Search Toggle">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Search Icon">
                <path d="M10.7954 3.125C9.27835 3.125 7.79535 3.57486 6.53396 4.4177C5.27257 5.26053 4.28943 6.45849 3.70888 7.86007C3.12832 9.26166 2.97642 10.8039 3.27239 12.2918C3.56835 13.7797 4.29889 15.1465 5.37161 16.2192C6.44434 17.2919 7.81108 18.0225 9.29899 18.3184C10.7869 18.6144 12.3292 18.4625 13.7308 17.8819C15.1323 17.3014 16.3303 16.3183 17.1731 15.0569C18.016 13.7955 18.4658 12.3125 18.4658 10.7954C18.4657 8.76113 17.6575 6.81021 16.2191 5.37175C14.7806 3.9333 12.8297 3.12513 10.7954 3.125V3.125Z" stroke="black" stroke-width="2" stroke-miterlimit="10"></path>
                <path d="M16.5181 16.5181L21.875 21.875" stroke="black" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"></path>
            </svg>
        </button>
    </div>
</div>
<hr>
<div class="o-Header__m-BottomBar no-children">
    <!-- Bar -->    
    <a class="o-Header__a-SubChannel o-Header__a-Link" href="//www.golfdigest.com/the-loop">
    The Loop
    </a>
    <div class="separator"></div>
    <div class="o-Header__a-SubNav"></div>
    <div class="o-Header__m-BottomRight">
        <form action="/search" method="get" data-module="search-form" class="m-SearchForm" data-mobile-search-box="" id="mod-search-form-1">
            <script type="text/x-config">
                {
                "searchSite": "golfdigest",
                "searchType": "desktop header search",
                "selectorPrefix": "m-SearchForm",
                "typeAhead": "off"
                }
            </script>
            <div class="m-SearchForm__m-Area m-Area__m-Container" data-search-form-wrapper="" data-search-form-field="">
                <span class="m-SearchForm__m-InputWrap">
                <input aria-label="Search Input" id="typeaheadinput" class="m-SearchForm__a-Input a-Input" type="text" autocomplete="off" data-type="search-input" placeholder="Search">
                </span>
                <input type="submit">
                <button aria-label="Cancel Search" class="o-Header__a-CancelSearchButton" data-type="button-search-cancel">
                    <svg width="36" height="35" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Close Icon Black">
                        <line x1="25.9165" y1="25.6572" x2="9.83687" y2="9.57762" stroke="#151517" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></line>
                        <line x1="9.83655" y1="25.41" x2="25.9162" y2="9.3304" stroke="#151517" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></line>
                    </svg> 
                </button>
            </div>
        </form>
    </div>
</div> 
<hr>
<!-- Burger -->
<nav><!-- placeholder nav --></nav>   
<div class="o-Header__m-Overlay" data-type="button-close" style="display: none">
    <button type="close" class="o-Header__a-Close" aria-label="Close Icon">
        <svg width="36" height="35" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Close Icon">
            <line x1="25.9165" y1="25.6572" x2="9.83687" y2="9.57762" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></line>
            <line x1="9.83655" y1="25.41" x2="25.9162" y2="9.3304" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></line>
        </svg>
    </button>
</div>
</header>`;
    return template.trim();
} 

export function headerSchoolsIconTemplate(data) {
    let template = `<svg xmlns="http://www.w3.org/2000/svg" width="123" height="34" viewBox="0 0 123 34" fill="none" role="img" aria-label="${data.title}">
    <title>${data.title}</title>
  <mask id="path-1-inside-1" fill="white">
  <path d="M68.5228 16.8418C68.9298 17.1315 69.2127 17.435 69.3713 17.7454C69.53 18.0558 69.6059 18.4628 69.6059 18.9595V20.9531C69.6059 22.4707 68.8471 23.2226 67.3364 23.2226H66.5155C65.0117 23.2226 64.2598 22.4707 64.2598 20.9669V18.3801H66.0809V20.8979C66.0809 21.367 66.3223 21.5946 66.7983 21.5946H67.0397C67.5157 21.5946 67.7571 21.3601 67.7571 20.8979V19.2216C67.7571 18.8146 67.5847 18.4835 67.2329 18.2283L65.3428 16.8487C64.9358 16.5589 64.653 16.2554 64.4943 15.9381C64.3356 15.6208 64.2598 15.2207 64.2598 14.7309V13.0547C64.2598 11.5371 65.0186 10.7852 66.5293 10.7852H67.3157C68.8195 10.7852 69.5714 11.5371 69.5714 13.0409V15.2621H67.7364V13.1098C67.7364 12.6408 67.5019 12.4131 67.0397 12.4131H66.8121C66.343 12.4131 66.1154 12.6477 66.1154 13.1098V14.4619C66.1154 14.8827 66.2878 15.2138 66.6396 15.4552L68.5228 16.8418Z"></path>
  </mask>
  <path d="M68.5228 16.8418C68.9298 17.1315 69.2127 17.435 69.3713 17.7454C69.53 18.0558 69.6059 18.4628 69.6059 18.9595V20.9531C69.6059 22.4707 68.8471 23.2226 67.3364 23.2226H66.5155C65.0117 23.2226 64.2598 22.4707 64.2598 20.9669V18.3801H66.0809V20.8979C66.0809 21.367 66.3223 21.5946 66.7983 21.5946H67.0397C67.5157 21.5946 67.7571 21.3601 67.7571 20.8979V19.2216C67.7571 18.8146 67.5847 18.4835 67.2329 18.2283L65.3428 16.8487C64.9358 16.5589 64.653 16.2554 64.4943 15.9381C64.3356 15.6208 64.2598 15.2207 64.2598 14.7309V13.0547C64.2598 11.5371 65.0186 10.7852 66.5293 10.7852H67.3157C68.8195 10.7852 69.5714 11.5371 69.5714 13.0409V15.2621H67.7364V13.1098C67.7364 12.6408 67.5019 12.4131 67.0397 12.4131H66.8121C66.343 12.4131 66.1154 12.6477 66.1154 13.1098V14.4619C66.1154 14.8827 66.2878 15.2138 66.6396 15.4552L68.5228 16.8418Z" fill="#151C2C" stroke="white" stroke-width="0.355555" mask="url(#path-1-inside-1)"></path>
  <mask id="path-2-inside-2" fill="white">
  <path d="M75.9663 18.1037H77.8012V20.9526C77.8012 22.4702 77.0424 23.2221 75.5317 23.2221H74.6074C73.0898 23.2221 72.3379 22.4633 72.3379 20.9526V13.0473C72.3379 11.5297 73.0967 10.7778 74.6074 10.7778H75.5179C77.0217 10.7778 77.7736 11.5297 77.7736 13.0335V15.5307H75.9387V13.137C75.9387 12.661 75.7042 12.4196 75.242 12.4196H74.9247C74.4487 12.4196 74.2073 12.661 74.2073 13.137V20.863C74.2073 21.3389 74.4487 21.5804 74.9247 21.5804H75.2765C75.7456 21.5804 75.9732 21.3389 75.9732 20.863V18.1037H75.9663Z"></path>
  </mask>
  <path d="M75.9663 18.1037H77.8012V20.9526C77.8012 22.4702 77.0424 23.2221 75.5317 23.2221H74.6074C73.0898 23.2221 72.3379 22.4633 72.3379 20.9526V13.0473C72.3379 11.5297 73.0967 10.7778 74.6074 10.7778H75.5179C77.0217 10.7778 77.7736 11.5297 77.7736 13.0335V15.5307H75.9387V13.137C75.9387 12.661 75.7042 12.4196 75.242 12.4196H74.9247C74.4487 12.4196 74.2073 12.661 74.2073 13.137V20.863C74.2073 21.3389 74.4487 21.5804 74.9247 21.5804H75.2765C75.7456 21.5804 75.9732 21.3389 75.9732 20.863V18.1037H75.9663Z" fill="#151C2C" stroke="white" stroke-width="0.355555" mask="url(#path-2-inside-2)"></path>
  <mask id="path-3-inside-3" fill="white">
  <path d="M82.471 16.0339H84.2714V10.874H86.1408V23.1114H84.2714V17.7239H82.471V23.1114H80.6016V10.8809H82.471V16.0339Z"></path>
  </mask>
  <path d="M82.471 16.0339H84.2714V10.874H86.1408V23.1114H84.2714V17.7239H82.471V23.1114H80.6016V10.8809H82.471V16.0339Z" fill="#151C2C" stroke="white" stroke-width="0.355555" mask="url(#path-3-inside-3)"></path>
  <mask id="path-4-inside-4" fill="white">
  <path d="M94.5148 20.9526C94.5148 22.4702 93.756 23.2221 92.2453 23.2221H91.2519C89.7343 23.2221 88.9824 22.4633 88.9824 20.9526V13.0473C88.9824 11.5297 89.7412 10.7778 91.2519 10.7778H92.2453C93.7629 10.7778 94.5148 11.5366 94.5148 13.0473V20.9526ZM92.6454 13.137C92.6454 12.661 92.4108 12.4196 91.9486 12.4196H91.5623C91.0864 12.4196 90.8449 12.661 90.8449 13.137V20.863C90.8449 21.3389 91.0864 21.5804 91.5623 21.5804H91.9486C92.4177 21.5804 92.6454 21.3389 92.6454 20.863V13.137Z"></path>
  </mask>
  <path d="M94.5148 20.9526C94.5148 22.4702 93.756 23.2221 92.2453 23.2221H91.2519C89.7343 23.2221 88.9824 22.4633 88.9824 20.9526V13.0473C88.9824 11.5297 89.7412 10.7778 91.2519 10.7778H92.2453C93.7629 10.7778 94.5148 11.5366 94.5148 13.0473V20.9526ZM92.6454 13.137C92.6454 12.661 92.4108 12.4196 91.9486 12.4196H91.5623C91.0864 12.4196 90.8449 12.661 90.8449 13.137V20.863C90.8449 21.3389 91.0864 21.5804 91.5623 21.5804H91.9486C92.4177 21.5804 92.6454 21.3389 92.6454 20.863V13.137Z" fill="#151C2C" stroke="white" stroke-width="0.355555" mask="url(#path-4-inside-4)"></path>
  <mask id="path-5-inside-5" fill="white">
  <path d="M102.855 20.9526C102.855 22.4702 102.096 23.2221 100.585 23.2221H99.5918C98.0742 23.2221 97.3223 22.4633 97.3223 20.9526V13.0473C97.3223 11.5297 98.0811 10.7778 99.5918 10.7778H100.585C102.103 10.7778 102.855 11.5366 102.855 13.0473V20.9526ZM100.985 13.137C100.985 12.661 100.751 12.4196 100.288 12.4196H99.9022C99.4262 12.4196 99.1848 12.661 99.1848 13.137V20.863C99.1848 21.3389 99.4262 21.5804 99.9022 21.5804H100.288C100.758 21.5804 100.985 21.3389 100.985 20.863V13.137Z"></path>
  </mask>
  <path d="M102.855 20.9526C102.855 22.4702 102.096 23.2221 100.585 23.2221H99.5918C98.0742 23.2221 97.3223 22.4633 97.3223 20.9526V13.0473C97.3223 11.5297 98.0811 10.7778 99.5918 10.7778H100.585C102.103 10.7778 102.855 11.5366 102.855 13.0473V20.9526ZM100.985 13.137C100.985 12.661 100.751 12.4196 100.288 12.4196H99.9022C99.4262 12.4196 99.1848 12.661 99.1848 13.137V20.863C99.1848 21.3389 99.4262 21.5804 99.9022 21.5804H100.288C100.758 21.5804 100.985 21.3389 100.985 20.863V13.137Z" fill="#151C2C" stroke="white" stroke-width="0.355555" mask="url(#path-5-inside-5)"></path>
  <mask id="path-6-inside-6" fill="white">
  <path d="M105.684 10.8809H107.553V21.4213H109.616V23.1182H105.684V10.8809Z"></path>
  </mask>
  <path d="M105.684 10.8809H107.553V21.4213H109.616V23.1182H105.684V10.8809Z" fill="#151C2C" stroke="white" stroke-width="0.355555" mask="url(#path-6-inside-6)"></path>
  <mask id="path-7-inside-7" fill="white">
  <path d="M116.3 16.8413C116.707 17.131 116.99 17.4345 117.149 17.7449C117.307 18.0554 117.383 18.4624 117.383 18.959V20.9526C117.383 22.4702 116.624 23.2221 115.114 23.2221H114.293C112.789 23.2221 112.037 22.4702 112.037 20.9664V18.3796H113.858V20.8974C113.858 21.3665 114.1 21.5941 114.576 21.5941H114.817C115.293 21.5941 115.534 21.3596 115.534 20.8974V19.2212C115.534 18.8142 115.362 18.483 115.01 18.2278L113.12 16.8482C112.713 16.5585 112.43 16.2549 112.272 15.9376C112.113 15.6203 112.037 15.2202 112.037 14.7304V13.0542C112.037 11.5366 112.796 10.7847 114.307 10.7847H115.093C116.597 10.7847 117.349 11.5366 117.349 13.0404V15.2616H115.514V13.1094C115.514 12.6403 115.279 12.4126 114.817 12.4126H114.589C114.12 12.4126 113.893 12.6472 113.893 13.1094V14.4614C113.893 14.8822 114.065 15.2133 114.417 15.4547L116.3 16.8413Z"></path>
  </mask>
  <path d="M116.3 16.8413C116.707 17.131 116.99 17.4345 117.149 17.7449C117.307 18.0554 117.383 18.4624 117.383 18.959V20.9526C117.383 22.4702 116.624 23.2221 115.114 23.2221H114.293C112.789 23.2221 112.037 22.4702 112.037 20.9664V18.3796H113.858V20.8974C113.858 21.3665 114.1 21.5941 114.576 21.5941H114.817C115.293 21.5941 115.534 21.3596 115.534 20.8974V19.2212C115.534 18.8142 115.362 18.483 115.01 18.2278L113.12 16.8482C112.713 16.5585 112.43 16.2549 112.272 15.9376C112.113 15.6203 112.037 15.2202 112.037 14.7304V13.0542C112.037 11.5366 112.796 10.7847 114.307 10.7847H115.093C116.597 10.7847 117.349 11.5366 117.349 13.0404V15.2616H115.514V13.1094C115.514 12.6403 115.279 12.4126 114.817 12.4126H114.589C114.12 12.4126 113.893 12.6472 113.893 13.1094V14.4614C113.893 14.8822 114.065 15.2133 114.417 15.4547L116.3 16.8413Z" fill="#151C2C" stroke="white" stroke-width="0.355555" mask="url(#path-7-inside-7)"></path>
  <g clip-path="url(#clip0)">
  <mask id="path-8-inside-8" fill="white">
  <path d="M17.8165 29.5634H17.7402C14.4561 29.4871 11.3707 28.1429 9.06428 25.783C6.7502 23.4231 5.48242 20.2995 5.48242 17.0002C5.48242 13.701 6.75784 10.585 9.06428 8.21743C11.3707 5.85753 14.4485 4.52102 17.7325 4.43701H17.8853H27.1263V6.19357H17.5034H17.3125C14.5555 6.31577 12.1726 7.4919 10.248 9.47757C8.27764 11.5014 7.19316 14.1745 7.19316 17.0002C7.19316 22.9573 12.0428 27.8069 17.9998 27.8069H22.0094V17.4966H23.7659V29.5634H17.8165Z"></path>
  </mask>
  <path d="M17.8165 29.5634H17.7402C14.4561 29.4871 11.3707 28.1429 9.06428 25.783C6.7502 23.4231 5.48242 20.2995 5.48242 17.0002C5.48242 13.701 6.75784 10.585 9.06428 8.21743C11.3707 5.85753 14.4485 4.52102 17.7325 4.43701H17.8853H27.1263V6.19357H17.5034H17.3125C14.5555 6.31577 12.1726 7.4919 10.248 9.47757C8.27764 11.5014 7.19316 14.1745 7.19316 17.0002C7.19316 22.9573 12.0428 27.8069 17.9998 27.8069H22.0094V17.4966H23.7659V29.5634H17.8165Z" fill="#FF003A" stroke="white" stroke-width="0.355555" mask="url(#path-8-inside-8)"></path>
  <mask id="path-9-inside-9" fill="white">
  <path d="M17.7479 33.0011L17.6639 32.9934C13.4635 32.9094 9.52266 31.2063 6.58233 28.1973C3.62673 25.1959 2 21.2169 2 17.0011C2 12.7854 3.62673 8.80639 6.57469 5.79732C9.52266 2.7959 13.4558 1.0928 17.6563 1.00879H17.809H27.1264V2.76535H17.5799V2.77299C13.8988 2.87991 10.462 4.39208 7.87302 7.03455C5.24582 9.71521 3.79475 13.2512 3.79475 17.0011C3.79475 20.751 5.24582 24.287 7.87302 26.9677C10.462 29.6102 13.9064 31.1223 17.5799 31.2369V31.2445L17.7327 31.2522H25.4462V17.4975H27.2028V33.0011H17.7479Z"></path>
  </mask>
  <path d="M17.7479 33.0011L17.6639 32.9934C13.4635 32.9094 9.52266 31.2063 6.58233 28.1973C3.62673 25.1959 2 21.2169 2 17.0011C2 12.7854 3.62673 8.80639 6.57469 5.79732C9.52266 2.7959 13.4558 1.0928 17.6563 1.00879H17.809H27.1264V2.76535H17.5799V2.77299C13.8988 2.87991 10.462 4.39208 7.87302 7.03455C5.24582 9.71521 3.79475 13.2512 3.79475 17.0011C3.79475 20.751 5.24582 24.287 7.87302 26.9677C10.462 29.6102 13.9064 31.1223 17.5799 31.2369V31.2445L17.7327 31.2522H25.4462V17.4975H27.2028V33.0011H17.7479Z" fill="#FF003A" stroke="white" stroke-width="0.355555" mask="url(#path-9-inside-9)"></path>
  <mask id="path-10-inside-10" fill="white">
  <path d="M33.3889 29.5634V17.4966H35.1455V27.8069H39.155C45.112 27.8069 49.9617 22.9573 49.9617 17.0002C49.9617 14.1745 48.8772 11.5014 46.9068 9.47757C44.9746 7.4919 42.4085 6.33104 39.6514 6.20884V6.20121L39.4987 6.19357H29.9521V4.43701H39.3383H39.4147C42.6987 4.51338 45.7841 5.85753 48.0906 8.21743C50.4046 10.5773 51.6724 13.701 51.6724 17.0002C51.6724 20.2995 50.397 23.4155 48.0906 25.783C45.7841 28.1429 42.7063 29.4794 39.4223 29.5634H39.2696H33.3889Z"></path>
  </mask>
  <path d="M33.3889 29.5634V17.4966H35.1455V27.8069H39.155C45.112 27.8069 49.9617 22.9573 49.9617 17.0002C49.9617 14.1745 48.8772 11.5014 46.9068 9.47757C44.9746 7.4919 42.4085 6.33104 39.6514 6.20884V6.20121L39.4987 6.19357H29.9521V4.43701H39.3383H39.4147C42.6987 4.51338 45.7841 5.85753 48.0906 8.21743C50.4046 10.5773 51.6724 13.701 51.6724 17.0002C51.6724 20.2995 50.397 23.4155 48.0906 25.783C45.7841 28.1429 42.7063 29.4794 39.4223 29.5634H39.2696H33.3889Z" fill="#FF003A" stroke="white" stroke-width="0.355555" mask="url(#path-10-inside-10)"></path>
  <mask id="path-11-inside-11" fill="white">
  <path d="M29.9521 32.9999V17.4964H31.7087V31.2434H39.5751V31.2357C43.2562 31.1212 46.6929 29.609 49.282 26.9665C51.9092 24.2859 53.3602 20.7498 53.3602 17C53.3602 13.2501 51.9092 9.71406 49.282 7.0334C46.6929 4.39092 43.2486 2.87875 39.5751 2.7642V2.75656L39.4223 2.74892H29.9521V1H39.407L39.491 1.00764C43.6915 1.09165 47.6323 2.79475 50.5727 5.80381C53.5206 8.81287 55.1474 12.7919 55.1474 17.0076C55.1474 21.2233 53.5206 25.2023 50.5727 28.2114C47.6247 31.2128 43.6915 32.9159 39.491 33.0076H39.3383H29.9521V32.9999Z"></path>
  </mask>
  <path d="M29.9521 32.9999V17.4964H31.7087V31.2434H39.5751V31.2357C43.2562 31.1212 46.6929 29.609 49.282 26.9665C51.9092 24.2859 53.3602 20.7498 53.3602 17C53.3602 13.2501 51.9092 9.71406 49.282 7.0334C46.6929 4.39092 43.2486 2.87875 39.5751 2.7642V2.75656L39.4223 2.74892H29.9521V1H39.407L39.491 1.00764C43.6915 1.09165 47.6323 2.79475 50.5727 5.80381C53.5206 8.81287 55.1474 12.7919 55.1474 17.0076C55.1474 21.2233 53.5206 25.2023 50.5727 28.2114C47.6247 31.2128 43.6915 32.9159 39.491 33.0076H39.3383H29.9521V32.9999Z" fill="#FF003A" stroke="white" stroke-width="0.355555" mask="url(#path-11-inside-11)"></path>
  </g>
  <defs>
  <clipPath id="clip0">
  <rect width="53.155" height="31.9999" fill="white" transform="translate(2 1)"></rect>
  </clipPath>
  </defs>
  </svg>`;
  return template.trim();
}

export function fullBleedArticleHero(data) {
    const template = `
        <div class="articleHeroContent">
            <p class="rubric">
                <span>${data.rubric}</span>
            </p>
            <div class="assetTitle">
                <section class="assetTitle">
                <h1 class="assetTitleHeadline">
                    <span class="assetTitleHeadlineText">${data.articleTitle}</span>
                </h1>
                </section>
            </div>   
        </div>           
        <div class="article-lead">
            <div class="imageEmbed image section">
                <div class="imageEmbedWrap center-block">
                    <div class="imageEmbed center-block landscape">
                        <div class="imageEmbed-MediaWrap">
                            <div class="imageEmbed-Media">
                            ${data.pictureHTML}
                        </div>
                    </div>
                    <div class="imageEmbed-TextWrap">
                        <p class="imageEmbedCredit">${data.imageEmbedCreditLine}</p>
                    </div>
                </div>
            </div>
        </div>`;
    const el = createTagFromString(template.trim());
    el.classList.add('articleHero');
    return el;
}

export function imageEmbed(data) {
    const template = `
    <div class="imageEmbedWrap center-block">
        <div class="imageEmbed center-block landscape">
            <div class="imageEmbed-MediaWrap">
                <div class="imageEmbed-Media">
                ${data.pictureHTML}
            </div>
        </div>
        <div class="imageEmbed-TextWrap">
            <p class="imageEmbedCredit">${data.imageEmbedCreditLine}</p>
        </div>
    </div>
    `;
    const el = createTagFromString(template.trim());
    el.classList.add('imageEmbed');
    el.classList.add('image');
    el.classList.add('section');
    return el;
}