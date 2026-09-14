const fs = require('fs');
fs.readFile('read.js', 'utf8', (err, data) => {
  console.log(data);
});
