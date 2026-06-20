import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#ffffff", color: "#1b1d20" },
  header: { marginBottom: 30, borderBottomWidth: 1, borderBottomColor: "#e1dfd8", paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#6e6e6e" },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginTop: 20, marginBottom: 12, textTransform: "uppercase", color: "#6e6e6e" },
  summaryGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, backgroundColor: "#f2f1ec", padding: 15, borderRadius: 8 },
  summaryBlock: { flex: 1 },
  summaryLabel: { fontSize: 10, color: "#6e6e6e", marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: "bold" },
  valueWarning: { color: "#f9754e" },
  valuePositive: { color: "#5196fe" },
  table: { width: "100%", borderTopWidth: 1, borderTopColor: "#e1dfd8" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e1dfd8", backgroundColor: "#f2f1ec", paddingVertical: 8, paddingHorizontal: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e1dfd8", paddingVertical: 8, paddingHorizontal: 4 },
  col1: { flex: 2, fontSize: 10 },
  col2: { flex: 1.5, fontSize: 10 },
  col3: { flex: 1.5, fontSize: 10 },
  col4: { flex: 2, fontSize: 10, textAlign: "right" },
  thText: { fontSize: 10, fontWeight: "bold", color: "#6e6e6e" },
});

const formatIDR = (val: number) => "Rp " + val.toLocaleString("id-ID");
const formatDate = (iso: string | Date) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(iso));

interface CustomerStatementProps {
  customer: any;
  bons: any[];
  monthStr: string;
  totals: {
    piutang: number;
    lunas: number;
    omzet: number;
  };
}

export const CustomerStatementDocument = ({ customer, bons, monthStr, totals }: CustomerStatementProps) => {
  const [year, month] = monthStr.split("-");
  const monthName = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(Number(year), Number(month) - 1, 1));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Buku Besar Pelanggan</Text>
          <Text style={styles.subtitle}>{customer.name} | Periode: {monthName}</Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Total Piutang Aktif</Text>
            <Text style={[styles.summaryValue, totals.piutang > 0 ? styles.valueWarning : {}]}>{formatIDR(totals.piutang)}</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Total Dibayar</Text>
            <Text style={[styles.summaryValue, styles.valuePositive]}>{formatIDR(totals.lunas)}</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Total Omzet Lunas</Text>
            <Text style={styles.summaryValue}>{formatIDR(totals.omzet)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Daftar Transaksi (Bon)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.thText]}>Nomor Bon</Text>
            <Text style={[styles.col2, styles.thText]}>Tanggal</Text>
            <Text style={[styles.col3, styles.thText]}>Status</Text>
            <Text style={[styles.col4, styles.thText]}>Tagihan</Text>
          </View>
          {bons.map((bon) => (
            <View key={bon.id} style={styles.tableRow}>
              <Text style={styles.col1}>{bon.nomorBon} {bon.isBonus ? "(Bonus)" : ""}</Text>
              <Text style={styles.col2}>{formatDate(bon.tanggal)}</Text>
              <Text style={[styles.col3, bon.status === "piutang" ? styles.valueWarning : styles.valuePositive]}>
                {bon.status === "piutang" ? "Piutang" : `Lunas (${formatDate(bon.paymentDate!)})`}
              </Text>
              <Text style={styles.col4}>{formatIDR(Number(bon.totalOwed))}</Text>
            </View>
          ))}
          {bons.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={{ fontSize: 10, color: "#6e6e6e", padding: 10 }}>Tidak ada transaksi di bulan ini.</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
