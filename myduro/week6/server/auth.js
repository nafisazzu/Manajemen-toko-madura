// =============================================
// MODUL 5 (Sprint 04) - TOKEN-BASED AUTHENTICATION (JWT)
//
//  POST /auth/register  -> buat akun, langsung dapat token
//  POST /auth/login     -> cek credential, kirim access token (JWT)
//  GET  /auth/me        -> (protected) data pengguna dari token
//  POST /auth/logout    -> (protected) token dimasukkan daftar hitam
//
//  wajibToken = middleware untuk melindungi endpoint:
//  request harus membawa header  Authorization: Bearer <token>
// =============================================
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Secret key untuk menandatangani JWT (signature). Di produksi WAJIB lewat env.
const JWT_SECRET = process.env.JWT_SECRET || "myduro-rahasia-praktikum-ganti-di-produksi";
const MASA_BERLAKU = "2h"; // access token berlaku 2 jam
const USERS_FILE = path.join(__dirname, "data", "users.json");

// Token yang sudah logout tidak boleh dipakai lagi (disimpan id-nya / jti)
const tokenDicabut = new Set();

// ---------- Penyimpanan user (file JSON) ----------
function bacaUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}
function tulisUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Password TIDAK disimpan plaintext: scrypt + salt
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 32).toString("hex");
}

function buatToken(user) {
  // Payload (claims): data pengguna yang dibawa token. JANGAN taruh password di sini.
  return jwt.sign({ sub: String(user.id), name: user.nama, email: user.email, role: "kasir" }, JWT_SECRET, {
    expiresIn: MASA_BERLAKU,
    jwtid: crypto.randomUUID(),
  });
}

function responsLogin(res, status, user) {
  const token = buatToken(user);
  const { exp } = jwt.decode(token);
  return res.status(status).json({
    success: true,
    access_token: token,
    token_type: "Bearer",
    expires_at: new Date(exp * 1000).toISOString(),
    user: { id: user.id, nama: user.nama, email: user.email },
  });
}

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Middleware: validasi token ----------
function wajibToken(req, res, next) {
  const header = req.headers.authorization || "";
  const [jenis, token] = header.split(" ");

  if (jenis !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Token tidak ada. Silakan login." });
  }
  try {
    // verify: cek signature + masa berlaku (exp)
    const payload = jwt.verify(token, JWT_SECRET);
    if (tokenDicabut.has(payload.jti)) {
      return res.status(401).json({ success: false, message: "Sesi sudah berakhir. Silakan login lagi." });
    }
    req.user = payload; // diteruskan ke handler endpoint
    next();
  } catch (err) {
    const pesan = err.name === "TokenExpiredError" ? "Token kedaluwarsa. Silakan login lagi." : "Invalid token";
    return res.status(401).json({ success: false, message: pesan });
  }
}

// ---------- Router /auth ----------
const router = express.Router();

router.post("/register", (req, res) => {
  const { nama, email, password } = req.body || {};
  if (!nama || String(nama).trim().length < 3 || !POLA_EMAIL.test(email || "") || String(password || "").length < 6) {
    return res.status(400).json({ success: false, message: "Nama (min 3), email valid, dan password (min 6) wajib diisi." });
  }
  const users = bacaUsers();
  const emailBersih = String(email).trim().toLowerCase();
  if (users.some((u) => u.email === emailBersih)) {
    return res.status(409).json({ success: false, message: "Email sudah terdaftar. Silakan masuk." });
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const user = {
    id: users.reduce((m, u) => Math.max(m, u.id), 0) + 1,
    nama: String(nama).trim(),
    email: emailBersih,
    salt,
    password_hash: hashPassword(String(password), salt),
  };
  tulisUsers([...users, user]);
  return responsLogin(res, 201, user);
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email dan password wajib diisi." });
  }
  const user = bacaUsers().find((u) => u.email === String(email).trim().toLowerCase());
  const cocok =
    user &&
    crypto.timingSafeEqual(Buffer.from(hashPassword(String(password), user.salt), "hex"), Buffer.from(user.password_hash, "hex"));
  if (!cocok) {
    // Pesan umum: tidak membocorkan apakah email terdaftar
    return res.status(401).json({ success: false, message: "Email atau password salah." });
  }
  return responsLogin(res, 200, user);
});

router.get("/me", wajibToken, (req, res) => {
  res.json({ success: true, data: { id: Number(req.user.sub), nama: req.user.name, email: req.user.email } });
});

router.post("/logout", wajibToken, (req, res) => {
  tokenDicabut.add(req.user.jti); // token lama langsung tidak berlaku
  res.json({ success: true, message: "Logout berhasil" });
});

module.exports = { router, wajibToken };
