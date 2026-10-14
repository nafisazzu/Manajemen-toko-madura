/**
 * ============================================================================
 * REST API SERVER DENGAN AUTENTIKASI JWT & JSON-SERVER
 * TOKO MADURA MOBILE
 * ============================================================================
 * Fitur:
 * 1. POST /login (dan /auth/login): Verifikasi kredensial, kirim JWT access token & refresh token.
 * 2. POST /refresh (dan /auth/refresh): Perbarui access token menggunakan refresh token.
 * 3. POST /logout (dan /auth/logout): Invalidation/revokasi token agar tidak bisa dipakai lagi.
 * 4. Proteksi Endpoint /products: Wajib menyertakan header 'Authorization: Bearer <token>'.
 *    - Request tanpa token -> 401 Unauthorized.
 *    - Request dengan token yang sudah di-logout (revoked) -> 401 Unauthorized.
 *    - Request dengan token kadaluarsa -> 401 Unauthorized (memicu auto refresh di mobile).
 *
 * Jalankan dengan: node server.js
 */

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

const JWT_SECRET = 'toko_madura_access_secret_2026';
const REFRESH_SECRET = 'toko_madura_refresh_secret_2026';
const ACCESS_TOKEN_EXP_SECONDS = 15 * 60; // 15 menit
const REFRESH_TOKEN_EXP_SECONDS = 7 * 24 * 60 * 60; // 7 hari

// Set penyimpan token yang telah di-revoke (logout)
const revokedTokens = new Set();

// Akun bawaan sistem Toko Madura
const USERS = [
  { id: '1', username: 'pemilik', password: 'admin123', name: 'Pemilik Toko', role: 'pemilik' },
  { id: '2', username: 'kasir', password: '1234', name: 'Kasir 1', role: 'kasir' },
];

app.use(express.json());

// CORS Middleware untuk akses Expo Go dan Web
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper: Membuat JWT standar HMAC-SHA256 tanpa dependensi luar
function signJwt(payload, secret, expiresInSeconds) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const fullPayload = { ...payload, iat, exp };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Helper: Verifikasi JWT
function verifyJwt(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { expired: true, payload };
    }
    return { expired: false, payload };
  } catch {
    return null;
  }
}

// Helper baca/tulis db.json
function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { products: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ==================== ENDPOINT AUTENTIKASI ====================

// 1. LOGIN: Menerima username & password, mengembalikan JWT tokens
function handleLogin(req, res) {
  const { username, password } = req.body || {};
  const cleanUsername = String(username || '').trim().toLowerCase();

  const user = USERS.find((u) => u.username === cleanUsername && u.password === password);
  if (!user) {
    return res.status(401).json({
      error: 'Username atau password salah.',
      code: 'INVALID_CREDENTIALS',
    });
  }

  const tokenPayload = {
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  };

  const accessToken = signJwt(tokenPayload, JWT_SECRET, ACCESS_TOKEN_EXP_SECONDS);
  const refreshToken = signJwt({ sub: user.id, username: user.username }, REFRESH_SECRET, REFRESH_TOKEN_EXP_SECONDS);

  const userSafe = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  };

  console.log(`[AUTH] User "${user.username}" (${user.role}) berhasil login. JWT Access Token diterbitkan.`);
  return res.json({
    accessToken,
    refreshToken,
    token: accessToken,
    user: userSafe,
  });
}

app.post('/login', handleLogin);
app.post('/auth/login', handleLogin);

// 2. REFRESH TOKEN: Memperbarui access token
function handleRefresh(req, res) {
  const authHeader = req.headers['authorization'];
  let refreshToken = req.body?.refreshToken || req.body?.refresh_token;

  if (!refreshToken && authHeader && authHeader.startsWith('Bearer ')) {
    refreshToken = authHeader.split(' ')[1];
  }

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token tidak ditemukan di body atau header.' });
  }

  if (revokedTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Refresh token telah dicabut (revoked). Silakan login ulang.' });
  }

  const result = verifyJwt(refreshToken, REFRESH_SECRET);
  if (!result || result.expired) {
    return res.status(401).json({ error: 'Refresh token tidak valid atau telah kadaluarsa.' });
  }

  const user = USERS.find((u) => u.username === result.payload.username) || {
    id: result.payload.sub,
    username: result.payload.username,
    name: result.payload.username,
    role: 'kasir',
  };

  const newAccessToken = signJwt(
    { sub: user.id, username: user.username, name: user.name, role: user.role },
    JWT_SECRET,
    ACCESS_TOKEN_EXP_SECONDS,
  );
  const newRefreshToken = signJwt({ sub: user.id, username: user.username }, REFRESH_SECRET, REFRESH_TOKEN_EXP_SECONDS);

  // Revoke token lama agar token rotation aktif
  revokedTokens.add(refreshToken);

  console.log(`[AUTH] Refresh token berhasil untuk "${user.username}". Access token baru diterbitkan.`);
  return res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    token: newAccessToken,
  });
}

app.post('/refresh', handleRefresh);
app.post('/auth/refresh', handleRefresh);

// 3. LOGOUT: Revoke token sehingga token lama tidak dapat dipakai lagi
function handleLogout(req, res) {
  const authHeader = req.headers['authorization'];
  const bodyRefreshToken = req.body?.refreshToken || req.body?.refresh_token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.split(' ')[1];
    revokedTokens.add(accessToken);
  }

  if (bodyRefreshToken) {
    revokedTokens.add(bodyRefreshToken);
  }

  console.log('[AUTH] Logout berhasil. Token telah dimasukkan ke daftar revoke.');
  return res.json({
    success: true,
    message: 'Berhasil keluar. Token lama telah dicabut dan tidak dapat digunakan lagi.',
  });
}

app.post('/logout', handleLogout);
app.post('/auth/logout', handleLogout);

// ==================== MIDDLEWARE PROTEKSI JWT ====================

function requireJwt(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[AUTH] 401 Ditolak: ${req.method} ${req.path} tidak menyertakan header Authorization: Bearer <token>.`);
    return res.status(401).json({
      error: 'Akses ditolak: Header Authorization: Bearer <token> wajib disertakan.',
      code: 'UNAUTHORIZED_NO_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1];

  if (revokedTokens.has(token)) {
    console.warn(`[AUTH] 401 Ditolak: Token ${token.slice(0, 15)}... telah di-revoke (sudah logout).`);
    return res.status(401).json({
      error: 'Akses ditolak: Token telah dicabut (logout). Token lama tidak berlaku lagi.',
      code: 'TOKEN_REVOKED',
    });
  }

  const verified = verifyJwt(token, JWT_SECRET);
  if (!verified) {
    console.warn('[AUTH] 401 Ditolak: Tanda tangan JWT tidak valid.');
    return res.status(401).json({
      error: 'Akses ditolak: Token tidak valid.',
      code: 'INVALID_TOKEN',
    });
  }

  if (verified.expired) {
    console.warn('[AUTH] 401 Ditolak: Token telah kadaluarsa (expired).');
    return res.status(401).json({
      error: 'Akses ditolak: Token kadaluarsa. Membutuhkan refresh token.',
      code: 'TOKEN_EXPIRED',
    });
  }

  req.user = verified.payload;
  next();
}

// Pasang proteksi JWT untuk seluruh endpoint produk
app.use('/products', requireJwt);

// ==================== ENDPOINT PRODUK (CRUD) ====================

app.get('/products', (req, res) => {
  const db = readDb();
  console.log(`[API] GET /products oleh user "${req.user.username}" (${req.user.role}) - Authorized!`);
  res.json(db.products || []);
});

app.get('/products/:id', (req, res) => {
  const db = readDb();
  const item = (db.products || []).find((p) => String(p.id) === String(req.params.id));
  if (!item) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
  res.json(item);
});

app.post('/products', (req, res) => {
  const db = readDb();
  const products = db.products || [];
  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map((p) => Number(p.id) || 0)) + 1 : 1,
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  products.push(newProduct);
  writeDb({ ...db, products });
  res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const db = readDb();
  const products = db.products || [];
  const index = products.findIndex((p) => String(p.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Produk tidak ditemukan.' });

  products[index] = { ...req.body, id: products[index].id, updated_at: new Date().toISOString() };
  writeDb({ ...db, products });
  res.json(products[index]);
});

app.patch('/products/:id', (req, res) => {
  const db = readDb();
  const products = db.products || [];
  const index = products.findIndex((p) => String(p.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Produk tidak ditemukan.' });

  products[index] = { ...products[index], ...req.body, updated_at: new Date().toISOString() };
  writeDb({ ...db, products });
  res.json(products[index]);
});

app.delete('/products/:id', (req, res) => {
  const db = readDb();
  const products = (db.products || []).filter((p) => String(p.id) !== String(req.params.id));
  writeDb({ ...db, products });
  res.status(204).send();
});

// Jalankan server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 REST API Backend Toko Madura berjalan di port ${PORT}`);
  console.log(`   URL Lokal: http://localhost:${PORT}`);
  console.log(`======================================================`);
  console.log(`Akun demo:`);
  console.log(`- Pemilik : username 'pemilik', password 'admin123'`);
  console.log(`- Kasir   : username 'kasir', password '1234'`);
  console.log(`Endpoint:`);
  console.log(`- POST /login     (dapatkan JWT Access & Refresh Token)`);
  console.log(`- POST /refresh   (perbarui access token)`);
  console.log(`- POST /logout    (cabut token agar tidak berlaku lagi)`);
  console.log(`- GET  /products  (dilindungi header Authorization: Bearer <token>)`);
  console.log(`======================================================\n`);
});
