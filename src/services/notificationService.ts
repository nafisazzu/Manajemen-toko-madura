import { Platform, Alert } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * Deteksi apakah aplikasi sedang berjalan di dalam Expo Go (storeClient).
 * Sejak Expo SDK 53+, expo-notifications tidak didukung di Expo Go Android dan
 * akan melempar fatal error saat di-import.
 */
const isExpoGo = (Constants.executionEnvironment as string) === 'storeClient';

class NotificationService {
  private isHandlerConfigured = false;

  private getNotificationsModule() {
    if (isExpoGo || Platform.OS === 'web') {
      return null;
    }

    try {
      // Lazy require hanya jika BUKAN di Expo Go (misal development build / APK standalone)
      const Notifications = require('expo-notifications');

      if (!this.isHandlerConfigured && Notifications?.setNotificationHandler) {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        this.isHandlerConfigured = true;
      }

      return Notifications;
    } catch (e) {
      console.warn('[NotificationService] expo-notifications tidak dapat dimuat:', e);
      return null;
    }
  }

  /**
   * Peringatan stok menipis (stok <= 3).
   * - Di Expo Go: menggunakan Alert.alert in-app agar tidak crash.
   * - Di Development Build / APK Standalone: mengirim notifikasi lokal sistem via expo-notifications.
   */
  async notifyLowStock(
    productName: string,
    remainingStock: number,
    unit = 'pcs',
    productId?: string
  ): Promise<void> {
    const title = '⚠️ Peringatan Stok Menipis!';
    const message = `Stok "${productName}" tersisa ${remainingStock} ${unit}. Segera lakukan restok!`;

    // 1. Jika di Expo Go atau Web, gunakan Alert in-app
    if (isExpoGo || Platform.OS === 'web') {
      Alert.alert(title, message, [{ text: 'Mengerti' }]);
      return;
    }

    // 2. Jika di APK / Development Build, kirim via expo-notifications
    const Notifications = this.getNotificationsModule();
    if (!Notifications) {
      Alert.alert(title, message, [{ text: 'Mengerti' }]);
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body: message,
            data: { productId },
            sound: true,
          },
          trigger: null,
        });
      } else {
        // Fallback jika user menolak izin notifikasi
        Alert.alert(title, message, [{ text: 'Mengerti' }]);
      }
    } catch (err) {
      console.warn('[NotificationService] Gagal menjadwalkan notifikasi lokal:', err);
      Alert.alert(title, message, [{ text: 'Mengerti' }]);
    }
  }

  /**
   * Kirim batch notifikasi untuk beberapa produk stok tipis
   */
  async notifyBatchLowStock(
    products: { name: string; stock: number; unit: string; id: string }[]
  ): Promise<void> {
    if (products.length === 0) return;

    if (isExpoGo || Platform.OS === 'web') {
      const names = products.map(p => `• ${p.name} (sisa ${p.stock} ${p.unit})`).join('\n');
      Alert.alert(
        '⚠️ Peringatan Stok Menipis!',
        `Ada ${products.length} produk dengan stok kritis:\n\n${names}`,
        [{ text: 'Mengerti' }]
      );
      return;
    }

    for (const prod of products) {
      await this.notifyLowStock(prod.name, prod.stock, prod.unit, prod.id);
    }
  }
}

export const notificationService = new NotificationService();
