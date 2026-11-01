// =============================================
// MODUL 6 (Sprint 05) - OFFLINE FEEDBACK
// Banner di atas layar saat perangkat tidak terhubung internet.
// useNetInfo() otomatis memperbarui nilai saat koneksi berubah.
// =============================================
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { warna } from "../styles/styles";
import { usePengaturan } from "../context/PengaturanContext";

export default function BannerOffline() {
  const net = useNetInfo();
  const insets = useSafeAreaInsets();
  const { pengaturan } = usePengaturan();
  const offline = net.isConnected === false || pengaturan.modeSimulasi === "offline";

  if (!offline) return null;

  return (
    <View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: insets.bottom + 64, // di atas navigasi bawah
        borderRadius: 12,
        backgroundColor: "#7F1D1D",
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Ionicons name="cloud-offline" size={16} color={warna.putih} />
      <Text style={{ color: warna.putih, marginLeft: 6, fontWeight: "600" }}>
        Tidak ada koneksi internet{pengaturan.modeSimulasi === "offline" ? " (simulasi)" : ""}
      </Text>
    </View>
  );
}
