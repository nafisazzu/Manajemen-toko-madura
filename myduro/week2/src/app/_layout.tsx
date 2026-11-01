import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TransaksiProvider } from "../context/TransaksiContext";
import { warna } from "../styles/styles";

export default function RootLayout() {
  return (
    <TransaksiProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: warna.utama },
          headerTintColor: warna.putih,
          headerTitleAlign: "center",
        }}
      >
        {/* (tabs) = grup halaman dengan navigasi bawah: Beranda, Riwayat, Profil */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tambah" options={{ title: "Tambah Transaksi" }} />
        <Stack.Screen name="detail/[id]" options={{ title: "Detail Transaksi" }} />
      </Stack>
    </TransaksiProvider>
  );
}
