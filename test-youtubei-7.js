import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    const playlist = await yt.getPlaylist('PLBCF2DAC6FFB574DE');
    
    console.log(playlist.items.map(first => ({
        id: first.content_id,
        title: first.title?.text || first.title?.toString(),
        thumbnail: first.thumbnails?.[0]?.url || first.content_image?.image?.[0]?.url,
        url: `https://youtube.com/watch?v=${first.content_id}`
    })));
  } catch (e) {
    console.error(e);
  }
}
test();
