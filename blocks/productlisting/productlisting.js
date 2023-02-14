import { createTag } from "../../utils/utils.js";

function getRowClassName(field) {
    return field.trim().replace(' ', '-').toLowerCase();
}

function decorateRow(row, container) {
    const field = row.querySelector('div');
    const className = getRowClassName(field.innerHTML);
    field.remove();
    if (className === 'title') {
        let titleEl = createTag('h1', {class:'productTitle'}, row.querySelector('div').innerHTML);
        row.replaceWith(titleEl);
    } else if (className === 'price') {
        row.classList.add('price-wrapper');
        let priceEl = createTag('span', {class:'price'}, row.querySelector('div').innerHTML);
        row.querySelector('div').replaceWith(priceEl);
        row.append(createTag('span', {class:'separator'}, '|'));
    } else if(className === 'advertiser') {
        container.querySelector('.price-wrapper').append(createTag('span', {class:className}, row.querySelector('div').innerHTML));
        row.remove();
    } else {
        row.classList.add(className);
    }
}

export default function decorate(block) {
    block.querySelectorAll(':scope > div').forEach(row => { 
        if (!row.classList.contains('slide-info')) {
            decorateRow(row, block);
        }
    });
}