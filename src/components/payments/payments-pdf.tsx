
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles (Reusing similar styles from permission-pdf.tsx)
const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingBottom: 30,
        paddingHorizontal: 40,
        fontFamily: 'Times-Roman',
        fontSize: 10,
        lineHeight: 1.4,
    },
    // KOP Styles
    headerContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        paddingBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 70,
        height: 70,
        marginRight: 10,
    },
    headerTextContainer: {
        alignItems: 'center',
        marginLeft: 0,
    },
    schoolName: {
        fontFamily: 'Times-Bold',
        fontSize: 14, // Reduced slightly to prevent wrap
        textTransform: 'uppercase',
        marginBottom: 3,
        textAlign: 'center',
    },
    address: {
        fontSize: 9,
        textAlign: 'center',
        color: '#333',
    },
    meta: {
        fontSize: 9,
        textAlign: 'center',
        color: '#333',
    },
    // Title
    titleContainer: {
        marginTop: 10,
        marginBottom: 15,
        alignItems: 'center',
    },
    docTitle: {
        fontFamily: 'Times-Bold',
        fontSize: 14,
        textDecoration: 'underline',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    docSubtitle: {
        fontSize: 11,
        fontFamily: 'Times-Bold',
    },
    // Table
    table: {
        display: 'flex',
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginTop: 10,
    },
    tableRow: {
        margin: 0,
        flexDirection: 'row',
        width: '100%',
    },
    // Header Columns
    tableColHeaderIndex: {
        width: '5%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
    },
    tableColHeader: {
        width: '15%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
    },
    tableColHeaderLong: {
        width: '35%', // Increased to fill width
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
    },
    tableCellHeader: {
        margin: 5,
        fontSize: 9,
        fontWeight: 'bold',
        fontFamily: 'Times-Bold',
        textAlign: 'center',
    },
    // Data Columns
    tableColIndex: {
        width: '5%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        justifyContent: 'center',
    },
    tableCol: {
        width: '15%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        justifyContent: 'center',
    },
    tableColLong: {
        width: '35%', // Increased to fill width
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        justifyContent: 'center',
    },
    tableCell: {
        margin: 4,
        fontSize: 9,
        textAlign: 'center',
    },
    tableCellLeft: {
        margin: 4,
        fontSize: 9,
        textAlign: 'left',
        paddingLeft: 2,
    },

    // Summary
    summaryContainer: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 0, // Aligned to right edge
    },
    summaryText: {
        fontFamily: 'Times-Bold',
        fontSize: 10,
    },

    // Signatures
    datePlace: {
        marginTop: 20,
        textAlign: 'right',
        marginBottom: 10,
        marginRight: 0,
    },
    signatureSection: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    signatureBlock: {
        alignItems: 'center',
        width: '30%',
    },
    signatureTitle: {
        fontFamily: 'Times-Bold',
        marginBottom: 50,
        textAlign: 'center'
    },
    signatureName: {
        width: '100%',
        textAlign: 'center',
        fontFamily: 'Times-Bold',
        // Removed top border as requested
    },
});

interface PaymentsPDFProps {
    data: any[];
    month: number;
    year: number;
    totalCollected: number;
}

const MONTH_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const PaymentsPDF = ({ data, month, year, totalCollected }: PaymentsPDFProps) => {
    const currentDate = new Date();

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header / KOP */}
                <View style={styles.headerContainer}>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image
                        style={styles.logo}
                        src="/logo.png"
                    />
                    <View style={styles.headerTextContainer}>
                        {/* Arabic Image */}
                        <Image
                            style={{ height: 40, width: 300, objectFit: 'contain', marginBottom: 5 }}
                            src="/kop_arab.png"
                        />
                        <Text style={styles.schoolName}>PONDOK PESANTREN IMAM AD-DAMANHURI</Text>
                        <Text style={styles.address}>Puri Nirwana Gajayana 30-31. Jl. Simpang Gajayana Dinoyo Lowokwaru Malang.</Text>
                        <Text style={styles.meta}>Kode Pos 65144 NSP: 510035730102</Text>
                    </View>
                </View>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.docTitle}>LAPORAN PEMBAYARAN SYAHRIAH</Text>
                    <Text style={styles.docSubtitle}>Periode: {MONTH_NAMES[month]} {year}</Text>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    {/* Header Row */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColHeaderIndex}>
                            <Text style={styles.tableCellHeader}>No</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCellHeader}>Tanggal</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCellHeader}>NIS</Text>
                        </View>
                        <View style={styles.tableColHeaderLong}>
                            <Text style={styles.tableCellHeader}>Nama Santri</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCellHeader}>Status</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCellHeader}>Jumlah</Text>
                        </View>
                    </View>

                    {/* Data Rows */}
                    {data.map((item, index) => {
                        return (
                            <View style={styles.tableRow} key={index}>
                                <View style={styles.tableColIndex}>
                                    <Text style={styles.tableCell}>{index + 1}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{item.date || '-'}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{item.nis}</Text>
                                </View>
                                <View style={styles.tableColLong}>
                                    <Text style={styles.tableCellLeft}>{item.name}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{item.status}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>
                                        {item.amount > 0 ? `Rp ${item.amount.toLocaleString('id-ID')}` : '-'}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Total Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryText}>Total: Rp {totalCollected.toLocaleString('id-ID')}</Text>
                </View>

                {/* Footer / Signatures */}
                <View style={styles.datePlace}>
                    <Text>Malang, {currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </View>

                <View style={styles.signatureSection}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureTitle}>Bendahara</Text>
                        <Text style={styles.signatureName}>( ..................................... )</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
