import { createTagFromString } from "../../utils/utils.js";

export function bylineTemplate(data) {
    let template = 
        `<div class="o-ArticleByline">
                <div class="attribution">
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
                    </div>
                </div>
                <div class="publishDate">
                    <span style="display: none" class="clicktracking"></span>
                    <div class="o-AssetPublishDate">${data.publication_date}</div>
                </div>
                <div class="share block">
                    <div class="socialSharing">
                        <span style="display: none" class="clicktracking"></span>
                        <div class="o-SocialShare">
                            <ul>
                                <li>Share story</li>
                                <li>Facebook</li>
                                <li>Twitter</li>
                                <li>Linkedin</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>`
    return createTagFromString(template);
}

export function leaderboardTemplate(data) {
    const template = `
        <div class="leaderboard"><span style="display: none" class="clicktracking"></span>
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
                <div class="o-Leaderboard__m-Players">
                    <div class="o-Leaderboard__m-Players__m-Player">
                        <div class="o-Leaderboard__m-Players__m-PlayerMain">
                        <h4 class="o-Leaderboard__m-Players__m-PlayerMain__a-Place">-</h4>
                        <div class="o-Leaderboard__m-Players__m-PlayerMain__a-Name">
                            <i style="background-image:url(//golfdigest.sports.sndimg.com/discovery.divot/images/countryflags/united-states-of-america.svg);"></i><h5>Aaron Wise</h5>
                        </div>
                        <p class="o-Leaderboard__m-Players__m-PlayerMain__a-Record">1 E</p>
                    </div>
                    <div class="o-Leaderboard__m-Players__m-Player__a-PlayerScore">
                        <p>E</p>
                    </div>
                </div>
                <div class="o-Leaderboard__m-Players__m-Player">
                    <div class="o-Leaderboard__m-Players__m-PlayerMain">
                        <h4 class="o-Leaderboard__m-Players__m-PlayerMain__a-Place">-</h4>
                        <div class="o-Leaderboard__m-Players__m-PlayerMain__a-Name">
                            <i style="background-image:url(//golfdigest.sports.sndimg.com/discovery.divot/images/countryflags/south-africa.svg);"></i><h5>Christiaan Bezuidenhout</h5>
                        </div>
                        <p class="o-Leaderboard__m-Players__m-PlayerMain__a-Record">1 E</p>
                    </div>
                    <div class="o-Leaderboard__m-Players__m-Player__a-PlayerScore">
                        <p>E</p>
                    </div>
                </div>
                <div class="o-Leaderboard__m-Players__m-Player">
                    <div class="o-Leaderboard__m-Players__m-PlayerMain">
                        <h4 class="o-Leaderboard__m-Players__m-PlayerMain__a-Place">-</h4>
                        <div class="o-Leaderboard__m-Players__m-PlayerMain__a-Name">
                            <i style="background-image:url(//golfdigest.sports.sndimg.com/discovery.divot/images/countryflags/south-korea.svg);"></i><h5>Yeongsu Kim</h5>
                        </div>
                        <p class="o-Leaderboard__m-Players__m-PlayerMain__a-Record">1 E</p>
                    </div>
                    <div class="o-Leaderboard__m-Players__m-Player__a-PlayerScore">
                        <p>E</p>
                    </div>
                </div>
                <div class="o-Leaderboard__m-Players__m-Player">
                    <div class="o-Leaderboard__m-Players__m-PlayerMain">
                        <h4 class="o-Leaderboard__m-Players__m-PlayerMain__a-Place">-</h4>
                        <div class="o-Leaderboard__m-Players__m-PlayerMain__a-Name">
                            <i style="background-image:url(//golfdigest.sports.sndimg.com/discovery.divot/images/countryflags/united-states-of-america.svg);"></i><h5>Brendan Steele</h5>
                        </div>
                        <p class="o-Leaderboard__m-Players__m-PlayerMain__a-Record">1 E</p>
                    </div>
                    <div class="o-Leaderboard__m-Players__m-Player__a-PlayerScore">
                        <p>E</p>
                    </div>
                </div>
                <div class="o-Leaderboard__m-Players__m-Player">
                    <div class="o-Leaderboard__m-Players__m-PlayerMain">
                        <h4 class="o-Leaderboard__m-Players__m-PlayerMain__a-Place">-</h4>
                        <div class="o-Leaderboard__m-Players__m-PlayerMain__a-Name">
                            <i style="background-image:url(//golfdigest.sports.sndimg.com/discovery.divot/images/countryflags/argentina.svg);"></i><h5>Emiliano Grillo</h5>
                        </div>
                        <p class="o-Leaderboard__m-Players__m-PlayerMain__a-Record">1 E</p>
                    </div>
                    <div class="o-Leaderboard__m-Players__m-Player__a-PlayerScore">
                        <p>E</p>
                    </div>
                </div>
            </div>
            <div class="o-Leaderboard__m-LinkContainer">
                <a target="_blank" rel="noopener noreferrer" href="https://www.pgatour.com/leaderboard.html" class="o-Leaderboard__m-LinkContainer__a-Link">
                    Full Leaderboard
                    <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arrow Icon">
                        <path d="M1.70612 0.819317L1.53333 0.654091L1.36055 0.819317L0.827218 1.32933L0.638272 1.51001L0.827218 1.69069L3.57161 4.31506L0.827218 6.93943L0.638272 7.12012L0.827218 7.3008L1.36055 7.81081L1.53333 7.97604L1.70612 7.81081L5.17278 4.49575L5.36173 4.31506L5.17278 4.13438L1.70612 0.819317Z" fill="#151517" stroke="#151517" stroke-width="0.5"></path>
                    </svg>
                </a>
            <div class="adSlot ignoreStyles __m-Tickerspon" data-slot-type="tickerspon" id="tickerspon" data-google-query-id="CIWt6NyW7foCFbH_9QIdBvIPHw"><div id="google_ads_iframe_21849421099/golfdigest/tickerspon/the-loop/article/1_0__container__" style="border: 0pt none; margin: auto; text-align: center;"><iframe id="google_ads_iframe_21849421099/golfdigest/tickerspon/the-loop/article/1_0" name="google_ads_iframe_21849421099/golfdigest/tickerspon/the-loop/article/1_0" title="3rd party ad content" width="150" height="36" scrolling="no" marginwidth="0" marginheight="0" frameborder="0" role="region" aria-label="Advertisement" tabindex="0" style="border: 0px; vertical-align: bottom;" data-load-complete="true" data-google-container-id="1"></iframe></div></div></div>
            </div>
        </div>`
    return template;
}