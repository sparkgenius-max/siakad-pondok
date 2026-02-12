import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingBottom: 30,
        paddingHorizontal: 50, // Added left/right padding
        fontFamily: 'Times-Roman', // Standard PDF Font
        fontSize: 11,
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
        // position: 'relative', // Removed relative
    },
    logo: {
        width: 70,
        height: 70,
        marginRight: 10, // Add gap
        // Removed absolute positioning
    },
    headerTextContainer: {
        // flexGrow: 1, // Removed flexGrow
        alignItems: 'center',
        marginLeft: 0,
    },
    arabicTitle: {
        fontFamily: 'Times-Bold',
        fontSize: 18,
        marginBottom: 5,
        color: '#006400',
    },
    schoolName: {
        fontFamily: 'Times-Bold',
        fontSize: 14,
        textTransform: 'uppercase',
        marginBottom: 3,
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
    // Document Title
    titleContainer: {
        marginTop: 15,
        marginBottom: 20,
        alignItems: 'center',
    },
    docTitle: {
        fontFamily: 'Times-Bold',
        fontSize: 14,
        textDecoration: 'underline',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    docNumber: {
        fontSize: 11,
        fontFamily: 'Times-Bold',
    },
    // Body
    body: {
        marginBottom: 20,
    },
    paragraph: {
        marginBottom: 10,
        textIndent: 30,
        textAlign: 'justify'
    },
    intro: {
        marginBottom: 10,
    },
    detailsContainer: {
        marginLeft: 30,
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    detailLabel: {
        width: 100,
        fontFamily: 'Times-Roman',
    },
    detailSeparator: {
        width: 10,
        textAlign: 'center',
    },
    detailValue: {
        flex: 1,
        fontFamily: 'Times-Bold',
    },
    reasonContainer: {
        marginTop: 5,
        marginBottom: 20,
        paddingHorizontal: 40, // Indent for reason field
    },
    reasonText: {
        fontFamily: 'Times-Italic',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        borderBottomStyle: 'dotted', // Dotted line
        paddingBottom: 2,
        marginTop: 5,
        textAlign: 'center'
    },
    closing: {
        marginTop: 10,
        textAlign: 'justify',
    },
    // Date Place
    datePlace: {
        marginTop: 20,
        textAlign: 'right',
        marginBottom: 20,
        marginRight: 0, // Adjusted as page has padding now
    },
    // Signatures
    signatureSection: {
        marginTop: 10,
    },
    mengetahuiTitle: {
        textAlign: 'center',
        marginBottom: 20, // Increased gap
        fontFamily: 'Times-Bold',
        fontSize: 13, // Increased +2px (11+2)
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 60,
        paddingHorizontal: 10,
    },
    signatureBlock: {
        alignItems: 'center',
        width: '40%',
    },
    signatureTitle: {
        fontFamily: 'Times-Bold',
        marginBottom: 50,
    },
    signatureName: {
        width: '100%',
        textAlign: 'center',
        paddingTop: 5,
        fontFamily: 'Times-Roman',
    },
    centerSignature: {
        alignItems: 'center',
        marginTop: -20,
    },
});

export const PermissionDocument = ({ data }: { data: any }) => {
    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '...';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getDayName = (dateString: string) => {
        if (!dateString) return '...';
        return new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long' });
    };

    const getJustDate = (dateString: string) => {
        if (!dateString) return '...';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const currentDate = new Date();
    const monthRoman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][currentDate.getMonth()];
    const year = currentDate.getFullYear();

    // Fake number generation based on ID or count
    const letterNumber = data.number || '001';

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
                        {/* <Text style={styles.arabicTitle}>المعهد الإسلامي إمام الدمنهوري</Text> */}
                        <Text style={styles.schoolName}>PONDOK PESANTREN IMAM AD-DAMANHURI</Text>
                        <Text style={styles.address}>Puri Nirwana Gajayana 30-31. Jl. Simpang Gajayana Dinoyo Lowokwaru Malang.</Text>
                        <Text style={styles.meta}>Kode Pos 65144 NSP: 510035730102</Text>
                    </View>
                </View>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.docTitle}>SURAT KETERANGAN</Text>
                    <Text style={styles.docNumber}>Nomor : SI/ {letterNumber} / PPID / {monthRoman} / {year}</Text>
                </View>

                {/* Body */}
                <View style={styles.body}>
                    <Text style={styles.intro}>
                        Yang bertanda tangan di bawah ini kami pengurus Pondok Pesantren Imam Ad-Damanhuri memberitahukan bahwa :
                    </Text>

                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Nama</Text>
                            <Text style={styles.detailSeparator}>:</Text>
                            <Text style={styles.detailValue}>{data.santri?.name || '................'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Kelas</Text>
                            <Text style={styles.detailSeparator}>:</Text>
                            <Text style={styles.detailValue}>{data.santri?.class || '................'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Hari</Text>
                            <Text style={styles.detailSeparator}>:</Text>
                            <Text style={styles.detailValue}>{getDayName(data.start_date)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tanggal</Text>
                            <Text style={styles.detailSeparator}>:</Text>
                            <Text style={styles.detailValue}>{getJustDate(data.start_date)}</Text>
                        </View>
                    </View>

                    <Text style={styles.paragraph}>
                        Benar-benar tidak dapat mengikuti kelas sebagaimana mestinya dikarenakan :
                    </Text>

                    <View style={styles.reasonContainer}>
                        <Text style={styles.reasonText}>{data.reason || '................................................'}</Text>
                    </View>

                    <Text style={styles.closing}>
                        Demikian surat keterangan ini kami buat dengan sebenarnya dan semoga maklum dan periksa adanya.
                    </Text>
                </View>

                {/* Date Place */}
                <View style={styles.datePlace}>
                    <Text>Malang, {currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </View>

                {/* Signatures */}
                <View style={styles.signatureSection}>
                    <Text style={styles.mengetahuiTitle}>Mengetahui</Text>

                    <View style={styles.signatureRow}>
                        <View style={styles.signatureBlock}>
                            <Text style={styles.signatureTitle}>Divisi Keamanan</Text>
                            <Text style={styles.signatureName}>(.....................................................)</Text>
                        </View>
                        <View style={styles.signatureBlock}>
                            <Text style={styles.signatureTitle}>Ketua Kamar</Text>
                            <Text style={styles.signatureName}>(.....................................................)</Text>
                        </View>
                    </View>

                    <View style={styles.centerSignature}>
                        <View style={styles.signatureBlock}>
                            <Text style={styles.signatureTitle}>Pengasuh</Text>
                            <Text style={styles.signatureName}>(.....................................................)</Text>
                        </View>
                    </View>
                </View>

            </Page>
        </Document>
    );
};
