import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    const playlist = await yt.getPlaylist('PLBCF2DAC6FFB574DE');
    const first = playlist.items[0];
    console.log(Object.keys(first));
    console.log(first.id, first.title, first.thumbnails);
  } catch (e) {
    console.error(e);
  }
}
test();
