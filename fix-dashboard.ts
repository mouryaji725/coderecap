import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Change the main container condition
content = content.replace(
  /\{data && !loading && \(/g,
  "{(data || playlist) && ("
);

// We still don't want to show the container while loading the FIRST item or playlist overview, 
// wait, loading is controlled by setLoading(true).
// If loading is true, we show the processing spinner instead of the container!
// Wait! If loading is true, it hides the dashboard entirely!
// Let's change the loading condition!
content = content.replace(
  /\{loading && \(/g,
  "{loading && !playlist && ("
);

// If playlist exists, we show the dashboard. But what if it's loading?
// The dashboard will show, but how does the user know it's loading a chunk?
// I can add a small loading spinner inside the dashboard itself!

// Replace `data.` with `data?.`
content = content.replace(/data\.executive_summary/g, "data?.executive_summary");
content = content.replace(/data\.sections/g, "data?.sections");
content = content.replace(/data\.recap/g, "data?.recap");
content = content.replace(/data\.flashcards/g, "data?.flashcards");
content = content.replace(/data\.quiz/g, "data?.quiz");
content = content.replace(/data\.problems/g, "data?.problems");

fs.writeFileSync('src/App.tsx', content);

