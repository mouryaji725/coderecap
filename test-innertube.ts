import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    const info = await yt.getBasicInfo('1v_4wLSkM_8');
    console.log("Title:", info.basic_info.title);
    console.log("Duration:", info.basic_info.duration);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
