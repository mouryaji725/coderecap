# CodeRecap AI

**Turn Content into Study Systems.**

CodeRecap AI is a powerful full-stack application that transforms long-form content—such as YouTube videos and PDF documents—into comprehensive, interactive study guides. Built with React, Node.js, Express, and powered by the Google Gemini API, it helps students and developers quickly digest information, generate flashcards, and test their knowledge with auto-generated quizzes.

## Features

- 🎥 **YouTube Summarization**: Paste a YouTube URL to instantly generate a study guide. Handles long videos with intelligent chunking to bypass token limits.
- 📄 **PDF Processing**: Upload PDF notes or lecture slides to extract key concepts and summaries.
- 🧠 **Smart Extraction**: Automatically generates:
  - Executive Summaries
  - Detailed Chapter Notes
  - Extracted Code Snippets with Explanations
  - Interactive Flashcards
  - Multiple Choice Quizzes
  - Practice Problems
- ⚡ **Full-Stack Architecture**: Client-side React app powered by Vite, with a robust Node.js/Express backend handling the AI processing.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React (Icons), Framer Motion
- **Backend**: Node.js, Express
- **AI / LLM**: Google Gemini API (`@google/genai`)
- **Video Parsing**: `youtube-transcript`

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Gemini API Key

### Installation

1. Clone the repository and navigate into the project directory.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API Key:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. The application will be running at `http://localhost:3000`.

## Deployment

### Deploying to Render (Backend/Full-Stack)

Since this app uses a custom Express backend to securely connect to the Gemini API, it should be deployed as a **Web Service** (not a Static Site).

1. Go to [Render](https://dashboard.render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
4. Go to the **Environment** tab in Render and add your `GEMINI_API_KEY` secret.
5. Click **Deploy**.

## License

MIT License
