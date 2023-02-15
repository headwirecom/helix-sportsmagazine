import { createTag } from "../../utils/utils.js";

function getRowClassName(field) {
    return field.trim().replace(' ', '-').toLowerCase();
}

function getOrCreatePriceWrapper(textContainer) {
    let el = textContainer.querySelector('.price-wrapper');
    if (!el) {
        el = createTag('div', {class:'price-wrapper'});
        textContainer.append(el);
    }
    return el;
}
function decorateRow(row, container, textContainer, mediaContainer) {
    const field = row.querySelector('div');
    const className = getRowClassName(field.innerHTML);
    field.remove();
    if (className === 'title') {
        let titleEl = createTag('h1', {class:'productTitle'}, row.querySelector('div').innerHTML);
        row.replaceWith(titleEl);
        textContainer.append(titleEl);
        row.remove();
    } else if (className === 'price') {
        let priceWrapper = getOrCreatePriceWrapper(textContainer);
        let priceEl = createTag('span', {class:'price'}, row.querySelector('div').innerHTML);
        priceWrapper.append(createTag('span', {class:'price'}, row.querySelector('div').innerHTML));
        priceWrapper.append(createTag('span', {class:'separator'}, '|'));
        row.remove();
    } else if(className === 'advertiser') {
        let priceWrapper = getOrCreatePriceWrapper(textContainer);
        priceWrapper.append(createTag('span', {class:className}, row.querySelector('div').innerHTML));
        row.remove();
    } else if(className === 'image') {
        mediaContainer.append(row.querySelector('picture'));
        row.remove();
    } else {
        row.classList.add(className);
        textContainer.append(row)
    }
}

export default function decorate(block) {
    const textContainer = createTag('div', {class: 'text-container'});
    const mediaContainer = createTag('div', {class: 'media-container'});
    block.querySelectorAll(':scope > div').forEach(row => { 
        decorateRow(row, block, textContainer, mediaContainer);
    });
    block.append(textContainer);
    block.append(mediaContainer);
}