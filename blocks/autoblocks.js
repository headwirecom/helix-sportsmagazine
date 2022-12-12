import { bylineTemplate, shareTemplate } from "./templates.js";
import { loadCSS } from "../scripts/scripts.js"

function loadBlock(block, name) {
    import(`${window.hlx.codeBasePath}/blocks/${name}/${name}.js`).then(mod => {
        loadCSS(`${window.hlx.codeBasePath}/blocks/${name}/${name}.css`);
        mod.default(block);
    });
}

function buildRubric(main, metadata) {
    const rubricText = metadata.rubric;
    if (rubricText) {
        const h1 = main.querySelector('h1');
        const rubric = `<span>${rubricText}</span>`;
        const el = document.createElement('p');
        el.setAttribute('class', 'a-Rubric');
        el.innerHTML = rubric;
        h1.before(el);
    }
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

function buildShareBlock(main) {
    const defaultContent = main.querySelector('.default-content-wrapper');
    const shareBlock = shareTemplate();
    defaultContent.append(shareBlock);
    loadBlock(shareBlock, 'share');
}

export default function decorate(main, metadata) {
    buildRubric(main, metadata);
    buildBylineBlock(main, metadata);
    buildEmbedBlocks(main);
    buildShareBlock(main);
}