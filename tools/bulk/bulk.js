let [$urls, $operation, submit, log] = [...document.querySelectorAll('.id')];

/* eslint-disable no-console */
console.log(log);

const append = (string) => {
  if (log) {
    const p = document.createElement('p');
    p.textContent = string;
    log.append(p);
  }
  /* eslint-disable no-console */
  console.log(string);
};

const bulk = async (urls, operation, logger) => {
  if (logger) {
    log = logger;
  }

  let counter = 0;

  const executeOperation = async (url) => {
    const { hostname, pathname } = new URL(url);
    const [branch, repo, owner] = hostname.split('.')[0].split('--');
    const adminURL = `https://admin.hlx.page/${operation}/${owner}/${repo}/${branch}${pathname}`;
    const resp = await fetch(adminURL, {
      method: 'POST',
    });
    const text = await resp.text();
    /* eslint-disable no-console */
    console.log(text);
    counter += 1;
    append(`${counter}/${total}: ${adminURL}`);
  };

  const dequeue = async () => {
    while (urls.length) {
      const url = urls.shift();
      await executeOperation(url);
    }
  };

  const concurrency = operation === 'live' ? 40 : 5;
  const total = urls.length;
  append(`${operation} URLs: ${urls.length}`);
  for (let i = 0; i < concurrency; i += 1) {
    dequeue();
  }
};

submit.addEventListener(('click'), () => {
  const operation = $operation.value;
  const urls = $urls.value.split('\n').map((e) => e.trim());
  bulk(urls, operation);
});
