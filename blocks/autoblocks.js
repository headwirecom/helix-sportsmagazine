import { createTag, createTagFromString } from "../../utils/utils.js";
import { bylineTemplate } from "./templates.js";

function decorateShareBlock(block) {
    import('./share/share.js').then(mod => {
        mod.default(block);
    });
}

function buildBylineBlock(main, metadata) {
    const h1 = main.querySelector('h1');
    const bylineHTML = bylineTemplate(metadata);
    const byline = createTagFromString(bylineHTML);
    const shareBlock = byline.querySelector('.share');
    decorateShareBlock(shareBlock);
    h1.after(byline);
}

export default function decorate(main, metadata) {
    buildBylineBlock(main, metadata);
}