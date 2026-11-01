// =============================================
// MODUL 2 (Sprint 01) - NAVIGASI BAWAH (Tabs)
// =============================================
import { Tabs } from "expo-router";
import { ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { warna } from "../../styles/styles";

type NamaIkon = keyof typeof Ionicons.glyphMap;

function ikonTab(nama: NamaIkon) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={nama} size={size} color={color as string} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: warna.utama,
        tabBarInactiveTintColor: warna.teksAbu,
        // Label tetap tampil: navigasi tidak hanya mengandalkan ikon (inklusif)
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ikonTab("home"),
          tabBarAccessibilityLabel: "Beranda, ringkasan toko",
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat",
          tabBarIcon: ikonTab("receipt"),
          tabBarAccessibilityLabel: "Riwayat transaksi",
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ikonTab("person-circle"),
          tabBarAccessibilityLabel: "Profil toko",
        }}
      />
    </Tabs>
  );
}
