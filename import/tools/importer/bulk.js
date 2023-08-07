let [$urls, $operation, submit, log] = [...document.querySelectorAll('.id')];

/* eslint-disable no-console */
console.log(log);

const append = (string) => {
  if (log) {
    const p = document.createElement('p');
    p.innerHTML = string;
    log.append(p);
  }
  /* eslint-disable no-console */
  console.log(string);
};

const updateCounter = (count, length) => {
  if (log && log.updateCounter) {
    log.updateCounter(count, length);
  }
};

const bulk = async (urls, operation, logger, apiMethod = 'POST', startCount = 0) => {
  if (logger) {
    log = logger;
  }

  let counter = startCount;

  const logIndexResponse = (path, text) => {
    const json = JSON.parse(text);
    const indeces = json.results;
    let logTxt = `${counter}/${total}: ${path}`;
    indeces.forEach((index) => {
      if (index.record) {
        let indexRecord = JSON.stringify(index.record);
        logTxt = logTxt + `<br/> Index name "${index.name}": ${indexRecord}`;
      }
    });
    append(logTxt);
  }

  const logStatusResponse = (path, text) => {
    const json = JSON.parse(text);
    let statusTxt = '{ ';
    for (let key of Object.keys(json)) {
      if (json[key].status && key !== 'links') {
        statusTxt = statusTxt + `${key} status: ${json[key].status} `;
      }
    }
    statusTxt = statusTxt + '}';
    append(`${counter}/${total}: ${path} ${statusTxt}`);
  };

  const executeOperation = async (url) => {
    const { hostname, pathname } = new URL(url);
    const [branch, repo, owner] = hostname.split('.')[0].split('--');
    const adminURL = `https://admin.hlx.page/${operation}/${owner}/${repo}/${branch}${pathname}`;
    const resp = await fetch(adminURL, {
      method: apiMethod,
    });
    counter += 1;
    updateCounter(counter,total);
    const text = await resp.text();
    /* eslint-disable no-console */
    console.log(adminURL);
    console.log(text);
    if (resp.ok) {
      if (operation === 'index') {
        logIndexResponse(url, text);
      } else {
        logStatusResponse(url, text);
      }
    } else {
      append(`${counter}/${total}: FAILED ${operation} ${apiMethod} ${adminURL}: ${text}`);
    }
  };

  const dequeue = async () => {
    while (urls.length) {
      const url = urls.shift();
      try {
        await executeOperation(url);
      } catch (e) {
        console.error(e);
        append(`${counter}/${total}: FAILED ${url}`);
      }
    }
  };

  const concurrency = operation === 'live' ? 40 : 5;
  const total = urls.length + startCount;
  append(`URLs: ${urls.length}`);
  for (let i = 0; i < concurrency; i += 1) {
    dequeue();
  }
};

submit.addEventListener(('click'), () => {
  const operation = $operation.value;
  const urls = $urls.value.split('\n').map((e) => e.trim());
  bulk(urls, operation);
});
