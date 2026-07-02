import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    
    let listId = 'https://www.youtube.com/playlist?list=PLBCF2DAC6FFB574DE';
    try {
      const urlObj = new URL(listId);
      listId = urlObj.searchParams.get('list') || listId;
    } catch(e) {}
    
    const playlist = await yt.getPlaylist(listId);
    console.log(playlist.info.title, playlist.items.length);
  } catch (e) {
    console.error(e);
  }
}
test();
