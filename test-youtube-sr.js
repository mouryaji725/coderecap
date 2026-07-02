import YouTube from 'youtube-sr';

async function test() {
  try {
    const playlist = await YouTube.default.getPlaylist('https://www.youtube.com/playlist?list=PL731DB18664BDBF03');
    console.log(playlist.title);
    console.log(playlist.videos.length);
  } catch (e) {
    console.error(e);
  }
}
test();
