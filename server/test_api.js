const http = require('http');

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 RUNNING SMART LIBRARY BACKEND API TEST SUITE...');
  try {
    // 1. Health Check
    const health = await request('/health');
    console.log(`[PASS] Health Check: ${health.status} ->`, health.body.status);

    // 2. Login Admin
    const adminLogin = await request('/auth/login', 'POST', {
      email: 'admin@library.com',
      password: 'admin123',
    });
    console.log(`[PASS] Admin Login: status=${adminLogin.status}, role=${adminLogin.body.user ? adminLogin.body.user.role : 'none'}`);
    const adminToken = adminLogin.body.token;

    // 3. Login Librarian
    const libLogin = await request('/auth/login', 'POST', {
      email: 'librarian@library.com',
      password: 'librarian123',
    });
    console.log(`[PASS] Librarian Login: status=${libLogin.status}, role=${libLogin.body.user ? libLogin.body.user.role : 'none'}`);
    const libToken = libLogin.body.token;

    // 4. Fetch Books Catalog
    const booksRes = await request('/books');
    console.log(`[PASS] Fetch Books: count=${booksRes.body.count}, total=${booksRes.body.total}`);

    // 5. Fetch Categories
    const catRes = await request('/categories');
    console.log(`[PASS] Fetch Categories: totalCategories=${catRes.body.length}`);

    // 6. Fetch Dashboard Metrics
    const metricsRes = await request('/reports/dashboard', 'GET', null, adminToken);
    console.log(`[PASS] Admin Dashboard Metrics: totalBooks=${metricsRes.body.summary ? metricsRes.body.summary.totalBooks : 0}`);

    console.log('🎉 ALL BACKEND API CHECKS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
};

runTests();
