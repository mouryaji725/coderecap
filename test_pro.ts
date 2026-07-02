import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: 'hello'
    });
    console.log("1.5-pro works", response.text);
  } catch(e) {
    console.log(e);
  }
}
run();
