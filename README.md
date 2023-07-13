# Golf Digest Frenklin Migration POC V2

This project is based on [helix-project-boilerplate](https://github.com/adobe/helix-project-boilerplate) template project. The content mountpoint in the `fstab.yaml` points to [helix-sportsmagazine-content](https://drive.google.com/drive/folders/1HyaaV7_cFS4O0wglrHm2Zk2KChUOz4S2) on Google Drive.

## Environments

Preview: https://v2--helix-sportsmagazine--headwirecom.hlx.page

Examples:
- https://v2--helix-sportsmagazine--headwirecom.hlx.page/import-test/play/equipment/apparel/_default/gallery/2020/7/golf-shoes-womens-on-sale-noblocks
- https://v2--helix-sportsmagazine--headwirecom.hlx.page/import-test/play/equipment/apparel/gallery/2017/3/best-mens-golf-shoes-2017-noblocks
- https://v2--helix-sportsmagazine--headwirecom.hlx.page/import-test/play/instruction/approach-shots/article/2018/1/get-control-over-your-wedges-like-jason-day

Live: https://v2--helix-sportsmagazine--headwirecom.hlx.live

## Installation

```sh
npm i
```

## Tests

```sh
npm tst
```

## Local development

To start development:
1. Clone this project and checkout `v2` branch.
1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
1. Start Helix Pages Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)

## Test Content

The last imported content is located on Google Drive in [helix-sportsmagazine-content/import-test](https://drive.google.com/drive/folders/1BtlO0IjY0-gJOoGzEuCt9vM-5pZsONsn) folder.

## Content Importer

The [Franklin Importer - UI](https://github.com/adobe/helix-importer-ui) was used to import test content from https://www.golfdigest.com/.

1. Start the importer from `{repo}/import` directory: `hlx import --cache .cache/` (opens http://localhost:3001/tools/importer/helix-importer-ui/index.html in the browser.)
2. Transformation file URL is http://localhost:3001/tools/importer/import.js

## Content Compare

To access content compare tool go to http://localhost:3001/tools/importer/import-compare.html.
The original content is displayed in the left and imported content in the right frame.

There are several ways to view content:
1. Loaded from JSON files `{repo}/import/tools/importer/gallery-urls.json` or `{repo}/import/tools/importer/article-urls.json` if Page Type is Gallery or Article. Use Previous and Next buttons to compare these predefined pages. This is the default.
2. Manually enter a list for URLs. Change Page Type to 'Manual Enrtry', enter a list of golfdigest.com URLs and click Submit. Use Previous and Next buttons.
3. Change the URL in the left frame and press Enter of click '>' to view a specific page.
4. Pass original Golfdigest URL as hash parameter to the compare tool. Example: http://localhost:3001/tools/importer/import-compare.html#https://www.golfdigest.com/gallery/samwoods
5. To open the compare tool from any golfdigest.com page create a [Bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet) with the following code as URL: ```javascript:window.open(\`http\:\/\/localhost:3001/tools/importer/import-compare.html#https\:\/\/www.golfdigest.com${window.location.pathname}\`);```

The compare tool supports both long form AEM URLs and their shortened versions.

## Sitemap

To list URLs from https://www.golfdigest.com/ (with Franklin importer running) go to http://localhost:3001/tools/importer/sitemap.html
Click Start to list all URLs. You can enter a list of root paths in `Root URLs to import`. For example `/products/` will list only product pages under https://www.golfdigest.com/products/.

This can be used to get a list of pages to import vi [Franklin Importer - UI](https://github.com/adobe/helix-importer-ui).

Checking `Update Importer` will cause URLs in `Import - Bulk` page of the Importer to be updated with the list of URLs from the Sitemap. Open or refresh http://localhost:3001/tools/importer/helix-importer-ui/index.html and click on `Import - Bulk`.
