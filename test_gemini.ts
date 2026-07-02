import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Search for youtube video P08Z_NC8GuY and give me a 5 sentence summary.',
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    console.log(response.text);
  } catch(e: any) {
    console.log("Error:", e.message, e.status);
  }
}
run();
