const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({apiKey: "mock"});
const sharedResponseSchema = {
  type: Type.OBJECT,
  properties: {
    executive_summary: { type: Type.STRING },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          chapter_title: { type: Type.STRING },
          detailed_notes: { type: Type.STRING },
          code_snippets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING },
                code: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["language", "code", "explanation"]
            }
          }
        },
        required: ["chapter_title", "detailed_notes", "code_snippets"]
      }
    },
    recap: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { front: { type: Type.STRING }, back: { type: Type.STRING } },
        required: ["front", "back"]
      }
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correct_index: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correct_index", "explanation"]
      }
    },
    problems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          statement: { type: Type.STRING },
          hints: { type: Type.ARRAY, items: { type: Type.STRING } },
          solution_approach: { type: Type.STRING }
        },
        required: ["title", "statement", "hints", "solution_approach"]
      }
    }
  },
  required: ["executive_summary", "sections", "recap", "flashcards", "quiz", "problems"]
};

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: [{ role: 'user', parts: [{ text: 'Hello, explain computers in JSON format' }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: sharedResponseSchema
      }
    });
    console.log("SUCCESS");
  } catch (e) {
    console.error("ERROR", e);
  }
}
run();
