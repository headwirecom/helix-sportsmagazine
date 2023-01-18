let blockCount = 0;

function getRowClassName(field) {
    return field.trim().replace(' ', '-').toLowerCase();
}

function decorateRow(row) {
    const field = row.querySelector('div');
    const className = getRowClassName(field.innerHTML);
    row.classList.add(className);
    field.remove();
/*
    if (className === 'promo-headline') {
        let div = row.querySelector('div');
        let content = div.innerHTML;
        content = `${blockCount} ${content}`;
        div.innerHTML = content;
    }*/
}

export default function decorate(block) {
    blockCount++;
    console.log('block count = ' + blockCount);
    block.classList.add('gallery-slide');
    block.querySelectorAll(':scope > div').forEach(row => decorateRow(row));
}