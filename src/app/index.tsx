import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoBadgeText}>24</Text>
      </View>
      <Text style={styles.title}>TOKO MADURA</Text>
      <Text style={styles.subtitle}>Sistem Manajemen Kasir & Toko Kelontong</Text>
      <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    backgroundColor: Colors.accent,
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  logoBadgeText: {
    color: '#000000',
    fontSize: 30,
    fontWeight: '900',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textInverse,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#A7F3D0',
    marginTop: 6,
    textAlign: 'center',
  },
});
