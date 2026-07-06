const fs = require('fs');
async function test() {
  try {
    const pdfParse = require('pdf-parse');
    console.log(Object.keys(pdfParse));
  } catch (error) {
    console.log("Caught:", error.message);
  }
}
test();
