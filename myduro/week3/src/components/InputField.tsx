// =============================================
// MODUL 3 (Sprint 02) - input form yang aksesibel
// Label terlihat + accessibilityLabel, dan opsi
// tampilkan/sembunyikan password.
// =============================================
import { useState } from "react";
import { View, Text, TextInput, Pressable, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, warna } from "../styles/styles";

interface InputFieldProps extends TextInputProps {
  label: string;
  rahasia?: boolean; // true untuk password
}

export default function InputField({ label, rahasia = false, ...props }: InputFieldProps) {
  const [tampil, setTampil] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputBaris}>
        <TextInput
          {...props}
          style={[styles.input, { flex: 1 }]}
          accessibilityLabel={label}
          // Password disembunyikan (tidak ditampilkan terbuka)
          secureTextEntry={rahasia && !tampil}
          autoCapitalize={rahasia ? "none" : props.autoCapitalize}
          autoCorrect={false}
          placeholderTextColor={warna.teksAbu}
        />
        {rahasia && (
          <Pressable
            style={styles.tombolMata}
            onPress={() => setTampil(!tampil)}
            accessibilityRole="button"
            accessibilityLabel={tampil ? "Sembunyikan password" : "Tampilkan password"}
          >
            <Ionicons name={tampil ? "eye-off" : "eye"} size={22} color={warna.teksAbu} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
