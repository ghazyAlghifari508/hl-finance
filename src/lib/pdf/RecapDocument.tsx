import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { RecapData } from "@/app/actions/recap";

// Parker Style System (from DESIGN.md) mapped to react-pdf
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#1b1d20",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e1dfd8",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6e6e6e",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
    textTransform: "uppercase",
    color: "#6e6e6e",
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f2f1ec",
    padding: 15,
    borderRadius: 8,
  },
  summaryBlock: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#6e6e6e",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  valuePositive: {
    color: "#5196fe",
  },
  valueWarning: {
    color: "#f9754e",
  },
  table: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#e1dfd8",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e1dfd8",
    backgroundColor: "#f2f1ec",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e1dfd8",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  colLeft: { flex: 2, fontSize: 10 },
  colRight: { flex: 1, fontSize: 10, textAlign: "right" },
  thText: { fontSize: 10, fontWeight: "bold", color: "#6e6e6e" },
});

const formatIDR = (val: number) => {
  return "Rp " + val.toLocaleString("id-ID");
};

interface RecapDocumentProps {
  period: string;
  mode?: "month" | "year";
  data: RecapData;
}

export const RecapDocument = ({ period, mode = "month", data }: RecapDocumentProps) => {
  let periodLabel: string;
  if (mode === "year") {
    periodLabel = period;
  } else {
    const [year, month] = period.split("-");
    const dateObj = new Date(Number(year), Number(month) - 1, 1);
    periodLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(dateObj);
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Recap Bisnis</Text>
          <Text style={styles.subtitle}>Periode: {periodLabel} | HL Sales</Text>
        </View>

        {/* OVERALL SUMMARY */}
        <Text style={styles.sectionTitle}>Ringkasan Keseluruhan (Cash Basis)</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Total Omzet Lunas</Text>
            <Text style={styles.summaryValue}>{formatIDR(data.overall.totalOmzet)}</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Total Laba Lunas</Text>
            <Text style={[styles.summaryValue, styles.valuePositive]}>{formatIDR(data.overall.totalLaba)}</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Piutang Aktif</Text>
            <Text style={[styles.summaryValue, styles.valueWarning]}>{formatIDR(data.overall.totalPiutang)}</Text>
          </View>
        </View>

        {/* PER TYPE SUMMARY */}
        <Text style={styles.sectionTitle}>Kinerja Per Tipe Produk</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colLeft, styles.thText]}>Tipe Produk</Text>
            <Text style={[styles.colRight, styles.thText]}>Omzet</Text>
            <Text style={[styles.colRight, styles.thText]}>Laba HL</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colLeft}>Logam Mulia (LM)</Text>
            <Text style={styles.colRight}>{formatIDR(data.byType.omzetLM)}</Text>
            <Text style={[styles.colRight, styles.valuePositive]}>{formatIDR(data.byType.labaLM)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colLeft}>Barang (BR)</Text>
            <Text style={styles.colRight}>{formatIDR(data.byType.omzetBR)}</Text>
            <Text style={[styles.colRight, styles.valuePositive]}>{formatIDR(data.byType.labaBR)}</Text>
          </View>
        </View>

        {/* CUSTOMER LIST */}
        <Text style={styles.sectionTitle}>Detail Per Customer</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colLeft, styles.thText]}>Nama Customer</Text>
            <Text style={[styles.colRight, styles.thText]}>Omzet Lunas</Text>
            <Text style={[styles.colRight, styles.thText]}>Piutang Aktif</Text>
          </View>
          {data.byCustomer.map((c) => (
            <View key={c.customerId} style={styles.tableRow}>
              <Text style={styles.colLeft}>{c.customerName}</Text>
              <Text style={styles.colRight}>{formatIDR(c.totalOmzet)}</Text>
              <Text style={[styles.colRight, c.totalPiutang > 0 ? styles.valueWarning : {}]}>
                {formatIDR(c.totalPiutang)}
              </Text>
            </View>
          ))}
          {data.byCustomer.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={{ fontSize: 10, color: "#6e6e6e", padding: 10 }}>Tidak ada data transaksi.</Text>
            </View>
          )}
        </View>

        {/* BONUS LOG (AC-7.7) — dilaporkan terpisah, di luar omzet/laba */}
        <Text style={styles.sectionTitle}>Log Bonus (Tidak Dihitung Omzet/Laba)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colLeft, styles.thText]}>Nomor Bon</Text>
            <Text style={[styles.colLeft, styles.thText]}>Customer</Text>
            <Text style={[styles.colRight, styles.thText]}>Jumlah Bonus</Text>
          </View>
          {data.bonusLog.map((b) => (
            <View key={b.bonId} style={styles.tableRow}>
              <Text style={styles.colLeft}>{b.nomorBon}</Text>
              <Text style={styles.colLeft}>{b.customerName}</Text>
              <Text style={[styles.colRight, styles.valuePositive]}>{b.bonusCount}</Text>
            </View>
          ))}
          {data.bonusLog.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={{ fontSize: 10, color: "#6e6e6e", padding: 10 }}>Tidak ada transaksi bonus.</Text>
            </View>
          )}
        </View>

      </Page>
    </Document>
  );
};
