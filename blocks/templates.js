export function bylineTemplate(data) {
    return `<div class="o-ArticleByline">
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
                    <span style="display: none" class="clicktracking" data-resource-type="/apps/golfdigestcom/components/article/publishDate"></span>
                    <div class="o-AssetPublishDate">${data.publication_date}</div>
                </div>
                <div class="share block">
                    <div class="socialSharing">
                        <span style="display: none" class="clicktracking" data-resource-type="/apps/golfdigestcom/components/general/socialSharing"></span>
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
}