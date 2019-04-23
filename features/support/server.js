require('http')
  .createServer((req, res) => {
    if (req.url === '/message') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello World!\n');
    } else {
      res.writeHead(500);
      res.end();
    }
  })
  .listen(4567);
