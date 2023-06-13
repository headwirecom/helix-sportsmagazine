function getRowClassName(field) {
    return field.trim().replace(' ', '-').toLowerCase();
}

function decorateRow(row, container) {
    const field = row.querySelector('div');
    const className = getRowClassName(field.innerHTML);
    row.classList.add(className);
    field.remove();
    if (container && className !== 'image') {
        container.append(row);
    }
}

export default function decorate(block) {
    const isListicle = document.body.classList.contains('gallery-listicle-template');
    if (isListicle) {
        block.classList.add('listicle');
        block.querySelectorAll(':scope > div').forEach((row) => decorateRow(row));
    } else {
        block.classList.add('carousel');
    }
}