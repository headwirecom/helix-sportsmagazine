function getRowClassName(field) {
    return field.trim().replace(' ', '-').toLowerCase();
}

function decorateRow(row) {
    const field = row.querySelector('div');
    const className = getRowClassName(field.innerHTML);
    row.classList.add(className);
    field.remove();
}

export default function decorate(block) {
    block.classList.add('gallery-slide');
    block.querySelectorAll(':scope > div').forEach(row => decorateRow(row));
}