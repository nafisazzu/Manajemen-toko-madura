import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TransaksiProvider } from "../context/TransaksiContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { PengaturanProvider } from "../context/PengaturanContext";
import BannerOffline from "../components/BannerOffline";
import { styles, warna } from "../styles/styles";

function Navigasi() {
  const { status } = useAuth();

  // Masih membaca sesi dari SecureStore
  if (status === "memuat") {
    return (
      <View style={styles.tengah} accessible accessibilityLabel="Memeriksa sesi login">
        <ActivityIndicator size="large" color={warna.utama} />
      </View>
    );
  }

  const sudahLogin = status === "masuk";

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: warna.utama },
        headerTintColor: warna.putih,
        headerTitleAlign: "center",
      }}
    >
      {/* MODUL 3: halaman aplikasi hanya bisa dibuka jika sudah login */}
      <Stack.Protected guard={sudahLogin}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tambah" options={{ title: "Tambah Transaksi" }} />
        <Stack.Screen name="detail/[id]" options={{ title: "Detail Transaksi" }} />
        <Stack.Screen name="uji-keamanan" options={{ title: "Uji Keamanan" }} />
      </Stack.Protected>

      {/* Halaman login/register hanya untuk yang BELUM login */}
      <Stack.Protected guard={!sudahLogin}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: "Buat Akun" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PengaturanProvider>
      <AuthProvider>
        <TransaksiProvider>
          <StatusBar style="light" />
          <Navigasi />
          <BannerOffline />
        </TransaksiProvider>
      </AuthProvider>
    </PengaturanProvider>
  );
}
