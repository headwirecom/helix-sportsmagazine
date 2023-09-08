export default async function bulkImport({ fetch, name, offset, limit }) {
  const origin = 'https://gd.headwire.workers.dev';
  const reqIndex = await fetch(`${origin}/${name}-query-index.json?sheet=latest&offset=${offset}&limit=${limit}`);

  if (!reqIndex.ok) {
    console.log(`${reqIndex.status}: ${reqIndex.text()}`);
    return;
  }

  const { data } = reqIndex.json();
  for (const { path } of data) {
    // eslint-disable-next-line no-await-in-loop
    const reqImport = await fetch(`${origin}/webhook`, {
      method: 'POST',
      body: `${path}.md`,
      headers: {
        Authorization: `Bearer ${process.env.GD_TOKEN}`,
      },
    });

    if (!reqImport.ok) {
      console.log(`${reqImport.status}: ${reqImport.text()}`);
      break;
    }

    console.log(`Imported ${path} successfully!`);
  }
}
