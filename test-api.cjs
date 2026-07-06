const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/process-video',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

req.on('error', console.error);
req.write(JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }));
req.end();
