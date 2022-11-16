import { bylineTemplate } from "./templates.js";
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

function buildEmbedBlocks(main) {
    const EMBEDS = ['youtube', 'twitter'];
    const links = main.getElementsByTagName('a');
    for (let link of links) {
        let url = link.innerHTML;
        if (EMBEDS.some(match => url.includes(match))) {
            loadBlock(link.parentElement, 'embed');
        }
    }
}

export default function decorate(main, metadata) {
    buildBylineBlock(main, metadata);
    buildEmbedBlocks(main);
}