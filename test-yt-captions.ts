import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    });
    const info = await yt.getInfo('jNQXAC9IVRw'); // Me at the zoo
    const transcriptData = await info.getTranscript();
    console.log("Transcript:", transcriptData?.transcript?.content?.body?.initial_segments.slice(0, 5));
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
