import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  authService,
  ROLE_KASIR,
  SessionUser,
} from "@/services/auth/authService";

const C = {
  green: "#0F3D28",
  greenSoft: "#E3ECE6",
  amber: "#E6A122",
  bg: "#F2F5F3",
  ink: "#16241C",
  muted: "#5C6B62",
  border: "#CBD6CF",
  danger: "#B3261E",
  white: "#FFFFFF",
};

const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Terjadi kesalahan.";

export default function AkunScreen() {
  const { user, isOwner, logout, changePassword, addCashier, removeCashier } =
    useAuth();
  const router = useRouter();

  // Ganti password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Tambah kasir (khusus pemilik)
  const [cashierName, setCashierName] = useState("");
  const [cashierUsername, setCashierUsername] = useState("");
  const [cashierPassword, setCashierPassword] = useState("");
  const [cashiers, setCashiers] = useState<SessionUser[]>([]);

  const loadCashiers = useCallback(async () => {
    const accounts = await authService.listAccounts();
    setCashiers(accounts.filter((a) => a.role === ROLE_KASIR));
  }, []);

  useEffect(() => {
    if (isOwner) loadCashiers();
  }, [isOwner, loadCashiers]);

  if (!user) return null;

  const handleChangePassword = async () => {
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      Alert.alert(
        "Password diganti",
        "Gunakan password baru saat masuk berikutnya.",
      );
    } catch (e) {
      Alert.alert("Gagal mengganti password", errorMessage(e));
    }
  };

  const handleAddCashier = async () => {
    try {
      await addCashier({
        name: cashierName,
        username: cashierUsername,
        password: cashierPassword,
      });
      setCashierName("");
      setCashierUsername("");
      setCashierPassword("");
      await loadCashiers();
      Alert.alert(
        "Kasir ditambahkan",
        "Akun kasir baru sudah bisa dipakai untuk masuk.",
      );
    } catch (e) {
      Alert.alert("Gagal menambah kasir", errorMessage(e));
    }
  };

  const confirmRemoveCashier = (cashier: SessionUser) => {
    Alert.alert(
      "Hapus akun kasir?",
      `${cashier.name} (${cashier.username}) tidak akan bisa masuk lagi.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await removeCashier(cashier.id);
              await loadCashiers();
            } catch (e) {
              Alert.alert("Gagal menghapus", errorMessage(e));
            }
          },
        },
      ],
    );
  };

  const confirmLogout = () => {
    Alert.alert(
      "Keluar dari akun?",
      "Sesi akan dihapus dan kamu perlu masuk lagi.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.profileUsername}>@{user.username}</Text>
        </View>
        <View style={[styles.roleBadge, isOwner && styles.roleOwner]}>
          <Text style={[styles.roleText, isOwner && styles.roleTextOwner]}>
            {isOwner ? "Pemilik" : "Kasir"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ganti password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password lama"
          placeholderTextColor={C.muted}
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Password baru (minimal 4 karakter)"
          placeholderTextColor={C.muted}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <Pressable style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Simpan password</Text>
        </Pressable>
      </View>

      {isOwner && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Akun kasir</Text>
          {cashiers.length === 0 ? (
            <Text style={styles.empty}>
              Belum ada kasir. Tambahkan akun di bawah.
            </Text>
          ) : (
            cashiers.map((c) => (
              <View key={c.id} style={styles.cashierRow}>
                <Ionicons
                  name="person-circle-outline"
                  size={28}
                  color={C.green}
                />
                <View style={styles.flex}>
                  <Text style={styles.cashierName}>{c.name}</Text>
                  <Text style={styles.username}>@{c.username}</Text>
                </View>
                <Pressable
                  onPress={() => confirmRemoveCashier(c)}
                  accessibilityLabel={`Hapus akun ${c.name}`}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={20} color={C.danger} />
                </Pressable>
              </View>
            ))
          )}

          <Text style={styles.subTitle}>Tambah kasir</Text>
          <TextInput
            style={styles.input}
            placeholder="Nama kasir"
            placeholderTextColor={C.muted}
            value={cashierName}
            onChangeText={setCashierName}
          />
          <TextInput
            style={styles.input}
            placeholder="Username (huruf kecil, angka, _)"
            placeholderTextColor={C.muted}
            autoCapitalize="none"
            autoCorrect={false}
            value={cashierUsername}
            onChangeText={setCashierUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={C.muted}
            secureTextEntry
            value={cashierPassword}
            onChangeText={setCashierPassword}
          />
          <Pressable style={styles.button} onPress={handleAddCashier}>
            <Text style={styles.buttonText}>Tambah kasir</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.section, styles.storageInfo]}>
        <Text style={styles.sectionTitle}>Tempat data disimpan</Text>
        <Text style={styles.info}>
          <Text style={styles.bold}>Secure storage: </Text>
          sesi login dan data akun yang sedang masuk, terenkripsi oleh sistem
          HP.
        </Text>
        <Text style={styles.info}>
          <Text style={styles.bold}>Local storage: </Text>
          produk, transaksi, daftar akun (password hanya disimpan sebagai hash),
          dan pilihan "ingat username".
        </Text>
      </View>

      <Pressable style={styles.logout} onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={20} color={C.danger} />
        <Text style={styles.logoutText}>Keluar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  container: { padding: 16, paddingBottom: 40 },
  flex: { flex: 1 },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.green,
    borderRadius: 16,
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "800", color: C.green },
  name: { fontSize: 18, fontWeight: "700", color: C.white },
  username: { fontSize: 13, color: C.muted },
  profileUsername: { fontSize: 13, color: "#B9CCBF" },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: C.greenSoft,
  },
  roleOwner: { backgroundColor: C.amber },
  roleText: { fontSize: 12, fontWeight: "700", color: C.green },
  roleTextOwner: { color: C.green },
  section: {
    marginTop: 16,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 8,
  },
  subTitle: { fontSize: 14, fontWeight: "700", color: C.ink, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: C.ink,
    marginTop: 8,
  },
  button: {
    marginTop: 12,
    backgroundColor: C.green,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  buttonText: { color: C.white, fontWeight: "700", fontSize: 15 },
  empty: { color: C.muted, fontSize: 14 },
  cashierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  cashierName: { fontSize: 15, fontWeight: "600", color: C.ink },
  storageInfo: { backgroundColor: C.greenSoft },
  info: { fontSize: 14, color: C.ink, lineHeight: 21, marginTop: 4 },
  bold: { fontWeight: "700" },
  logout: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.danger,
  },
  logoutText: { color: C.danger, fontWeight: "700", fontSize: 15 },
});
