import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenAI, Type } from '@google/genai';
import multer from 'multer';
import * as _pdfParse from 'pdf-parse';
import { Innertube, UniversalCache } from 'youtubei.js';
import cors from 'cors';

const pdfParse = (_pdfParse as any).default || _pdfParse;

const upload = multer({ dest: os.tmpdir() });
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


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.post('/api/process-video', async (req, res) => {
    try {
      const { url } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Extract video ID
      const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      if (!videoId) {
        return res.status(400).json({ error: "Invalid YouTube URL provided." });
      }

      console.log(`Fetching transcript for video ID: ${videoId}`);
      let transcriptText = '';
      let videoTitle = '';
      let videoAuthor = '';

      try {
        const transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId);
        transcriptText = (transcriptResponse || []).map(t => t.text).join(' ');
      } catch (err: any) {
        const errMsg = err.message || '';
        if (errMsg.includes('disabled') || errMsg.includes('fetch failed') || errMsg.includes('No transcript') || errMsg.includes('too many requests') || errMsg.includes('captcha')) {
          // Info: Transcript disabled or IP blocked, fallback to oEmbed.
          try {
             const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
             if (oembedRes.ok) {
                const oembedData = await oembedRes.json();
                videoTitle = oembedData.title || '';
                videoAuthor = oembedData.author_name || '';
             }
          } catch(e) {
             console.error('Failed to fetch oEmbed data', e);
          }
        } else {
          console.error("Transcript fetch error:", err);
          throw err;
        }
      }

      const instructions = `You are an expert technical note-taker specializing in programming and computer science. 
      Please process the provided YouTube video transcript and generate a comprehensive study guide.
      
      CRITICAL INSTRUCTIONS:
      1. You MUST generate your response as valid JSON adhering to the provided schema.
      2. Provide a well-detailed executive summary for this section.
      3. Provide a thorough chapter breakdown in the sections array.
      4. Extract important code snippets with explanations.
      5. Provide a solid recap.
      6. Generate useful flashcards.
      7. Generate multiple choice questions for the quiz.
      8. Generate a practice problem.`;

      let finalData = {
        executive_summary: "",
        sections: [] as any[],
        recap: [] as string[],
        flashcards: [] as any[],
        quiz: [] as any[],
        problems: [] as any[]
      };

      if (!transcriptText || transcriptText.trim().length === 0) {
        console.log(`Using Gemini to summarize the video URL using its title...`);
        let contextText = `The user wants a summary of this YouTube video: ${url}\n`;
        if (videoTitle) {
           contextText += `\nTitle: ${videoTitle}\nAuthor: ${videoAuthor}\n`;
        }
        contextText += `\nSince captions are disabled, please use your internal knowledge to summarize this video's topic or the video itself and fulfill the following instructions to the best of your ability:\n\n${instructions}`;
        
        let currentModel = 'gemini-2.5-flash';
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: [{ role: 'user', parts: [{ text: contextText }] }],
          config: {
            responseMimeType: 'application/json',
            responseSchema: sharedResponseSchema
          }
        });
        if (response.text) {
           finalData = JSON.parse(response.text);
        }
      } else {
        // Chunk breakdown for very long videos (over ~150k characters)
        const CHUNK_SIZE = 150000; 
        const chunks: string[] = [];
        for (let i = 0; i < transcriptText.length; i += CHUNK_SIZE) {
          chunks.push(transcriptText.substring(i, i + CHUNK_SIZE));
        }
        
        console.log(`Split transcript into ${chunks.length} chunks to avoid token limits.`);
        
        for (let i = 0; i < chunks.length; i++) {
          console.log(`Processing chunk ${i + 1} of ${chunks.length}...`);
          let chunkText = chunks[i];
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ 
              role: 'user', 
              parts: [{ text: `${instructions}\n\nThis is part ${i + 1} of ${chunks.length} of the video transcript:\n\n${chunkText}` }]
            }],
            config: {
              responseMimeType: 'application/json',
              responseSchema: sharedResponseSchema
            }
          });

          if (response.text) {
             const chunkData = JSON.parse(response.text);
             if (i === 0) {
               finalData.executive_summary = chunkData.executive_summary || "";
             } else {
               if (chunkData.executive_summary) finalData.executive_summary += " " + chunkData.executive_summary;
             }
             if (chunkData.sections) finalData.sections.push(...chunkData.sections);
             if (chunkData.recap) finalData.recap.push(...chunkData.recap);
             if (chunkData.flashcards) finalData.flashcards.push(...chunkData.flashcards);
             if (chunkData.quiz) finalData.quiz.push(...chunkData.quiz);
             if (chunkData.problems) finalData.problems.push(...chunkData.problems);
          }
        }
      }

      res.json({ data: finalData, transcript: transcriptText });

    } catch (error: any) {
      let errorMessage = error.message || 'An error occurred during processing.';
      if (error.status === 503) {
        errorMessage = 'The AI model is currently experiencing high demand. Please try again in a few moments.';
        console.error("Error processing video: Model 503 High Demand");
      } else if (error.status === 429) {
        console.error("Error processing video: 429 Rate Limit Exceeded. Returning mock data.");
        return res.json({ 
          data: {
            executive_summary: "This is a mock summary provided because the Gemini API rate limit was exceeded. The video covers fundamental programming concepts.",
            sections: [
              {
                chapter_title: "Introduction",
                detailed_notes: "This section introduces the core concepts of the topic. It covers the basics and sets up the foundation.",
                code_snippets: [
                  { language: "javascript", code: "console.log('Hello, world!');", explanation: "A simple hello world example." }
                ]
              }
            ],
            recap: ["Understood the basics", "Wrote first code"],
            flashcards: [
              { front: "What is this?", back: "A mock flashcard." },
              { front: "Why did you get this?", back: "Because the API rate limit was hit." },
              { front: "What should you do?", back: "Wait a few minutes or upgrade your quota." }
            ],
            quiz: [
              {
                question: "Why are you seeing mock data?",
                options: ["API Rate Limit", "Bug", "Feature", "Magic"],
                correct_index: 0,
                explanation: "The API rate limit was exceeded, so mock data is shown."
              },
              {
                question: "Is this the real video summary?",
                options: ["Yes", "No", "Maybe", "I don't know"],
                correct_index: 1,
                explanation: "This is a mock summary."
              }
            ],
            problems: [
              {
                title: "Practice Exercise",
                statement: "Try writing a simple loop.",
                hints: ["Use a for loop"],
                solution_approach: "Write a standard for loop iterating from 0 to 10."
              }
            ]
          },
          transcript: "Mock transcript due to rate limit."
        });
      } else {
        console.error("Error processing video:", error.message);
      }
      res.status(error.status || 500).json({ error: errorMessage });
    }
  });

  app.post('/api/process-pdf', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      const pdfText = data.text;
      fs.unlinkSync(req.file.path); // Clean up

      const instructions = `You are an expert technical note-taker specializing in programming and computer science. 
      Please process the provided text from a PDF notes document and generate a comprehensive study guide.
      
      CRITICAL INSTRUCTIONS:
      1. You MUST generate your response as valid JSON adhering to the provided schema.
      2. Provide a well-detailed executive summary.
      3. Provide a thorough chapter breakdown in the sections array.
      4. Extract important code snippets with explanations.
      5. Provide a solid recap.
      6. Generate useful flashcards.
      7. Generate multiple choice questions for the quiz.
      8. Generate a practice problem.`;

      console.log(`Generating summary for PDF with Gemini...`);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { 
            role: 'user', 
            parts: [{ 
              text: `${instructions}\n\nRaw Text:\n${pdfText}`
            }] 
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: sharedResponseSchema
        }
      });

      if (!response.text) {
        throw new Error("Failed to generate content from AI");
      }

      let generatedData;
      try {
        generatedData = JSON.parse(response.text);
      } catch (parseError: any) {
        console.error("JSON Parse Error:", parseError.message);
        throw new Error("The AI generated a response that was too long or invalid. Please try a shorter document.");
      }
      res.json({ data: generatedData, transcript: pdfText });

    } catch (error: any) {
      if (error.status === 429) {
        console.error("Error processing PDF: 429 Rate Limit Exceeded. Returning mock data.");
        return res.json({ 
          data: {
            executive_summary: "This is a mock summary provided because the Gemini API rate limit was exceeded. The document covers important concepts.",
            sections: [
              {
                chapter_title: "Document Introduction",
                detailed_notes: "This section introduces the core concepts of the document.",
                code_snippets: []
              }
            ],
            recap: ["Reviewed document concepts"],
            flashcards: [
              { front: "Why are you seeing mock data?", back: "Because the API rate limit was hit." }
            ],
            quiz: [],
            problems: []
          },
          transcript: "Mock transcript due to rate limit."
        });
      } else {
        console.error("Error processing PDF:", error.message);
        res.status(500).json({ error: error.message || 'An error occurred during PDF processing.' });
      }
    }
  });

  app.post('/api/playlist', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Playlist URL required." });
      }

      let listId = url;
      try {
        const urlObj = new URL(url);
        listId = urlObj.searchParams.get('list') || listId;
      } catch (e) {
        // Ignore invalid URLs and try raw input
      }

      const yt = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true
      });
      const playlist = await yt.getPlaylist(listId);

      const items = (playlist.items || []).map((item: any) => {
        const id = item.id || item.content_id || item.videoId;
        return {
          id: id,
          title: item.title?.text || item.title?.toString() || item.metadata?.title?.text || 'Unknown Title',
          url: `https://youtube.com/watch?v=${id}`,
          thumbnail: item.thumbnails?.[0]?.url || item.content_image?.image?.[0]?.url || ''
        };
      });

      res.json({ title: playlist.info?.title || 'YouTube Playlist', items });
    } catch (error: any) {
      console.error("Error fetching playlist:", error.message);
      res.status(500).json({ error: "Playlist fetching is currently unavailable due to YouTube restrictions. Please process videos individually." });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { message, context, history = [] } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });

      let systemPrompt = `You are AI Moe, a helpful and deeply knowledgeable coding assistant. 
              Here is the context of a video or notes the user just processed, including its summary, notes, and code snippets:
              
              ${JSON.stringify(context)}
              
              Please answer the user's question clearly and accurately, drawing from the provided context. If the context does not have the exact answer, use your expert programming knowledge to help them understand the concept related to their question. Format your response cleanly using Markdown.`;
              
      let chatContents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to answer questions based on the context.' }] }
      ];
      
      for (const msg of history) {
        chatContents.push({
           role: msg.role === 'user' ? 'user' : 'model',
           parts: [{ text: msg.text }]
        });
      }
      
      chatContents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: chatContents
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      if (error.status === 429) {
        console.error("Error in chat: 429 Rate Limit Exceeded.");
        return res.json({ reply: "I'm currently experiencing high traffic and hit my rate limit. Please try again in a few moments!" });
      }
      console.error("Error in chat:", error.message);
      res.status(500).json({ error: error.message || 'Failed to get chat response.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
