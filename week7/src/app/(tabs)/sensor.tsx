// =============================================
// MODUL 7 (Sprint 06) - CONNECT MyDuro TO DEVICE SENSOR
//
// Task 01: membaca accelerometer dengan expo-sensors (Sensor API),
//          menangani permission, menampilkan X/Y/Z di console & UI
// Task 02: menampilkan data sensor real-time (nilai + grafik)
// Task 03: interaksi: jika magnitude gerakan > ambang (threshold)
//          -> getar (Vibration) + "Goyang terdeteksi!"
//          -> riwayat transaksi disinkronkan ulang dari API
// =============================================
import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Vibration, Linking, Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Accelerometer } from "expo-sensors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, warna } from "../../styles/styles";
import { useResponsive } from "../../hooks/useResponsive";
import { useTransaksi } from "../../context/TransaksiContext";
import GrafikSensor, { Sampel, WARNA_SUMBU } from "../../components/GrafikSensor";
import { AMBANG_GOYANG, apakahGoyang, hitungMagnitude, keMeterPerDetik } from "../../utils/sensor";

const INTERVAL_MS = 100; // 10 data per detik
const JUMLAH_SAMPEL = 40; // titik pada grafik

type StatusSensor = "memeriksa" | "tidak-tersedia" | "perlu-izin" | "ditolak" | "siap";

export default function Sensor() {
  const insets = useSafeAreaInsets();
  const { lebarKonten } = useResponsive();
  const { daftar, muatUlang } = useTransaksi();

  const [status, setStatus] = useState<StatusSensor>("memeriksa");
  const [aktif, setAktif] = useState(true);
  const [data, setData] = useState<Sampel>({ x: 0, y: 0, z: 0 }); // m/s²
  const [magnitude, setMagnitude] = useState(0); // g
  const [riwayat, setRiwayat] = useState<Sampel[]>([]);
  const [goyang, setGoyang] = useState(false);
  const [jumlahGoyang, setJumlahGoyang] = useState(0);
  const [pesanAksi, setPesanAksi] = useState("Goyangkan HP untuk menyinkronkan riwayat transaksi.");

  const terakhirGoyang = useRef(0);
  const terakhirLog = useRef(0);

  // ---------- 1. Cek ketersediaan sensor & izin ----------
  const cekSensor = useCallback(async () => {
    setStatus("memeriksa");
    // Catatan: accelerometer versi web di expo-sensors belum berfungsi -> wajib di HP
    const tersedia = Platform.OS !== "web" && (await Accelerometer.isAvailableAsync());
    if (!tersedia) return setStatus("tidak-tersedia");
    const izin = await Accelerometer.getPermissionsAsync();
    console.log(`[Sensor] Permission saat ini: ${izin.status}`);
    if (izin.granted) return setStatus("siap");
    setStatus(izin.canAskAgain ? "perlu-izin" : "ditolak");
  }, []);

  // Permission request: dipanggil saat pengguna menekan "Izinkan"
  const mintaIzin = async () => {
    const izin = await Accelerometer.requestPermissionsAsync();
    console.log(`[Sensor] Permission request: ${izin.status}`);
    setStatus(izin.granted ? "siap" : "ditolak");
  };

  useEffect(() => {
    cekSensor();
  }, [cekSensor]);

  // ---------- 3. Aksi ketika goyangan terdeteksi ----------
  const saatGoyang = useCallback(async () => {
    Vibration.vibrate(400); // feedback getaran
    setJumlahGoyang((n) => n + 1);
    setPesanAksi("Goyang terdeteksi! Menyinkronkan riwayat transaksi...");
    await muatUlang();
    setPesanAksi(`Sinkronisasi selesai pukul ${new Date().toTimeString().slice(0, 8)}.`);
  }, [muatUlang]);

  // ---------- 2. Listener: menerima data setiap ada perubahan ----------
  // useFocusEffect: sensor hanya berjalan saat tab Sensor dibuka (hemat baterai)
  useFocusEffect(
    useCallback(() => {
      if (status !== "siap" || !aktif) return;

      Accelerometer.setUpdateInterval(INTERVAL_MS);
      const subscription = Accelerometer.addListener((raw) => {
        // Proses: nilai mentah (g) -> m/s², lalu hitung magnitude
        const sampel = keMeterPerDetik(raw);
        const mag = hitungMagnitude(raw);
        setData(sampel);
        setMagnitude(mag);
        setRiwayat((lama) => [...lama.slice(-(JUMLAH_SAMPEL - 1)), sampel]);

        const sekarang = Date.now();
        if (sekarang - terakhirLog.current > 500) {
          terakhirLog.current = sekarang;
          console.log(`Accelerometer: x=${sampel.x.toFixed(2)}, y=${sampel.y.toFixed(2)}, z=${sampel.z.toFixed(2)} m/s² | ${mag.toFixed(2)} g`);
        }

        // Threshold: gerakan kuat & sudah lewat masa jeda
        if (apakahGoyang(mag, sekarang, terakhirGoyang.current)) {
          terakhirGoyang.current = sekarang;
          console.log(`[Sensor] Gerakan terdeteksi! magnitude ${mag.toFixed(2)} g > ${AMBANG_GOYANG} g`);
          setGoyang(true);
          setTimeout(() => setGoyang(false), 1500);
          saatGoyang();
        }
      });

      // Cleanup: listener dihapus saat pindah tab / komponen unmount
      return () => subscription.remove();
    }, [status, aktif, saatGoyang])
  );

  const lebarGrafik = Math.min(lebarKonten, 600) - 64;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
        <View style={[styles.kontenTengah, { maxWidth: lebarKonten }]}>
          <Text style={[styles.judulApp, { marginLeft: 0 }]} accessibilityRole="header">
            Sensor Gerak
          </Text>
          <Text style={styles.subJudul}>Accelerometer · goyang untuk sinkronisasi</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.isi, styles.kontenTengah, { maxWidth: lebarKonten }]}>
        {status === "memeriksa" && <Text style={styles.kosong}>Memeriksa sensor...</Text>}

        {status === "tidak-tersedia" && (
          <View style={styles.kotakStatus}>
            <Ionicons name="phone-portrait-outline" size={48} color={warna.teksAbu} />
            <Text style={styles.judulStatus}>Sensor tidak tersedia</Text>
            <Text style={styles.teksStatus}>
              {Platform.OS === "web"
                ? "Accelerometer tidak didukung di browser. Jalankan aplikasi di HP lewat Expo Go."
                : "Perangkat ini tidak memiliki accelerometer."}
            </Text>
          </View>
        )}

        {/* Runtime permission: jelaskan alasan sebelum meminta izin */}
        {status === "perlu-izin" && (
          <View style={styles.kotakStatus}>
            <Ionicons name="radio-outline" size={48} color={warna.utama} />
            <Text style={styles.judulStatus}>Izinkan akses sensor?</Text>
            <Text style={styles.teksStatus}>
              MyDuro ingin membaca accelerometer untuk mendeteksi goyangan HP. Goyangkan HP untuk menyinkronkan
              riwayat transaksi tanpa menekan tombol.
            </Text>
            <Pressable style={[styles.tombolAksi, { marginTop: 16 }]} onPress={mintaIzin} accessibilityRole="button" accessibilityLabel="Izinkan akses sensor">
              <Text style={styles.teksAksi}>Izinkan</Text>
            </Pressable>
            <Pressable
              style={[styles.tombolAksi, styles.tombolAksiGaris, { marginTop: 8 }]}
              onPress={() => setStatus("ditolak")}
              accessibilityRole="button"
              accessibilityLabel="Tolak akses sensor"
            >
              <Text style={[styles.teksAksi, styles.teksAksiGaris]}>Tolak</Text>
            </Pressable>
          </View>
        )}

        {/* Permission ditolak: jelaskan dan beri jalan keluar */}
        {status === "ditolak" && (
          <View style={styles.kotakStatus}>
            <Ionicons name="lock-closed-outline" size={48} color={warna.merah} />
            <Text style={styles.judulStatus} accessibilityRole="alert">
              Izin sensor ditolak
            </Text>
            <Text style={styles.teksStatus}>
              MyDuro membutuhkan izin sensor gerak untuk fitur goyang-untuk-sinkronisasi. Aktifkan lewat pengaturan.
            </Text>
            <Pressable style={[styles.tombolAksi, { marginTop: 16 }]} onPress={() => Linking.openSettings()} accessibilityRole="button">
              <Text style={styles.teksAksi}>Buka Pengaturan</Text>
            </Pressable>
            <Pressable style={[styles.tombolAksi, styles.tombolAksiGaris, { marginTop: 8 }]} onPress={mintaIzin} accessibilityRole="button">
              <Text style={[styles.teksAksi, styles.teksAksiGaris]}>Coba Lagi</Text>
            </Pressable>
          </View>
        )}

        {status === "siap" && (
          <>
            {/* ---------- Nilai X, Y, Z ---------- */}
            <View style={styles.kartuDetail}>
              <View style={styles.headerBaris}>
                <View style={styles.headerKiri}>
                  <Ionicons name="speedometer" size={20} color={warna.utama} />
                  <Text style={[styles.namaBarang, { marginLeft: 6 }]}>Accelerometer</Text>
                </View>
                <Text
                  style={[styles.lencana, { backgroundColor: aktif ? "#DCFCE7" : "#E2E8F0", color: aktif ? warna.hijau : warna.teksAbu }]}
                >
                  {aktif ? "● Sensor aktif" : "Dijeda"}
                </Text>
              </View>

              <View style={[styles.ringkasanGrid, { marginTop: 12 }]}>
                {(["x", "y", "z"] as const).map((sumbu) => (
                  <View
                    key={sumbu}
                    style={styles.kotakSumbu}
                    accessible
                    accessibilityLabel={`Sumbu ${sumbu.toUpperCase()} ${data[sumbu].toFixed(2)} meter per detik kuadrat`}
                  >
                    <Text style={[styles.labelSumbu, { color: WARNA_SUMBU[sumbu] }]}>{sumbu.toUpperCase()}</Text>
                    <Text style={styles.nilaiSumbu}>{data[sumbu].toFixed(2)}</Text>
                    <Text style={styles.detail}>m/s²</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.detail, { marginTop: 8 }]}>
                Magnitude: {magnitude.toFixed(2)} g · ambang goyang: {AMBANG_GOYANG} g
              </Text>
            </View>

            {/* ---------- Grafik real-time ---------- */}
            <View style={[styles.kartuDetail, { marginTop: 12, alignItems: "center" }]}>
              <Text style={[styles.label, { marginTop: 0, alignSelf: "flex-start" }]}>Grafik perubahan nilai (m/s²)</Text>
              <GrafikSensor riwayat={riwayat} lebar={lebarGrafik} />
            </View>

            {/* ---------- Interaksi (Task 03) ---------- */}
            <View
              style={[
                styles.kotakStatus,
                { marginTop: 12, paddingVertical: 24, backgroundColor: goyang ? "#FEF3C7" : warna.putih },
              ]}
            >
              <Ionicons name={goyang ? "phone-portrait" : "phone-portrait-outline"} size={44} color={goyang ? "#D97706" : warna.utama} />
              <Text style={styles.judulStatus} accessibilityLiveRegion="polite" accessibilityRole="alert">
                {goyang ? "Goyang Terdeteksi!" : "Siap mendeteksi gerakan"}
              </Text>
              <Text style={styles.teksStatus}>{pesanAksi}</Text>
              <Text style={[styles.detail, { marginTop: 6 }]}>
                Goyangan terdeteksi: {jumlahGoyang} kali · {daftar.length} transaksi
              </Text>
            </View>

            <Pressable
              style={[styles.tombolAksi, aktif ? styles.tombolAksiGaris : null, { marginTop: 12 }]}
              onPress={() => setAktif(!aktif)}
              accessibilityRole="button"
              accessibilityLabel={aktif ? "Jeda sensor" : "Aktifkan sensor"}
            >
              <Ionicons name={aktif ? "pause" : "play"} size={18} color={aktif ? warna.utama : warna.putih} />
              <Text style={[styles.teksAksi, aktif && styles.teksAksiGaris]}>{aktif ? "Jeda Sensor" : "Aktifkan Sensor"}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
