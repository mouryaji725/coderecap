import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true
  });
  
  try {
    console.log("Getting info...");
    const info = await yt.getInfo('P08Z_NC8GuY');
    console.log("Getting transcript...");
    const transcriptData = await info.getTranscript();
    console.log("Transcript fetched!");
    console.log(transcriptData.transcript.content.body.initial_segments.slice(0, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
