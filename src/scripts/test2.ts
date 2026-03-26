import http from 'http';

http.get('http://localhost:3000/postback?clickid=69c4cdee143cce8c1734ccbd&status=approved&payout=50', (res) => {
  console.log('Postback Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Postback Body:', data));
});

http.get('http://localhost:3000/impression', (res) => {
  console.log('Impression Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Impression Body:', data));
});

http.get('http://localhost:3000/pixel', (res) => {
  console.log('Pixel Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Pixel Body:', data));
});
