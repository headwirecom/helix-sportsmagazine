function decorateMain(main) {
  console.log('dacorate template');
}

export default function decorate(main, template) {
  if (template) {
    const articleBody = template.querySelector('.article-body');
    main.querySelectorAll('.section').forEach((section) => { articleBody.append(section); });
    main.replaceWith(template.querySelector('main'));
    decorateMain(template.querySelector('main'));
  }
}
