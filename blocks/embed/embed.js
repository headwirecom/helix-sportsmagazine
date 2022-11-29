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
  
  const getDefaultEmbed = (url) => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
        scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;
  
  const embedYoutube = (url) => {
    const usp = new URLSearchParams(url.search);
    let vid = encodeURIComponent(usp.get('v'));
    const embed = url.pathname;
    if (url.origin.includes('youtu.be')) {
      [, vid] = url.pathname.split('/');
    }
    const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="https://www.youtube.com${(vid && vid !== 'null') ? `/embed/${vid}?rel=0&amp;v=${vid}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
      </div>`;
    return embedHTML;
  };
  
  const embedVimeo = (url) => {
    const [, video] = url.pathname.split('/');
    const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="https://player.vimeo.com/video/${video}" 
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
        frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen  
        title="Content from Vimeo" loading="lazy"></iframe>
      </div>`;
    return embedHTML;
  };
  
  const embedTwitter = (url) => {
    const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
    loadScript('https://platform.twitter.com/widgets.js');
    return embedHTML;
  };
  
  const loadEmbed = (block, link) => {
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
    ];
  
    const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
    const url = new URL(link);
    if (config) {
      setTimeout(() => {
        block.innerHTML = config.embed(url);
        block.classList = `block embed embed-${config.match[0]}`;
      }, 3000);
    } else {
      block.innerHTML = getDefaultEmbed(url);
      block.classList = 'block embed';
    }
    block.classList.add('embed-is-loaded');
  };
  
  export default function decorate(block) {
    const link = block.querySelector('a').href;
    block.textContent = '';
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, link);
      }
    });
    observer.observe(block);
  }  