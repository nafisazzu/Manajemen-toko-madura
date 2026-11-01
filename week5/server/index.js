// =============================================
// MyDuro REST API (server)
// MODUL 4 (Sprint 03): RESTful API sederhana untuk data transaksi
// MODUL 5 (Sprint 04): login JWT + endpoint transaksi dilindungi token
//
// Jalankan:  cd server  ->  npm install  ->  npm start
// Endpoint:
//   POST   /auth/register    -> daftar akun (dapat token)
//   POST   /auth/login       -> login (dapat token)
//   GET    /auth/me          -> data pengguna        [butuh token]
//   POST   /auth/logout      -> cabut token          [butuh token]
//   GET    /transaksi        -> daftar transaksi     [butuh token]
//   GET    /transaksi/:id    -> satu transaksi       [butuh token]
//   POST   /transaksi        -> transaksi baru       [butuh token]
// =============================================
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { router: authRouter, wajibToken } = require("./auth");

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "data", "db.json");
const SEED_FILE = path.join(__dirname, "data", "seed.json");

// ---------- "Database" sederhana: file JSON ----------
function bacaDb() {
  if (!fs.existsSync(DB_FILE)) fs.copyFileSync(SEED_FILE, DB_FILE);
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
function tulisDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.set("etag", false); // selalu kirim 200 + body (hindari 304 di client)
app.use(cors());
app.use(express.json());

// Log setiap request (membantu saat demo: terlihat method, URL, status)
app.use((req, res, next) => {
  const mulai = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - mulai} ms)`);
  });
  next();
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "MyDuro API berjalan" });
});

// ---------- Auth (publik: login & register) ----------
app.use("/auth", authRouter);

// ---------- Semua endpoint /transaksi = PROTECTED ENDPOINT ----------
// Tanpa header "Authorization: Bearer <token>" yang valid -> 401 Unauthorized
app.use("/transaksi", wajibToken);

// ---------- GET /transaksi ----------
app.get("/transaksi", (req, res) => {
  const data = bacaDb().sort((a, b) => new Date(b.tanggal_transaksi) - new Date(a.tanggal_transaksi));
  res.status(200).json({ success: true, data });
});

// ---------- GET /transaksi/:id ----------
app.get("/transaksi/:id", (req, res) => {
  const trx = bacaDb().find((t) => t.kode === req.params.id || String(t.id) === req.params.id);
  if (!trx) return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
  res.json({ success: true, data: trx });
});

// ---------- POST /transaksi ----------
app.post("/transaksi", (req, res) => {
  const { nama_barang, qty, satuan, harga_satuan, jenis, catatan } = req.body || {};

  // Validasi di server: jangan percaya data dari client begitu saja
  if (!nama_barang || !(qty > 0) || !(harga_satuan > 0) || !["JUAL", "BELI"].includes(jenis)) {
    return res.status(400).json({
      success: false,
      message: "Data tidak valid: nama_barang, qty > 0, harga_satuan > 0, jenis JUAL/BELI wajib",
    });
  }

  const db = bacaDb();
  const idBaru = db.reduce((maks, t) => Math.max(maks, t.id), 0) + 1;
  const sekarang = new Date().toISOString();
  const trx = {
    id: idBaru,
    kode: "TRX-" + String(idBaru).padStart(3, "0"),
    tanggal_transaksi: sekarang,
    nama_barang: String(nama_barang).trim(),
    qty: Number(qty),
    satuan: satuan ? String(satuan).trim() : "pcs",
    harga_satuan: Number(harga_satuan),
    jenis,
    catatan: catatan ? String(catatan).trim() : null,
    kasir_id: Number(req.user.sub), // id pengguna diambil dari token
    created_at: sekarang,
    updated_at: sekarang,
  };
  db.push(trx);
  tulisDb(db);
  res.status(201).json({ success: true, data: trx });
});

app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MyDuro API berjalan di port ${PORT}`);
  // Tampilkan alamat IP laptop agar mudah dipakai dari HP (Expo Go)
  for (const daftar of Object.values(os.networkInterfaces())) {
    for (const net of daftar || []) {
      if (net.family === "IPv4" && !net.internal) console.log(`  -> http://${net.address}:${PORT}`);
    }
  }
});
