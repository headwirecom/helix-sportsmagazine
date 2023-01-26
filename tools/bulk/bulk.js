const [$urls, $operation, submit, log] = [...document.querySelectorAll('.id')];

console.log(log);

const append = (string) => { 
  const p = document.createElement('p'); 
  p.textContent = string; 
  log.append(p);
}


submit.addEventListener(('click'), () => {
  let counter = 0;

  const executeOperation = async (url) => {
    const { hostname, pathname } = new URL(url);
    const [branch, repo, owner] = hostname.split('.')[0].split('--');
    const adminURL = `https://admin.hlx.page/${operation}/${owner}/${repo}/${branch}${pathname}`;
    const resp = await fetch(adminURL, {
        method: 'POST',
    }); 
    const text = await resp.text();
    console.log(text);
    counter += 1;
    append(`${counter}/${total}: ${adminURL}`);
  }

  const dequeue = async () => {
    while (urls.length) {
      const url = urls.shift();
      await executeOperation(url);    
    }
  };
  
  const operation = $operation.value;
  const concurrency = operation === 'live' ? 40 : 5;
  const urls = $urls.value.split('\n').map(e => e.trim());
  const total = urls.length;
  append(`URLs: ${urls.length}`);
  for (let i = 0; i < concurrency; i += 1) {
    dequeue();
  }
});