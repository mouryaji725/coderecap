const pdf = require('pdf-parse');
try {
  const parser = new pdf({ data: Buffer.from('test') });
  console.log("Success");
} catch (e) {
  console.log("Error:", e.message);
}
