import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';

export default function TabLayout() {
  const { user, role, isLoading } = useAuth();
  const { lowStockCount } = useProducts();
  const { totalItems } = useCart();

  // REQUIREMENT 5: Route di (tabs) hanya bisa diakses jika sudah login
  // 1. Tampilkan loading indikator saat sesi sedang diperiksa dari SecureStore
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // 2. Jika tidak ada user/token login, tolak akses dan arahkan ke /login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const isPemilik = role === 'pemilik';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      {/* 1. Tab Beranda */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 2. Tab Katalog API (Mengakses REST API dengan header Authorization: Bearer <token>) */}
      <Tabs.Screen
        name="katalog"
        options={{
          title: 'Katalog API',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 3. Tab Transaksi (POS Kasir) */}
      <Tabs.Screen
        name="pos"
        options={{
          title: 'Transaksi',
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.accent,
            color: '#000000',
            fontWeight: '900',
            fontSize: 10,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 4. Tab Produk (Katalog Lokal & Stok) */}
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produk',
          tabBarBadge: lowStockCount > 0 ? lowStockCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.danger,
            color: '#FFFFFF',
            fontWeight: '800',
            fontSize: 10,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 5. Tab Laporan (Khusus Pemilik - Sembunyikan untuk Kasir) */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Laporan',
          href: isPemilik ? '/(tabs)/reports' : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 6. Tab Akun (Profil, Ganti Password, Tambah Kasir, Logout) */}
      <Tabs.Screen
        name="akun"
        options={{
          title: 'Akun',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
