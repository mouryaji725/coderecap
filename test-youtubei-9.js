import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    const playlist = await yt.getPlaylist('PLBCF2DAC6FFB574DE');
    
    console.log(playlist.items.map(item => ({
        id: item.id || item.content_id || item.videoId,
        title: item.title?.text || item.title?.toString() || item.metadata?.title?.text,
        thumbnail: item.thumbnails?.[0]?.url || item.content_image?.image?.[0]?.url,
        url: `https://youtube.com/watch?v=${item.id || item.content_id || item.videoId}`
    })));
  } catch (e) {
    console.error(e);
  }
}
test();
