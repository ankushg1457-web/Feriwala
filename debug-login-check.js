const http = require('http');

function post(path, data) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: '13.233.227.15',
        port: 80,
        path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', (err) => {
      resolve({ status: 'ERROR', body: err.message });
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  const runId = Date.now();
  const email = `debug${runId}@example.com`;
  const phone = `+91${String(runId).slice(-10)}`;
  const password = 'TestPass123!@';

  const register = await post('/api/auth/register', {
    email,
    password,
    name: 'Debug User',
    phone,
  });

  const login = await post('/api/auth/login', {
    credential: email,
    password,
  });

  console.log('REGISTER:', register.status, JSON.stringify(register.body));
  console.log('LOGIN:', login.status, JSON.stringify(login.body));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
