import { jsonp, loadScript } from "../../utils/utils.js";
import { bylineTemplate, youtubeEmbedTemplate } from "./templates.js";
import { loadCSS } from "../scripts/scripts.js"

function loadBlock(block, name) {
    import(`${window.hlx.codeBasePath}/blocks/${name}/${name}.js`).then(mod => {
        loadCSS(`${window.hlx.codeBasePath}/blocks/${name}/${name}.css`);
        mod.default(block);
    });
}

function buildBylineBlock(main, metadata) {
    const h1 = main.querySelector('h1');
    const byline = bylineTemplate(metadata);
    const shareBlock = byline.querySelector('.share');
    loadBlock(shareBlock, 'share');
    h1.after(byline);
}

function buildSocialLinkBlocks(main) {
    const links = main.getElementsByTagName('a');
    var isTwitterScriptInserted = false;
    for (let link of links) {
        let url = link.innerHTML;
        if(url.startsWith('https://twitter.com/') || url.startsWith('https://www.twitter.com/')) {
            jsonp(`//publish.twitter.com/oembed?url=${url}&partner=&hide_thread=false`).then((res) => {
                if (res.html) {
                    let el = document.createElement('div');
                    el.innerHTML = res.html;
                    let blockquote = el.getElementsByTagName('blockquote')[0];
                    if (!isTwitterScriptInserted) {
                        loadScript('https://platform.twitter.com/widgets.js');
                        isTwitterScriptInserted = true;
                    }
                    link.replaceWith(blockquote);
                }
            });
        } else if (url.startsWith('https://youtube.com/') || url.startsWith('https://www.youtube.com/')) {
           let el = youtubeEmbedTemplate(url);
           link.replaceWith(el);
        }
    }
}

export default function decorate(main, metadata) {
    buildBylineBlock(main, metadata);
    buildSocialLinkBlocks(main);
}