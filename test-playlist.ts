import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    // some random valid playlist id PLBCF2DAC6FFB574DE
    const listId = 'PLBCF2DAC6FFB574DE';
    const playlist = await yt.getPlaylist(listId);
    console.log("Playlist Title:", playlist.info?.title);
    console.log("Items:", playlist.items?.length);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
