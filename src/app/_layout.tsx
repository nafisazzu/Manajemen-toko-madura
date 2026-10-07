import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/AuthContext';
import { ProductProvider } from '@/context/ProductContext';
import { CartProvider } from '@/context/CartContext';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="product/new"
                options={{
                  presentation: 'modal',
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="product/edit"
                options={{
                  presentation: 'modal',
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="product/restock"
                options={{
                  presentation: 'modal',
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="product/[id]"
                options={{
                  presentation: 'card',
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="transaction/[id]"
                options={{
                  presentation: 'modal',
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="transaction/history"
                options={{
                  presentation: 'card',
                  headerShown: false,
                }}
              />
            </Stack>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
