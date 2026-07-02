import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    const playlist = await yt.getPlaylist('https://www.youtube.com/playlist?list=PLBCF2DAC6FFB574DE');
    console.log(playlist.items.length);
  } catch (e) {
    console.error(e);
  }
}
test();
