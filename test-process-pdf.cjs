const fs = require('fs');
async function test() {
  try {
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: fs.readFileSync('src/App.tsx') });
    console.log("Success");
  } catch (error) {
    console.log("Caught:", error.message);
  }
}
test();
