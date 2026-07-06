const fs = require('fs');
async function test() {
  try {
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: fs.readFileSync('src/App.tsx') });
    console.log(typeof parser.getText);
    const result = await parser.getText();
    console.log(result);
  } catch (error) {
    console.log("Caught:", error.message);
  }
}
test();
