// =============================================
// MODUL 3 (Sprint 02) - HALAMAN REGISTER
// =============================================
import { useState } from "react";
import { Text, ScrollView, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useResponsive } from "../hooks/useResponsive";
import InputField from "../components/InputField";
import { styles, warna } from "../styles/styles";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const { lebarKonten } = useResponsive();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [error, setError] = useState("");
  const [proses, setProses] = useState(false);

  const handleDaftar = async () => {
    setError("");
    setProses(true);
    const hasil = await register(nama, email, password, konfirmasi);
    setProses(false);
    if (!hasil.ok) setError(hasil.pesan);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.isi, styles.kontenTengah, { maxWidth: Math.min(lebarKonten, 480) }]}
      >
        <InputField label="Nama lengkap" placeholder="contoh: Nafis" value={nama} onChangeText={setNama} autoComplete="name" />
        <InputField
          label="Email"
          placeholder="contoh: nafis@myduro.id"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <InputField label="Password" placeholder="Minimal 6 karakter" rahasia value={password} onChangeText={setPassword} />
        <InputField label="Konfirmasi password" placeholder="Ulangi password" rahasia value={konfirmasi} onChangeText={setKonfirmasi} />

        {error !== "" && (
          <Text style={styles.pesanError} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}

        <Pressable
          style={[styles.tombolUtama, proses && { opacity: 0.6 }]}
          onPress={handleDaftar}
          disabled={proses}
          accessibilityRole="button"
          accessibilityLabel="Daftar"
          accessibilityState={{ disabled: proses, busy: proses }}
        >
          {proses ? <ActivityIndicator color={warna.putih} /> : <Text style={styles.teksTombolUtama}>Daftar</Text>}
        </Pressable>
        <Pressable style={styles.tombolSekunder} onPress={() => router.back()} accessibilityRole="link">
          <Text style={styles.teksTombolSekunder}>Sudah punya akun? Masuk</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
