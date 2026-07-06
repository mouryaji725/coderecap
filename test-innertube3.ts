import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true
  });
  const info = await yt.getBasicInfo('jNQXAC9IVRw');
  console.log("Keys:", Object.keys(info.basic_info));
  console.log("Info:", JSON.stringify(info.basic_info, null, 2).slice(0, 500));
}
run();
