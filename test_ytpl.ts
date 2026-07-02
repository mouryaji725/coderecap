import { Innertube } from 'youtubei.js';

async function run() {
  const yt = await Innertube.create();
  try {
    const playlist = await yt.getPlaylist('PL4cUxeGgUsbi1wzuQ1Ecm14R0930t0lY1');
    console.log("Success", playlist.info.title, playlist.items.length);
  } catch(e) {
    console.log("Error", e);
  }
}
run();
