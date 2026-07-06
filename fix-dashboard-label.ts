import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /\.\.\.\(playlist \? \[\{ id: 'playlist', icon: ListVideo, label: 'Playlist Dashboard' \}\] : \[\]\)/,
  "...(playlist ? [{ id: 'playlist', icon: ListVideo, label: 'Dashboard' }] : [])"
);

fs.writeFileSync('src/App.tsx', content);
