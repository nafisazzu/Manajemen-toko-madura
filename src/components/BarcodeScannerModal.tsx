import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Button } from './Button';
import { Input } from './Input';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  visible,
  onClose,
  onScan,
  title = 'Pindai Barcode Produk',
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
    setTimeout(() => {
      setScanned(false);
      onClose();
    }, 500);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert('Peringatan', 'Masukkan kode barcode terlebih dahulu.');
      return;
    }
    onScan(manualCode.trim());
    setManualCode('');
    setShowManualInput(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Camera or Fallback */}
        {Platform.OS === 'web' ? (
          <View style={styles.fallbackBox}>
            <Ionicons name="barcode-outline" size={64} color={Colors.primary} />
            <Text style={styles.fallbackTitle}>Mode Web Terdeteksi</Text>
            <Text style={styles.fallbackDesc}>
              Gunakan input manual barcode di bawah untuk mencari produk.
            </Text>
          </View>
        ) : !permission ? (
          <View style={styles.fallbackBox}>
            <Text style={styles.fallbackDesc}>Memeriksa izin kamera...</Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.fallbackBox}>
            <Ionicons name="camera-reverse-outline" size={56} color={Colors.warning} />
            <Text style={styles.fallbackTitle}>Izin Kamera Diperlukan</Text>
            <Text style={styles.fallbackDesc}>
              Aplikasi membutuhkan izin kamera untuk memindai barcode produk di kasir.
            </Text>
            <Button
              title="Izinkan Kamera"
              onPress={requestPermission}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: [
                  'qr',
                  'ean13',
                  'ean8',
                  'code128',
                  'code39',
                  'upc_a',
                  'upc_e',
                ],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />

            {/* Overlay Viewfinder */}
            <View style={styles.overlay}>
              <View style={styles.scanTarget}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                {scanned && (
                  <View style={styles.scannedIndicator}>
                    <Ionicons name="checkmark-circle" size={48} color={Colors.emerald} />
                    <Text style={styles.scannedText}>Barcode Terdeteksi!</Text>
                  </View>
                )}
              </View>
              <Text style={styles.scanInstruction}>
                Arahkan kamera ke barcode kemasan produk
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Actions & Manual Input */}
        <View style={styles.bottomBar}>
          {showManualInput ? (
            <View style={styles.manualInputRow}>
              <Input
                placeholder="Ketik angka barcode (cth: 8992...)"
                value={manualCode}
                onChangeText={setManualCode}
                keyboardType="numeric"
                style={{ flex: 1 }}
                onSubmitEditing={handleManualSubmit}
              />
              <Button
                title="Cari"
                onPress={handleManualSubmit}
                size="medium"
                style={{ marginLeft: 8, height: 46 }}
              />
            </View>
          ) : (
            <Button
              title="Ketik Barcode Manual"
              variant="outline"
              icon="keypad-outline"
              onPress={() => setShowManualInput(true)}
              style={styles.manualToggleBtn}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scanTarget: {
    width: 280,
    height: 180,
    borderRadius: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.accent,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanInstruction: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scannedIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 16,
    borderRadius: 12,
  },
  scannedText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 6,
  },
  fallbackBox: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  fallbackDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  bottomBar: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  manualToggleBtn: {
    backgroundColor: '#FFFFFF',
  },
  manualInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
