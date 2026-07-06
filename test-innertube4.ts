import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true
  });
  const info = await yt.getBasicInfo('jNQXAC9IVRw');
  console.log("Keys:", Object.keys(info));
  // Does it have something else?
}
run();
