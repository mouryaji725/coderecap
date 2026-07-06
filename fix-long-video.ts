import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = `          setPlaylist({ title: info.title || 'Long Video', items });
          setActiveTab('playlist');
          processVideoUrl(url, 0, 0); // start the first chunk automatically
          return;`;

const newStr = `          setPlaylist({ title: info.title || 'Long Video', items });
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
          return;`;

content = content.replace(oldStr, newStr);
fs.writeFileSync('src/App.tsx', content);

