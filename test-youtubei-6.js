import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    const playlist = await yt.getPlaylist('PLBCF2DAC6FFB574DE');
    const first = playlist.items[0];
    console.log(first.content_id);
    console.log(first.metadata?.title);
    console.log(JSON.stringify(first.metadata, null, 2));
    console.log(JSON.stringify(first.content_image, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
