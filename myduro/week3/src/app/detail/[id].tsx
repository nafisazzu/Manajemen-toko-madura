import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTransaksi } from "../../context/TransaksiContext";
import { hitungTotal, formatRupiah, formatTanggal } from "../../utils/hitung";
import { styles, warna } from "../../styles/styles";

function BarisDetail({ label, nilai }: { label: string; nilai: string }) {
  return (
    <View style={styles.barisDetail}>
      <Text style={styles.labelDetail}>{label}</Text>
      <Text style={styles.nilaiDetail}>{nilai}</Text>
    </View>
  );
}

export default function DetailTransaksi() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { daftar } = useTransaksi();
  const trx = daftar.find((t) => t.id === id);

  const handleKembali = () => {
    // canGoBack: pengaman jika halaman dibuka tanpa riwayat sebelumnya
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (!trx) {
    return (
      <View style={styles.tengah}>
        <Text>Transaksi tidak ditemukan.</Text>
        <Pressable style={styles.tombolUtama} onPress={handleKembali}>
          <Text style={styles.teksTombolUtama}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const isPenjualan = trx.jenis === "penjualan";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.isi}>
      <View style={styles.kartuDetail}>
        <BarisDetail label="ID" nilai={trx.id} />
        <BarisDetail label="Tanggal" nilai={formatTanggal(trx.tanggal)} />
        <BarisDetail label="Jenis" nilai={trx.jenis} />
        <BarisDetail label="Barang" nilai={trx.namaBarang} />
        <BarisDetail label="Jumlah" nilai={`${trx.jumlah} ${trx.satuan}`} />
        <BarisDetail label="Harga satuan" nilai={formatRupiah(trx.hargaSatuan)} />
        <BarisDetail label="Catatan" nilai={trx.catatan ?? "-"} />
        <Text
          style={[
            styles.totalPreview,
            { color: isPenjualan ? warna.hijau : warna.merah },
          ]}
        >
          Total: {formatRupiah(hitungTotal(trx))}
        </Text>
      </View>

      <Pressable style={styles.tombolUtama} onPress={handleKembali}>
        <Text style={styles.teksTombolUtama}>Kembali</Text>
      </Pressable>
    </ScrollView>
  );
}