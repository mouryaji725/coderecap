fetch('http://localhost:3000/api/video-info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=1v_4wLSkM_8' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
