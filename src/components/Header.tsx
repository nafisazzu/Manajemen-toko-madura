import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showUserBadge?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'TOKO MADURA',
  subtitle = 'Buka 24 Jam Non-Stop',
  showUserBadge = true,
}) => {
  const { user, role, logout, switchUser } = useAuth();
  const router = useRouter();

  const handleUserPress = () => {
    Alert.alert(
      'Ganti Pengguna / Keluar',
      `Anda sedang masuk sebagai: ${user?.name || 'Kasir'} (${role?.toUpperCase()})`,
      [
        {
          text: role === 'pemilik' ? 'Ganti ke Kasir' : 'Ganti ke Pemilik',
          onPress: async () => {
            const target = role === 'pemilik' ? 'kasir' : 'pemilik';
            await switchUser(target);
          },
        },
        {
          text: 'Keluar (Logout)',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
        { text: 'Batal', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>24</Text>
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {showUserBadge && user && (
        <TouchableOpacity
          style={styles.userBadge}
          onPress={handleUserPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={role === 'pemilik' ? 'shield-checkmark' : 'person'}
            size={14}
            color={role === 'pemilik' ? Colors.accent : Colors.textInverse}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.userRoleText}>
            {role === 'pemilik' ? 'PEMILIK' : 'KASIR'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryDark,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    backgroundColor: Colors.accent,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoBadgeText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },
  title: {
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#A7F3D0', // light emerald
    fontSize: 11,
    fontWeight: '500',
  },
  userBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  userRoleText: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
