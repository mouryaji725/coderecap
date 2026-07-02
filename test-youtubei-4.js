import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    const playlist = await yt.getPlaylist('PLBCF2DAC6FFB574DE');
    const first = playlist.items[0];
    console.log({
      id: first.id || first.video_id || first.content_id || first.videoId,
      title: first.title?.text || first.title?.toString(),
      thumbnail: first.thumbnails?.[0]?.url || first.thumbnail?.sources?.[0]?.url || first.thumbnail?.[0]?.url
    });
  } catch (e) {
    console.error(e);
  }
}
test();
