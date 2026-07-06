const fs = require('fs');

async function test() {
  const FormData = require('form-data');
  const form = new FormData();
  form.append('pdf', fs.createReadStream('src/App.tsx')); // Just testing with a file

  const response = await fetch('http://localhost:3000/api/process-pdf', {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Content-Type:', response.headers.get('content-type'));
  console.log('Body:', text.substring(0, 100));
}

test();
