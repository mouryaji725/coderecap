import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const testModel = async (m: string) => {
    try {
      const response = await ai.models.generateContent({
        model: m,
        contents: 'hello'
      });
      console.log(`${m} works`, response.text);
    } catch(e) {
      console.log(`${m} failed with:`, (e as any).message);
    }
  };
  await testModel('gemini-1.5-flash-8b');
  await testModel('gemini-2.0-flash-exp');
  await testModel('gemini-2.5-flash');
}
run();
