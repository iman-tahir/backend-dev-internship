const http = require('http');

const users = [
  { id: 1, name: 'Ali' },
  { id: 2, name: 'Sara' }
];

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Welcome to the Users API' }));

  } else if (req.method === 'GET' && req.url === '/users') {
    res.writeHead(200);
    res.end(JSON.stringify({ users }));

    } else if (req.method === 'GET' && req.url.startsWith('/users/')) {
        const id = Number(req.url.split('/')[2]);
        const user = users.find(u => u.id === id);

      if (user) {
        res.writeHead(200);
        res.end(JSON.stringify({ user }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'User not found' }));
      }

    }

  else if (req.method === 'POST' && req.url === '/users') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const newUser = JSON.parse(body);
        newUser.id = users.length + 1;
        users.push(newUser);

        res.writeHead(201);
        res.end(JSON.stringify({ message: 'User created', user: newUser }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });

  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});