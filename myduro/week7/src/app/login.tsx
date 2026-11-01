// =============================================
// MODUL 3 (Sprint 02) - HALAMAN LOGIN
// Alur: input -> validasi -> cek credential -> authenticated -> masuk aplikasi
// =============================================
import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useResponsive } from "../hooks/useResponsive";
import InputField from "../components/InputField";
import { styles, warna } from "../styles/styles";

export default function Login() {
  const { login, pesanSesi } = useAuth();
  const insets = useSafeAreaInsets();
  const { lebarKonten } = useResponsive();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [proses, setProses] = useState(false);

  const handleLogin = async () => {
    setError("");
    setProses(true);
    const hasil = await login(email, password);
    setProses(false);
    // Login gagal -> pengguna mendapat feedback yang jelas
    if (!hasil.ok) setError(hasil.pesan);
    // Login berhasil -> Stack.Protected otomatis membuka (tabs)
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={[styles.header, { paddingTop: insets.top + 32, paddingBottom: 32, alignItems: "center" }]}>
          <Ionicons name="storefront" size={48} color={warna.putih} />
          <Text style={[styles.judulApp, { marginLeft: 0, marginTop: 8 }]} accessibilityRole="header">
            MyDuro
          </Text>
          <Text style={styles.sapaan}>Masuk untuk melihat riwayat transaksi toko</Text>
        </View>

        <View style={[styles.isi, styles.kontenTengah, { maxWidth: Math.min(lebarKonten, 480) }]}>
          {/* Modul 5: muncul jika sebelumnya token ditolak server (401) */}
          {pesanSesi !== "" && (
            <Text style={styles.pesanError} accessibilityRole="alert">
              {pesanSesi}
            </Text>
          )}
          <InputField
            label="Email"
            placeholder="contoh: nafis@myduro.id"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <InputField
            label="Password"
            placeholder="Minimal 6 karakter"
            rahasia
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />

          {error !== "" && (
            <Text style={styles.pesanError} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}

          <Pressable
            style={[styles.tombolUtama, proses && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={proses}
            accessibilityRole="button"
            accessibilityLabel="Masuk"
            accessibilityState={{ disabled: proses, busy: proses }}
          >
            {proses ? <ActivityIndicator color={warna.putih} /> : <Text style={styles.teksTombolUtama}>Masuk</Text>}
          </Pressable>

          <Link href="/register" asChild>
            <Pressable style={styles.tombolSekunder} accessibilityRole="link" accessibilityLabel="Belum punya akun? Daftar">
              <Text style={styles.teksTombolSekunder}>Belum punya akun? Daftar</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
