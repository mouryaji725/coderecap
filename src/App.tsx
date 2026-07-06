import React, { useState, useEffect, useRef } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Accordion from '@radix-ui/react-accordion';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { 
  Youtube, Download, Moon, Sun, ChevronDown, 
  Send, BrainCircuit, Library, CheckCircle, 
  HelpCircle, Presentation, Search, Code,
  Upload, ListVideo, PlayCircle, StepForward,
  FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';


const customVscDarkStyle = JSON.parse(JSON.stringify(vscDarkPlus));
if (customVscDarkStyle['pre[class*="language-"]']) {
  customVscDarkStyle['pre[class*="language-"]'].backgroundColor = '#1e1e1e';
  delete customVscDarkStyle['pre[class*="language-"]'].background;
}
if (customVscDarkStyle['code[class*="language-"]']) {
  customVscDarkStyle['code[class*="language-"]'].backgroundColor = '#1e1e1e';
  delete customVscDarkStyle['code[class*="language-"]'].background;
}
customVscDarkStyle.comment = { color: '#4ade80', fontStyle: 'italic' }; 
customVscDarkStyle.prolog = customVscDarkStyle.comment;
customVscDarkStyle.doctype = customVscDarkStyle.comment;
customVscDarkStyle.cdata = customVscDarkStyle.comment;

const customVsStyle = JSON.parse(JSON.stringify(vs));
if (customVsStyle['pre[class*="language-"]']) {
  customVsStyle['pre[class*="language-"]'].backgroundColor = '#f4f4f4';
  delete customVsStyle['pre[class*="language-"]'].background;
}
if (customVsStyle['code[class*="language-"]']) {
  customVsStyle['code[class*="language-"]'].backgroundColor = '#f4f4f4';
  delete customVsStyle['code[class*="language-"]'].background;
}
customVsStyle.comment = { color: '#16a34a', fontStyle: 'italic' };
customVsStyle.prolog = customVsStyle.comment;
customVsStyle.doctype = customVsStyle.comment;
customVsStyle.cdata = customVsStyle.comment;


import { VideoSummaryData, PlaylistData, PlaylistItem } from './types';
import { Flashcard } from './components/Flashcard';
import { ChatBox } from './components/ChatBox';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VideoSummaryData | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isDark, setIsDark] = useState(true);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // PDF Upload State
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Playlist State
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(-1);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const processVideoUrl = async (videoUrl: string, index?: number, chunkIndex?: number) => {
    setLoading(true);
    setError(null);
    setData(null);
    setChatMessages([]);
    setQuizAnswers({});
    setQuizSubmitted({});
    
    try {
      const response = await fetch('/api/process-video', {
          method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl, chunkIndex })
      });
      
      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json();
      } else {
        const text = await response.text();
        
        if (response.status === 413) {
          throw new Error("File is too large. The server has a strict upload size limit. Please try a smaller PDF (typically under 1MB).");
        } else if (response.status === 502 || response.status === 503) {
           throw new Error("Server is temporarily unavailable or restarting. Please try again in a few moments.");
        } else {
          
          let errorMessage = `Server error (${response.status}): Expected JSON but received HTML.`;
          if (text.includes("wait") || text.includes("starting")) {
            errorMessage = "Server is temporarily unavailable or restarting. Please try again in a few moments.";
          } else {
            errorMessage = "Upload blocked by platform proxy. The file might be too large (must be <10MB) or the server crashed. Please try a smaller file.";
          }
          throw new Error(errorMessage);

        }

      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to process video');
      }
      
      setData(result.data);
      if (index !== undefined && playlist) {
         setCurrentVideoIndex(index);
         const updatedPlaylist = { ...playlist };
         if (index > 0) {
            updatedPlaylist.items[index-1].completed = true;
         }
         setPlaylist(updatedPlaylist);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!url) return;

    if (url.includes('list=')) {
      setLoading(true);
      setError(null);
      try {
         const response = await fetch('/api/playlist', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ url })
         });
         
         let result;
         const contentType = response.headers.get("content-type");
         if (contentType && contentType.indexOf("application/json") !== -1) {
           result = await response.json();
         } else {
           const text = await response.text();
           
        if (response.status === 413) {
          throw new Error("File is too large. The server has a strict upload size limit. Please try a smaller PDF (typically under 1MB).");
        } else if (response.status === 502 || response.status === 503) {
           throw new Error("Server is temporarily unavailable or restarting. Please try again in a few moments.");
        } else {
          
          let errorMessage = `Server error (${response.status}): Expected JSON but received HTML.`;
          if (text.includes("wait") || text.includes("starting")) {
            errorMessage = "Server is temporarily unavailable or restarting. Please try again in a few moments.";
          } else {
            errorMessage = "Upload blocked by platform proxy. The file might be too large (must be <10MB) or the server crashed. Please try a smaller file.";
          }
          throw new Error(errorMessage);

        }

         }
         
         if (!response.ok) throw new Error(result.error);
         
         setPlaylist(result);
         if (result.items && result.items.length > 0) {
           processVideoUrl(result.items[0].url, 0);
         } else {
           setLoading(false);
         }
      } catch (err: any) {
         setError(err.message);
         setLoading(false);
      }
      return;
    }

    // Check if it's a long video
    setLoading(true);
    try {
      const infoRes = await fetch('/api/video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (infoRes.ok) {
        const info = await infoRes.json();
        if (info.durationMs > 90 * 60 * 1000) {
          const numChunks = Math.ceil(info.durationMs / (60 * 60 * 1000));
          const items = [];
          for (let i = 0; i < numChunks; i++) {
            const startHr = i;
            const endHr = i + 1;
            items.push({
              title: `Part ${i + 1} (${startHr}:00:00 - ${endHr}:00:00)`,
              url: url,
              chunkIndex: i,
              completed: false,
              thumbnail: '' 
            });
          }
          setPlaylist({ title: info.title || 'Long Video', items });
          setData({
            executive_summary: "This video is over 90 minutes long. A full summary cannot be generated at once due to API limits. Please use the Playlist Dashboard to process the video in chunks.",
            sections: [],
            recap: [],
            flashcards: [],
            quiz: [],
            problems: []
          });
          setLoading(false);
          setActiveTab('playlist');
          // Removed auto-process as per user request to keep it blank initially
          return;
        }
      }
    } catch(e) {
      console.error("Error fetching video info", e);
    }

    processVideoUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAnalyze();
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       setPdfFile(file);
       setLoading(true);
       setError(null);
       setData(null);
       setPlaylist(null);
       setChatMessages([]);
       setQuizAnswers({});
       setQuizSubmitted({});
       
       
       if (file.size > 1024 * 1024 * 50) { // 10MB
         setError("File is too large. Please select a PDF smaller than 50MB.");
         setLoading(false);
         return;
       }
       const formData = new FormData();
       formData.append('pdf', file);
       
       try {
         const response = await fetch('/api/process-pdf', {
           method: 'POST',
           body: formData
         });
         
         let result;
         const contentType = response.headers.get("content-type");
         if (contentType && contentType.indexOf("application/json") !== -1) {
           result = await response.json();
         } else {
           const text = await response.text();
           
        if (response.status === 413) {
          throw new Error("File is too large. The server has a strict upload size limit. Please try a smaller PDF (typically under 1MB).");
        } else if (response.status === 502 || response.status === 503) {
           throw new Error("Server is temporarily unavailable or restarting. Please try again in a few moments.");
        } else {
          
          let errorMessage = `Server error (${response.status}): Expected JSON but received HTML.`;
          if (text.includes("wait") || text.includes("starting")) {
            errorMessage = "Server is temporarily unavailable or restarting. Please try again in a few moments.";
          } else {
            errorMessage = "Upload blocked by platform proxy. The file might be too large (must be <10MB) or the server crashed. Please try a smaller file.";
          }
          throw new Error(errorMessage);

        }

         }
         
         if (!response.ok) throw new Error(result.error || 'Failed to process PDF');
         setData(result.data);
         setUrl(file.name);
       } catch (err: any) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
    }
  };

  const handleSendMessage = async (userMsg: string) => {
    if (chatLoading) return;

    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg, 
          context: data,
          history: chatMessages 
        })
      });
      
      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json();
      } else {
        const text = await response.text();
        
        if (response.status === 413) {
          throw new Error("File is too large. The server has a strict upload size limit. Please try a smaller PDF (typically under 1MB).");
        } else if (response.status === 502 || response.status === 503) {
           throw new Error("Server is temporarily unavailable or restarting. Please try again in a few moments.");
        } else {
          
          let errorMessage = `Server error (${response.status}): Expected JSON but received HTML.`;
          if (text.includes("wait") || text.includes("starting")) {
            errorMessage = "Server is temporarily unavailable or restarting. Please try again in a few moments.";
          } else {
            errorMessage = "Upload blocked by platform proxy. The file might be too large (must be <10MB) or the server crashed. Please try a smaller file.";
          }
          throw new Error(errorMessage);

        }

      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get chat response');
      }
      
      setChatMessages(prev => [...prev, { role: 'ai', text: result.reply }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuizSubmit = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted[qIndex]) return;
    setQuizAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
    setQuizSubmitted(prev => ({ ...prev, [qIndex]: true }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0C10] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-[#262935] bg-white/80 dark:bg-[#0B0C10]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
          <div className="w-8 h-8 bg-[#5e5ce6] rounded-lg flex items-center justify-center font-bold text-white tracking-tighter">CR</div>
          <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100">CodeRecap AI</h1>
        </div>
        <div className="flex items-center space-x-4">
          {data && playlist && currentVideoIndex < playlist.items.length - 1 && (
            <button 
              onClick={() => processVideoUrl(playlist.items[currentVideoIndex + 1].url, currentVideoIndex + 1, playlist.items[currentVideoIndex + 1].chunkIndex)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-md transition-colors text-sm font-medium"
            >
              <span>Next Video</span>
              <StepForward className="w-4 h-4" />
            </button>
          )}
          {data && (
            <button 
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-4 py-2 bg-[#5e5ce6] hover:opacity-90 text-white rounded-md transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export Summary</span>
            </button>
          )}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#15171E] transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-slate-500 dark:text-slate-400" /> : <Moon className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-[#5e5ce6]/10 rounded-full flex items-center justify-center mb-6">
              <BrainCircuit className="w-10 h-10 text-[#5e5ce6]" />
            </div>
            <h2 className="text-4xl font-extrabold font-display tracking-tight sm:text-5xl text-slate-900 dark:text-slate-100">Turn Content into <span className="text-[#5e5ce6]">Study Systems</span></h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              Paste a YouTube video URL, a Playlist URL, or upload a PDF. Our AI generates comprehensive notes, code snippets, flashcards, quizzes, and practice problems in seconds.
            </p>
            
            <form onSubmit={handleSubmit} className="mt-10 w-full max-w-xl relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Youtube className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </div>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube or Playlist URL here..." 
                className="w-full pl-14 pr-32 py-4 rounded-full bg-white dark:bg-[#15171E] border border-slate-200 dark:border-[#262935] shadow-sm focus:outline-none focus:border-[#5e5ce6] focus:ring-1 focus:ring-[#5e5ce6] text-slate-900 dark:text-slate-100 text-lg transition-all duration-300"
              />
              <button 
                type="submit"
                disabled={!url || loading}
                className="absolute right-2 top-2 bottom-2 px-6 bg-[#5e5ce6] hover:opacity-90 text-white font-medium rounded-full transition-colors disabled:opacity-50"
              >
                Generate
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center space-x-4">
              <span className="text-slate-400 text-sm">OR</span>
              <label className="cursor-pointer flex items-center space-x-2 bg-white dark:bg-[#15171E] border border-slate-200 dark:border-[#262935] px-4 py-2 rounded-full hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors shadow-sm">
                 <FileText className="w-4 h-4 text-[#5e5ce6]" />
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload PDF Notes</span>
                 <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
              </label>
            </div>
          </div>
        )}

        {loading && !playlist && (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-300">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-t-2 border-[#5e5ce6] animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-[#5e5ce6] animate-spin animation-delay-150"></div>
              <div className="absolute inset-4 rounded-full border-b-2 border-[#5e5ce6] animate-spin animation-delay-300"></div>
            </div>
            <p className="mt-6 text-slate-500 dark:text-slate-400 animate-pulse font-medium">Processing your content using Gemini...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl mb-6 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {(data || playlist) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Left Column: Dashboard / Tabs */}
            <div className="lg:col-span-2">
              <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="flex overflow-x-auto border-b border-slate-200 dark:border-[#262935] mb-6 pb-2 space-x-2 scrollbar-hide">
                  {[
                    { id: 'summary', icon: Library, label: 'Summary' },
                    { id: 'notes', icon: FileText, label: 'Detailed Notes' },
                    { id: 'takeaways', icon: CheckCircle, label: 'Key Takeaways' },
                    { id: 'flashcards', icon: Presentation, label: 'Flashcards' },
                    { id: 'quiz', icon: CheckCircle, label: 'Quiz' },
                    { id: 'problems', icon: Code, label: 'Practice' },
                    ...(playlist ? [{ id: 'playlist', icon: ListVideo, label: 'Dashboard' }] : [])
                  ].map(tab => (
                    <Tabs.Trigger 
                      key={tab.id}
                      value={tab.id} 
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white shadow-sm dark:bg-[#15171E] text-[#5e5ce6] dark:text-[#7877e6]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-[#15171E]/50 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                {/* Tab Contents */}
                <Tabs.Content value="summary" className="space-y-6 focus:outline-none">
                  <div className="bg-white dark:bg-[#15171E] rounded-xl border border-slate-200 dark:border-[#262935] shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-[#262935]">
                      <h2 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">Executive Summary</h2>
                    </div>
                    <div className="p-6">
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{data?.executive_summary}</p>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="notes" className="space-y-6 focus:outline-none">
                  <div className="space-y-6">
                    {(data?.sections || []).map((section, idx) => (
                      <div key={idx} className="bg-white dark:bg-[#15171E] rounded-xl border border-slate-200 dark:border-[#262935] shadow-sm overflow-hidden flex flex-col">
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#262935] font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-[0.05em] flex items-center">
                          <span className="bg-slate-200 dark:bg-[#333] text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-[4px] mr-2 flex items-center justify-center">CH {idx + 1}</span>
                          {section.chapter_title}
                        </div>
                        <div className="p-5">
                          <div className="prose dark:prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-400">
                            <ReactMarkdown>{section.detailed_notes}</ReactMarkdown>
                          </div>
                          
                          {section.code_snippets && section.code_snippets.length > 0 && (
                            <div className="mt-6 space-y-4">
                              {(section.code_snippets || []).map((snippet, sIdx) => (
                                <div key={sIdx} className="bg-slate-50 dark:bg-[#0B0C10] rounded-lg p-4 border-l-[3px] border-[#5e5ce6] my-4">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">{snippet.explanation}</span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 dark:bg-[#333] text-slate-600 dark:text-slate-400 rounded-[4px]">{snippet.language}</span>
                                  </div>
                                  <div className="overflow-x-auto rounded">
                                    <SyntaxHighlighter
                                      language={snippet.language?.toLowerCase() || 'javascript'}
                                      style={isDark ? customVscDarkStyle : customVsStyle}
                                      customStyle={{
                                        margin: 0,
                                        fontSize: '13px',
                                        backgroundColor: 'transparent'
                                      }}
                                    >
                                      {snippet.code}
                                    </SyntaxHighlighter>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Tabs.Content>

                <Tabs.Content value="takeaways" className="space-y-6 focus:outline-none">
                  <div className="bg-white dark:bg-[#15171E] rounded-xl border border-slate-200 dark:border-[#262935] shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-[#262935]">
                      <h2 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">Key Takeaways</h2>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-3">
                        {(data?.recap || []).map((point, idx) => (
                          <li key={idx} className="flex items-start space-x-3 text-sm text-slate-600 dark:text-slate-400">
                            <div className="w-4 h-4 border border-slate-300 dark:border-[#444] rounded mt-[2px] shrink-0 bg-slate-100 dark:bg-[#222]"></div>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="flashcards" className="focus:outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(data?.flashcards || []).map((card, idx) => (
                      <Flashcard key={idx} card={card} />
                    ))}
                  </div>
                </Tabs.Content>

                <Tabs.Content value="quiz" className="space-y-6 focus:outline-none">
                  {(data?.quiz || []).map((q, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#15171E] rounded-xl border border-slate-200 dark:border-[#262935] shadow-sm overflow-hidden flex flex-col">
                      <div className="p-6">
                        <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-6 flex items-start space-x-3">
                          <span className="text-[#5e5ce6] shrink-0">Q{idx + 1}.</span>
                          <span>{q.question}</span>
                        </h3>
                        <div className="space-y-3">
                          {(q.options || []).map((opt, oIdx) => {
                            const isSubmitted = quizSubmitted[idx];
                            const isSelected = quizAnswers[idx] === oIdx;
                            const isCorrect = q.correct_index === oIdx;
                            
                            let btnClass = "border-slate-200 dark:border-[#333] bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#15171E] hover:text-slate-900 dark:text-slate-100";
                            
                            if (isSubmitted) {
                              if (isCorrect) {
                                btnClass = "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400";
                              } else if (isSelected) {
                                btnClass = "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400";
                              } else {
                                btnClass = "border-slate-200 dark:border-[#333] bg-transparent text-slate-400 dark:text-[#666] opacity-50";
                              }
                            } else if (isSelected) {
                              btnClass = "border-[#5e5ce6] bg-[#5e5ce6]/10 text-[#5e5ce6] dark:text-white";
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleQuizSubmit(idx, oIdx)}
                                disabled={isSubmitted}
                                className={`w-full text-left px-5 py-4 rounded-lg border ${btnClass} transition-colors text-sm`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted[idx] && (
                          <div className="mt-6 p-4 bg-[#5e5ce6]/5 border border-[#5e5ce6]/20 rounded-lg">
                            <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </Tabs.Content>

                <Tabs.Content value="problems" className="focus:outline-none">
                  <Accordion.Root type="multiple" className="space-y-4">
                    {(data?.problems || []).map((prob, idx) => (
                      <Accordion.Item key={idx} value={`item-${idx}`} className="bg-white dark:bg-[#15171E] rounded-xl border border-slate-200 dark:border-[#262935] shadow-sm overflow-hidden">
                        <Accordion.Header>
                          <Accordion.Trigger className="w-full flex justify-between items-center p-5 focus:outline-none group">
                            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-[#5e5ce6] transition-colors flex items-center gap-3">
                              {prob.title}
                              {prob.level && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  prob.level.toLowerCase() === 'beginner' || prob.level.toLowerCase() === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                                  prob.level.toLowerCase() === 'intermediate' || prob.level.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                }`}>
                                  {prob.level}
                                </span>
                              )}
                            </h3>
                            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="px-5 pb-5 pt-2 animate-in slide-in-from-top-2 duration-200">
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.05em] mb-2">Problem Statement</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{prob.statement}</p>
                              {prob.leetcode_similar_problem && prob.leetcode_similar_problem.trim() !== '' && prob.leetcode_similar_problem.toLowerCase() !== 'none' && (
                                <div className="mt-4 flex items-start gap-2 text-[13px] bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-slate-200 dark:border-[#333]">
                                  <Code className="w-4 h-4 text-[#5e5ce6] shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">Similar LeetCode Problem:</span>
                                    <span className="text-slate-600 dark:text-slate-400 ml-2">{prob.leetcode_similar_problem}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {prob.hints && prob.hints.length > 0 && (
                              <div>
                                <h4 className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.05em] mb-2">Hints</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {(prob.hints || []).map((hint, hIdx) => (
                                    <li key={hIdx} className="text-[13px] text-slate-600 dark:text-slate-400">{hint}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div>
                              <h4 className="text-[10px] font-semibold text-[#5e5ce6] uppercase tracking-[0.05em] mb-2">Solution Approach</h4>
                              <div className="bg-slate-50 dark:bg-[#1a1a1a] p-4 rounded-lg border border-slate-200 dark:border-[#333]">
                                <div className="prose dark:prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-400">
                                  <ReactMarkdown>{prob.solution_approach}</ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion.Content>
                      </Accordion.Item>
                    ))}
                  </Accordion.Root>
                </Tabs.Content>
                
                {playlist && (
                   <Tabs.Content value="playlist" className="focus:outline-none">
                     <div className="bg-white dark:bg-[#15171E] rounded-xl border border-slate-200 dark:border-[#262935] shadow-sm p-6">
                       <div className="flex justify-between items-center mb-4">
                         <h2 className="text-xl font-bold font-display">{playlist.title} Dashboard</h2>
                         <div className="text-sm font-medium text-slate-500">
                           {(playlist.items || []).filter((i: any) => i.completed).length} / {(playlist.items || []).length} Completed
                         </div>
                       </div>
                       
                       <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-6">
                         <div className="bg-[#5e5ce6] h-2.5 rounded-full" style={{ width: `${((playlist.items || []).filter((i: any) => i.completed).length / Math.max(1, (playlist.items || []).length)) * 100}%` }}></div>
                       </div>
                       
                       <div className="space-y-3">
                         {(playlist.items || []).map((item: any, idx: number) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${currentVideoIndex === idx ? 'border-[#5e5ce6] bg-[#5e5ce6]/10' : 'border-slate-200 dark:border-[#262935] bg-slate-50 dark:bg-[#0B0C10]'}`}>
                               <div className="flex items-center space-x-4">
                                 {item.thumbnail && <img src={item.thumbnail} alt="thumb" className="w-16 h-12 object-cover rounded-md" />}
                                 <span className={`text-sm font-medium ${item.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>{item.title}</span>
                               </div>
                               <button 
                                 onClick={() => {
                                   if (currentVideoIndex !== idx) {
                                     processVideoUrl(item.url, idx, item.chunkIndex);
                                   }
                                 }}
                                 className="px-3 py-1.5 bg-[#5e5ce6] hover:bg-[#4d4bd6] text-white text-xs font-medium rounded-md flex-shrink-0"
                               >
                                 {idx === currentVideoIndex ? 'Watching' : 'Process Notes'}
                               </button>
                            </div>
                         ))}
                       </div>
                     </div>
                   </Tabs.Content>
                )}

              </Tabs.Root>

              {data && playlist && currentVideoIndex < playlist.items.length - 1 && activeTab !== 'playlist' && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => {
                       processVideoUrl(playlist.items[currentVideoIndex + 1].url, currentVideoIndex + 1, playlist.items[currentVideoIndex + 1].chunkIndex);
                       window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center space-x-2 px-8 py-4 bg-[#5e5ce6] hover:bg-[#4d4bd6] text-white rounded-full transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <span>Proceed to {playlist.items[currentVideoIndex + 1].title}</span>
                    <StepForward className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: AI Chat */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white dark:bg-[#15171E] rounded-xl border border-slate-200 dark:border-[#262935] shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
                <ChatBox 
                  initialMessages={chatMessages} 
                  onSendMessage={handleSendMessage} 
                  chatLoading={chatLoading} 
                />
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
