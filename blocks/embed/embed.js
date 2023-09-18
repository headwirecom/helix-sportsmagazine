/*
 * Embed Block
 * Show videos and social posts directly on your page
 * https://www.hlx.live/developer/block-collection/embed
 */

const CEROS_HOST = 'view.ceros.com';

const loadScript = (url, callback, type) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) {
    script.setAttribute('type', type);
  }
  script.onload = callback;
  head.append(script);
  return script;
};

const getDefaultEmbed = (url) => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
      scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
  </div>`;

const embedCeros = (url) => {
  const heightOverride = url.searchParams.get('heightOverride');

  // height override is used the privacy and cookies page.
  const conditionalStyles = heightOverride ? `max-height: ${Number(heightOverride)}px; max-width: 900px; aspect-ratio: ${900 / Number(heightOverride)};` : 'height: 0; padding-bottom: 56.25%; ';

  return `<div style="left: 0; width: 100%; position: relative; ${conditionalStyles}">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
      scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
  </div>`;
};

const embedInstagram = (url) => {
  url.pathname = `/${url.pathname.split('/').filter((s) => s).join('/')}/embed`;

  return `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
      scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
  </div>`;
};

const embedYoutube = (url, autoplay) => {
  let youtubeUrl = new URL(url.href);
  let params = youtubeUrl.searchParams;
  if (autoplay) {
    params.set('muted', '1');
    params.set('autoplay', '1');
  }
  if (url.origin.includes('youtu.be')) {
    const [, vid] = url.pathname.split('/');
    youtubeUrl = new URL(`https://www.youtube.com/embed/${vid}`);
    params = youtubeUrl.searchParams;
    params.set('rel', '0'); // Set rel=0 to prevent showing related videos
    params.set('v', vid); // Set the video ID for the embedded video
    if (autoplay) {
      params.set('muted', '1');
      params.set('autoplay', '1');
    }
  }
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${youtubeUrl.toString()}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
  return embedHTML;
};

const embedVimeo = (url, autoplay) => {
  const vimeoURL = new URL(`https://player.vimeo.com/video${url.pathname}`);
  const params = vimeoURL.searchParams;
  if (autoplay) {
    params.set('muted', '1');
    params.set('autoplay', '1');
  }
  vimeoURL.search = params.toString();
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${vimeoURL.toString()}" 
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen  
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
  return embedHTML;
};

const embedBrightcove = (url, autoplay) => {
  const brightcoveUrl = new URL(url.href);
  const params = brightcoveUrl.searchParams;
  if (autoplay) {
    params.set('muted', '1');
    params.set('autoplay', '1');
  }
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${brightcoveUrl.toString()}" 
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      allowfullscreen="" scrolling="no" title="Content from Brightcove" loading="lazy"></iframe>
    </div>`;
  return embedHTML;
};

const embedTwitter = (url) => {
  const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
  loadScript('https://platform.twitter.com/widgets.js');
  return embedHTML;
};

const loadEmbed = (block, link, autoplay) => {
  console.log('\x1b[31m ~ link:', link);
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const EMBEDS_CONFIG = [
    {
      match: ['youtube', 'youtu.be'],
      embed: embedYoutube,
    },
    {
      match: ['vimeo'],
      embed: embedVimeo,
    },
    {
      match: ['twitter'],
      embed: embedTwitter,
    },
    {
      match: ['instagram'],
      embed: embedInstagram,
    },
    {
      match: ['players.brightcove.net'],
      embed: embedBrightcove,
    },
    {
      match: [CEROS_HOST],
      embed: embedCeros,
    },
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);

  const isCerosEmbed = url.host === CEROS_HOST;

  if (config) {
    const embedHtml = config.embed(url, autoplay);

    // when a ceros embed has a placeholder, place it inside for the swapping functionality.
    const placeholderWrapper = block.querySelector('.embed-placeholder');
    if (isCerosEmbed && placeholderWrapper) {
      placeholderWrapper.insertAdjacentHTML('afterbegin', embedHtml);
    } else {
      block.innerHTML = embedHtml;
    }

    block.classList = `block embed embed-${config.match[0]}`;
  } else {
    block.innerHTML = getDefaultEmbed(url);
    block.classList = 'block embed';
  }

  // ceros embed placeholders are shown for 2 extra seconds while iframe is loading
  if (isCerosEmbed) {
    block.classList.add('ceros-loading');
    const iframe = block.querySelector('iframe');
    iframe.addEventListener('load', () => {
      setTimeout(() => {
        block.classList.add('embed-is-loaded');
      }, 2000);
    });
  } else {
    block.classList.add('embed-is-loaded');
  }
};

export default function decorate(block) {
  const autoplay = block.classList.contains('autoplay') || !!block.closest('.autoplay.block');
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a').href;
  block.dataset.embedLink = link;
  block.textContent = '';

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-placeholder';
    wrapper.innerHTML = '<div class="embed-placeholder-play"><button title="Play"></button></div>';
    wrapper.prepend(placeholder);
    block.append(wrapper);

    // add click listener to wrapper if it isn't a ceros embed
    if (!link.includes(CEROS_HOST)) {
      wrapper.addEventListener('click', () => {
        loadEmbed(block, link, autoplay);
      });
      return;
    }

    // hide play button on ceros embed
    wrapper.classList.add('hide-play-button');
  }

  // load embeds without a placeholder (& always ceros embeds) on first scroll
  const triggerEmbedLoad = (event) => {
    if (event && window.scrollY < 1) {
      return;
    }
    loadEmbed(block, link, autoplay);
    window.removeEventListener('scroll', triggerEmbedLoad);
  };
  window.addEventListener('scroll', triggerEmbedLoad);
}
