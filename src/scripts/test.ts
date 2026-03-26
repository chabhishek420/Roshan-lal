import http from 'http';

http.get('http://localhost:3000/click.php?c=typosquat_camp&p=test_pub_1', (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Body:', data));
});
