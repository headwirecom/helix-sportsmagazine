export default async function decorate(block) {
  const h3 = block.querySelector('h3');
  block.querySelector('div').prepend(h3);

  if (block.querySelectorAll('a').length > 1) {
    block.classList.add('multiple');
  }
}
