/*
 * Embed Block
 * Show videos and social posts directly on your page
 * https://www.hlx.live/developer/block-collection/embed
 */

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

const getDefaultEmbed = (
  url,
) => `
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
      scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
`;

const embedInstagram = (url) => {
  url.pathname = `/${url.pathname
    .split('/')
    .filter((s) => s)
    .join('/')}/embed`;

  return `
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
      scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
`;
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
  const embedHTML = `
      <iframe src="${youtubeUrl.toString()}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
`;
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
  const embedHTML = `
      <iframe src="${vimeoURL.toString()}" 
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen  
      title="Content from Vimeo" loading="lazy"></iframe>
`;
  return embedHTML;
};

const embedBrightcove = (url, autoplay) => {
  const brightcoveUrl = new URL(url.href);
  const params = brightcoveUrl.searchParams;
  if (autoplay) {
    params.set('muted', '1');
    params.set('autoplay', '1');
  }
  const embedHTML = `
      <iframe src="${brightcoveUrl.toString()}" 
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      allowfullscreen="" scrolling="no" title="Content from Brightcove" loading="lazy"></iframe>
`;
  return embedHTML;
};

const embedTwitter = (url) => {
  const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
  loadScript('https://platform.twitter.com/widgets.js');
  return embedHTML;
};

const loadEmbed = (block, link, autoplay) => {
  if (block.classList.contains('embed-is-loaded') || block.classList.contains('embed-is-loading')) {
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
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);
  if (config) {
    block.insertAdjacentHTML('beforeend', config.embed(url, autoplay))
    block.classList = `block embed embed-${config.match[0]}`;
  } else {
    block.insertAdjacentHTML('beforeend', getDefaultEmbed(url));
    block.classList = 'block embed';
  }
  block.classList.add('embed-is-loading');
  const iframe = block.querySelector('iframe')
  iframe.addEventListener('load', () => {
    console.log("\x1b[34m ~ TEST:", )
    block.classList.add('embed-is-loaded')
  })
};

export default function decorate(block) {
  const autoplay = block.classList.contains('autoplay') || !!block.closest('.autoplay.block');
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a').href;
  block.dataset.embedLink = link;
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'embed-placeholder';

  if (placeholder) {
    // wrapper.innerHTML = '<div class="embed-placeholder-play"><button title="Play"></button></div>';
    wrapper.prepend(placeholder);
  }

  block.append(wrapper);

  const triggerEmbedLoad = (event) => {
    if (event && window.scrollY < 1) {
      return;
    }
    loadEmbed(block, link, autoplay);
    window.removeEventListener('scroll', triggerEmbedLoad);
  };
  window.addEventListener('scroll', triggerEmbedLoad);
}
