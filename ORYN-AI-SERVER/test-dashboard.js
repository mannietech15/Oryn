const http = require('http');

function test(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const opts = { hostname: 'localhost', port: 3006, path, method, headers: {} };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
    }
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log("Testing /command...");
  console.log(await test('/api/dashboard/command', 'POST', { query: 'Hi' }));
  
  console.log("Testing /briefing...");
  console.log(await test('/api/dashboard/briefing'));
  
  console.log("Testing /alerts...");
  console.log(await test('/api/dashboard/alerts'));
}

run();
