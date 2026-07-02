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
      id: first.id,
      title: first.title.text,
      url: `https://youtube.com/watch?v=${first.id}`,
      thumbnail: first.thumbnails?.[0]?.url
    });
  } catch (e) {
    console.error(e);
  }
}
test();
