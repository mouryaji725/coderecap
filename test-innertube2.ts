import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true
  });
  const info = await yt.getBasicInfo('jNQXAC9IVRw'); // Me at the zoo
  console.log("Duration:", info.basic_info.duration);
}
run();
