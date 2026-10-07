import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface LowStockBadgeProps {
  stock: number;
  minStockWarning?: number;
  unit?: string;
  size?: 'small' | 'medium';
}

export const LowStockBadge: React.FC<LowStockBadgeProps> = ({
  stock,
  minStockWarning = 3,
  unit = 'pcs',
  size = 'medium',
}) => {
  if (stock > minStockWarning) {
    return null;
  }

  const isOutOfStock = stock <= 0;
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        isOutOfStock ? styles.outOfStockBadge : styles.lowStockBadge,
        isSmall && styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.text,
          isOutOfStock ? styles.outOfStockText : styles.lowStockText,
          isSmall && styles.textSmall,
        ]}
      >
        {isOutOfStock ? 'Stok Habis!' : `Sisa ${stock} ${unit}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowStockBadge: {
    backgroundColor: '#FEF3C7', // Amber 100
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  outOfStockBadge: {
    backgroundColor: '#FEE2E2', // Red 100
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 10,
  },
  lowStockText: {
    color: '#B45309', // Amber 800
  },
  outOfStockText: {
    color: '#B91C1C', // Red 800
  },
});
