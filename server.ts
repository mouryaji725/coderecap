import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenAI, Type } from '@google/genai';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { Innertube, UniversalCache } from 'youtubei.js';
import cors from 'cors';


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
          level: { type: Type.STRING },
          statement: { type: Type.STRING },
          hints: { type: Type.ARRAY, items: { type: Type.STRING } },
          solution_approach: { type: Type.STRING },
          leetcode_similar_problem: { type: Type.STRING }
        },
        required: ["title", "level", "statement", "hints", "solution_approach", "leetcode_similar_problem"]
      }
    }
  },
  required: ["executive_summary", "sections", "recap", "flashcards", "quiz", "problems"]
};


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes

  app.post('/api/video-info', async (req, res) => {
    try {
      const { url } = req.body;
      const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      if (!videoId) {
        return res.status(400).json({ error: "Invalid YouTube URL provided." });
      }

      let videoTitle = 'YouTube Video';
      let durationMs = 0;
      try {
         const yt = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true
         });
         const info = await yt.getBasicInfo(videoId);
         videoTitle = info.basic_info.title || videoTitle;
         durationMs = (info.basic_info.duration || 0) * 1000;
      } catch (err: any) {
         console.error("Error fetching video info via Innertube:", err.message);
         // Fallback
         try {
            const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
            if (oembedRes.ok) {
               const oembedData = await oembedRes.json();
               videoTitle = oembedData.title || videoTitle;
            }
         } catch(e) {}
         
         try {
            const transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId);
            if (transcriptResponse && transcriptResponse.length > 0) {
               const last = transcriptResponse[transcriptResponse.length - 1];
               durationMs = last.offset + last.duration;
            }
         } catch (e: any) {}
      }

      res.json({ title: videoTitle, durationMs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post('/api/process-video', async (req, res) => {
    try {
      const { url, chunkIndex } = req.body;
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
        let transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId);
        if (chunkIndex !== undefined && chunkIndex !== null) {
           const CHUNK_DURATION_MS = 60 * 60 * 1000; // 1 hour
           const startMs = chunkIndex * CHUNK_DURATION_MS;
           const endMs = (chunkIndex + 1) * CHUNK_DURATION_MS;
           transcriptResponse = transcriptResponse.filter(t => t.offset >= startMs && t.offset < endMs);
        }
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
      3. Provide a thorough chapter breakdown in the sections array. CRITICAL: Ensure EVERY major topic in the transcript is covered. Do not truncate or omit the final topics (e.g., Recursion, etc.). If you are running out of space, be more concise in your descriptions rather than skipping topics altogether.
      4. Extract important code snippets with explanations.
      5. Provide a solid recap.
      6. Generate useful flashcards.
      7. Generate multiple choice questions for the quiz.
      8. Generate MULTIPLE practice problems (at least 2-3 per chapter). Strongly emphasize providing many Advanced and Intermediate problems, not just easy ones. For each problem, specify its difficulty level (e.g., Beginner, Intermediate, Advanced) in the 'level' field. If there is a similar problem on LeetCode, provide its name/link in 'leetcode_similar_problem' (otherwise return an empty string). Do not just rely on the literal text; use your external knowledge to craft high-quality, diverse, and deep practice questions based on the content analyzed.`;

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
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
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
      console.error("Error processing video:", error.message);
      let errMsg = error.message || 'An error occurred during processing.';
      if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit') || errMsg.includes('503')) {
         errMsg = "Gemini API limit reached. Please wait a few moments and try again.";
      }
      res.status(500).json({ error: errMsg });
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
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      await parser.destroy();
      const pdfText = result.text;
      fs.unlinkSync(req.file.path); // Clean up

      const instructions = `You are an expert technical note-taker specializing in programming and computer science. 
      Please process the provided text from a PDF notes document and generate a comprehensive study guide.
      
      CRITICAL INSTRUCTIONS:
      1. You MUST generate your response as valid JSON adhering to the provided schema.
      2. Provide a well-detailed executive summary.
      3. Provide a thorough chapter breakdown in the sections array. CRITICAL: Ensure EVERY major topic in the transcript is covered. Do not truncate or omit the final topics (e.g., Recursion, etc.). If you are running out of space, be more concise in your descriptions rather than skipping topics altogether.
      4. Extract important code snippets with explanations.
      5. Provide a solid recap.
      6. Generate useful flashcards.
      7. Generate multiple choice questions for the quiz.
      8. Generate MULTIPLE practice problems (at least 2-3 per chapter). Strongly emphasize providing many Advanced and Intermediate problems, not just easy ones. For each problem, specify its difficulty level (e.g., Beginner, Intermediate, Advanced) in the 'level' field. If there is a similar problem on LeetCode, provide its name/link in 'leetcode_similar_problem' (otherwise return an empty string). Do not just rely on the literal text; use your external knowledge to craft high-quality, diverse, and deep practice questions based on the content analyzed.`;

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
      console.error("Error processing PDF:", error.message);
      let errMsg = error.message || 'An error occurred during PDF processing.';
      if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit')) {
         errMsg = "AI API limit reached. Please wait a few moments and try again.";
      }
      res.status(500).json({ error: errMsg });
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
      if (error.status === 503 || error.status === 429 || (error.message && (error.message.includes('503') || error.message.includes('429') || error.message.includes('high demand')))) {
        console.warn("Notice (Chat): 503/429 High Demand or Rate Limit.");
        return res.json({ reply: "I'm currently experiencing high traffic and hit my rate limit. Please try again in a few moments!" });
      } else {
        console.error("Error in chat:", error.message);
        let errMsg = error.message || 'Failed to get chat response.';
        if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit')) {
           errMsg = "AI API limit reached. Please wait a few moments and try again.";
        }
        res.status(500).json({ error: errMsg });
      }
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


  app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: err.message || 'An unexpected server error occurred.' });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
