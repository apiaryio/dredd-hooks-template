require('http')
  .createServer((req, res) => {
    if (req.url === '/message') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello World!\n');
    }
  })
  .listen(4567);
