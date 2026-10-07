import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth/authService";

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

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUsername, setRememberUsername] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Isi otomatis username yang diingat (dari AsyncStorage).
  useEffect(() => {
    authService.getRememberedUsername().then((saved) => {
      if (saved) {
        setUsername(saved);
        setRememberUsername(true);
      }
    });
  }, []);

  const handleLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password, rememberUsername);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal masuk. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>24</Text>
          </View>
          <Text style={styles.title}>Toko Madura</Text>
          <Text style={styles.subtitle}>Masuk untuk mulai berjualan</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="contoh: kasir"
            placeholderTextColor={C.muted}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            returnKeyType="next"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={C.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eye}
              accessibilityLabel={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={C.muted}
              />
            </Pressable>
          </View>

          <View style={styles.rememberRow}>
            <Text style={styles.rememberText}>Ingat username</Text>
            <Switch
              value={rememberUsername}
              onValueChange={setRememberUsername}
              trackColor={{ true: C.green, false: C.border }}
              thumbColor={C.white}
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={C.danger}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              (pressed || submitting) && styles.buttonPressed,
            ]}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={styles.buttonText}>Masuk</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.demo}>
          <Text style={styles.demoTitle}>Akun uji coba</Text>
          <Text style={styles.demoText}>Pemilik: pemilik / admin123</Text>
          <Text style={styles.demoText}>Kasir: kasir / 1234</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 5,
    borderBottomColor: C.amber,
  },
  badgeText: { color: C.amber, fontSize: 28, fontWeight: "800" },
  title: { marginTop: 16, fontSize: 28, fontWeight: "800", color: C.green },
  subtitle: { marginTop: 4, fontSize: 15, color: C.muted },
  form: { backgroundColor: C.white, borderRadius: 16, padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: C.ink,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: C.ink,
    backgroundColor: C.white,
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  passwordInput: { flex: 1, paddingRight: 48 },
  eye: { position: "absolute", right: 12, padding: 4 },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  rememberText: { fontSize: 15, color: C.ink },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FBEAE8",
  },
  errorText: { flex: 1, color: C.danger, fontSize: 14 },
  button: {
    marginTop: 20,
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: C.white, fontSize: 16, fontWeight: "700" },
  demo: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.greenSoft,
  },
  demoTitle: { fontWeight: "700", color: C.green, marginBottom: 4 },
  demoText: { color: C.ink, fontSize: 14, lineHeight: 22 },
});
