import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';

export default function TabLayout() {
  const { role } = useAuth();
  const { lowStockCount } = useProducts();
  const { totalItems } = useCart();

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
          fontSize: 11,
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
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* 2. Tab Transaksi (POS Kasir) */}
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
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />

      {/* 3. Tab Produk (Katalog & Stok) */}
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
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />

      {/* 4. Tab Laporan (Khusus Pemilik - Sembunyikan untuk Kasir) */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Laporan',
          // href: null menyembunyikan tombol tab dari bottom bar jika role kasir
          href: isPemilik ? '/(tabs)/reports' : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
