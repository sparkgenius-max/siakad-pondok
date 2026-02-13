
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Define styles (matching permission-pdf.tsx + tables)
const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingBottom: 30,
        paddingHorizontal: 40,
        fontFamily: 'Times-Roman',
        fontSize: 11,
        lineHeight: 1.3,
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
        width: 60,
        height: 60,
        marginRight: 10,
    },
    headerTextContainer: {
        alignItems: 'center',
        marginLeft: 0,
    },
    schoolName: {
        fontFamily: 'Times-Bold',
        fontSize: 14,
        textTransform: 'uppercase',
        marginBottom: 3,
        color: '#006400',
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
        marginBottom: 4,
    },
    subTitle: {
        fontFamily: 'Times-Bold',
        fontSize: 12,
    },

    // Student Info
    infoContainer: {
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoColumn: {
        width: '48%',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    infoLabel: {
        width: 80,
    },
    infoSeparator: {
        width: 10,
        textAlign: 'center',
    },
    infoValue: {
        flex: 1,
        fontFamily: 'Times-Bold',
    },

    // Tables
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 15,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 20,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        fontFamily: 'Times-Bold',
        textAlign: 'center',
        fontSize: 10,
    },
    tableCell: {
        padding: 4,
        fontSize: 10,
        borderRightWidth: 1,
        borderRightColor: '#000',
        textAlign: 'center',
    },
    tableCellLeft: {
        textAlign: 'left',
        paddingLeft: 5,
    },
    lastCell: {
        borderRightWidth: 0,
    },

    // Signatures
    signatureSection: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBlock: {
        width: '30%',
        alignItems: 'center',
    },
    signatureTitle: {
        marginBottom: 50,
        textAlign: 'center',
    },
    signatureName: {
        textAlign: 'center',
        width: '100%',
        paddingBottom: 2,
    },
    datePlace: {
        textAlign: 'right',
        marginBottom: 10,
        marginTop: 10,
    }
});

export const ReportDocument = ({ data }: { data: any }) => {
    // Current date for signature
    const signatureDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const isTahfidz = data.program === 'Tahfidz';

    // Aggregate Hafalan for Tahfidz (Monthly)
    const hafalanByMonth: Record<string, { ziyadah: number, murojaah: number }> = {};
    if (isTahfidz && data.hafalan) {
        data.hafalan.forEach((h: any) => {
            const date = new Date(h.date);
            const monthKey = date.toLocaleDateString('id-ID', { month: 'long' }).toUpperCase();
            if (!hafalanByMonth[monthKey]) {
                hafalanByMonth[monthKey] = { ziyadah: 0, murojaah: 0 };
            }
            hafalanByMonth[monthKey].ziyadah += (h.ziyadah_pages || 0);
            hafalanByMonth[monthKey].murojaah += (h.murojaah_juz || 0);
        });
    }
    const months = Object.keys(hafalanByMonth);

    // Filter grades - if Diniyah, show all. If Tahfidz, maybe show specific ones if they exist?
    // For now, show all available grades for both.
    const grades = data.grades || [];

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
                        <Image
                            style={{ height: 35, width: 280, objectFit: 'contain', marginBottom: 5 }}
                            src="/kop_arab.png"
                        />
                        <Text style={styles.schoolName}>PONDOK PESANTREN IMAM AD-DAMANHURI</Text>
                        <Text style={styles.address}>Puri Nirwana Gajayana 30-31. Jl. Simpang Gajayana Dinoyo Lowokwaru Malang.</Text>
                        <Text style={styles.meta}>Kode Pos 65144 NSP: 510035730102</Text>
                    </View>
                </View>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.docTitle}>
                        {isTahfidz ? 'Laporan Santri Tahfidz' : 'Laporan Hasil Belajar'}
                    </Text>
                    <Text style={styles.subTitle}>Pondok Pesantren Imam Ad-Damanhuri</Text>
                </View>

                {/* Student Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoColumn}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>NIS</Text>
                            <Text style={styles.infoSeparator}>:</Text>
                            <Text style={styles.infoValue}>{data.student.nis}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Nama</Text>
                            <Text style={styles.infoSeparator}>:</Text>
                            <Text style={styles.infoValue}>{data.student.name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Alamat</Text>
                            <Text style={styles.infoSeparator}>:</Text>
                            <Text style={styles.infoValue}>{data.student.address || '-'}</Text>
                        </View>
                    </View>
                    <View style={styles.infoColumn}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Kelas</Text>
                            <Text style={styles.infoSeparator}>:</Text>
                            <Text style={styles.infoValue}>{data.student.class || '-'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Tahun Pelajaran</Text>
                            <Text style={styles.infoSeparator}>:</Text>
                            <Text style={styles.infoValue}>{data.academicYear.split('/')[0]}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Semester</Text>
                            <Text style={styles.infoSeparator}>:</Text>
                            <Text style={styles.infoValue}>{data.semester}</Text>
                        </View>
                    </View>
                </View>

                {/* GRADES TABLE */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader, { alignItems: 'stretch', minHeight: 40 }]}>
                        <View style={[styles.tableCell, { width: '10%', justifyContent: 'center' }]}>
                            <Text>NO</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '35%', justifyContent: 'center' }]}>
                            <Text>MATA PELAJARAN</Text>
                        </View>
                        {isTahfidz ? (
                            <>
                                <View style={[styles.tableCell, { width: '20%', justifyContent: 'center' }]}>
                                    <Text>NILAI</Text>
                                </View>
                                <View style={[styles.tableCell, { width: '15%', justifyContent: 'center' }]}>
                                    <Text>HURUF</Text>
                                </View>
                                <View style={[styles.tableCell, { width: '20%', justifyContent: 'center' }, styles.lastCell]}>
                                    <Text>KETERANGAN</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={{ width: '30%', borderRightWidth: 1, borderRightColor: '#000', flexDirection: 'column' }}>
                                    <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', paddingVertical: 2, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text>NILAI</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', flex: 1 }}>
                                        <View style={[styles.tableCell, { width: '50%', borderRightWidth: 1, borderBottomWidth: 0, borderTopWidth: 0, justifyContent: 'flex-start', paddingTop: 4, paddingHorizontal: 0 }]}>
                                            <Text style={{ fontSize: 9 }}>TEORI</Text>
                                        </View>
                                        <View style={[styles.tableCell, { width: '50%', borderRightWidth: 0, borderBottomWidth: 0, borderTopWidth: 0, justifyContent: 'flex-start', paddingTop: 4, paddingHorizontal: 0 }]}>
                                            <Text style={{ fontSize: 9 }}>PRAKTIK</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.tableCell, { width: '10%', justifyContent: 'center', padding: 0 }]}>
                                    <Text style={{ fontSize: 9, lineHeight: 0.9 }}>RATA-</Text>
                                    <Text style={{ fontSize: 9, lineHeight: 0.9 }}>RATA</Text>
                                </View>
                                <View style={[styles.tableCell, styles.lastCell, { width: '15%', justifyContent: 'center' }]}>
                                    <Text>PREDIKAT</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {grades.length > 0 ? grades.map((g: any, index: number) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { width: '10%' }]}>{index + 1}</Text>
                            <Text style={[styles.tableCell, styles.tableCellLeft, { width: '35%' }]}>{g.subject}</Text>
                            {isTahfidz ? (
                                <>
                                    <Text style={[styles.tableCell, { width: '20%' }]}>{g.score_total}</Text>
                                    <Text style={[styles.tableCell, { width: '15%' }]}>
                                        {g.score_total >= 85 ? 'A' :
                                            g.score_total >= 75 ? 'B' :
                                                g.score_total >= 60 ? 'C' : 'D'}
                                    </Text>
                                    <Text style={[styles.tableCell, { width: '20%' }, styles.lastCell]}>
                                        {g.score_total >= 70 ? 'Lulus' : 'Remidi'}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text style={[styles.tableCell, { width: '15%' }]}>{g.score_theory || '-'}</Text>
                                    <Text style={[styles.tableCell, { width: '15%' }]}>{g.score_practice || '-'}</Text>
                                    <Text style={[styles.tableCell, { width: '10%' }]}>{g.score_total}</Text>
                                    <Text style={[styles.tableCell, { width: '15%' }, styles.lastCell]}>
                                        {g.score_total >= 85 ? 'Mumtaz' :
                                            g.score_total >= 75 ? 'Jayyid Jiddan' :
                                                g.score_total >= 60 ? 'Jayyid' :
                                                    g.score_total >= 50 ? 'Maqbul' : 'Rasib'}
                                    </Text>
                                </>
                            )}
                        </View>
                    )) : (
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { width: '100%', borderRightWidth: 0 }]}>Belum ada nilai mata pelajaran.</Text>
                        </View>
                    )}
                </View>

                {/* TAHFIDZ ONLY: HAFALAN TABLE */}
                {isTahfidz && (
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, { width: '40%' }]}>BULAN</Text>
                            <Text style={[styles.tableCell, { width: '30%' }]}>ZIYADAH/HLM</Text>
                            <Text style={[styles.tableCell, { width: '30%' }, styles.lastCell]}>MURAJA'AH/JUZ</Text>
                        </View>
                        {months.length > 0 ? months.map((month, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.tableCellLeft, { width: '40%' }]}>{month}</Text>
                                <Text style={[styles.tableCell, { width: '30%' }]}>{hafalanByMonth[month].ziyadah}</Text>
                                <Text style={[styles.tableCell, { width: '30%' }, styles.lastCell]}>{hafalanByMonth[month].murojaah}</Text>
                            </View>
                        )) : (
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '100%', borderRightWidth: 0 }]}>Belum ada data hafalan.</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* BEHAVIOR & ATTENDANCE ROW */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    {/* Behavior */}
                    <View style={{ width: '48%' }}>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.tableCell, { width: '100%', borderRightWidth: 0 }]}>PERILAKU SANTRI</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.tableCellLeft, { width: '60%' }]}>KERAJINAN</Text>
                                <Text style={[styles.tableCell, { width: '40%', borderRightWidth: 0 }]}>{data.behavior.kerajinan || '-'}</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.tableCellLeft, { width: '60%' }]}>KEDISIPLINAN</Text>
                                <Text style={[styles.tableCell, { width: '40%', borderRightWidth: 0 }]}>{data.behavior.kedisiplinan || '-'}</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.tableCellLeft, { width: '60%' }]}>
                                    {isTahfidz ? 'KERAPIAN' : 'KEBERSIHAN'}
                                </Text>
                                <Text style={[styles.tableCell, { width: '40%', borderRightWidth: 0 }]}>
                                    {isTahfidz ? (data.behavior.kerapian || '-') : (data.behavior.kebersihan || '-')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Attendance */}
                    <View style={{ width: '48%' }}>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.tableCell, { width: '100%', borderRightWidth: 0 }]}>PRESENSI</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '50%' }]}>ALFA</Text>
                                <Text style={[styles.tableCell, { width: '50%', borderRightWidth: 0 }]}>{data.attendanceSummary.alfa || '-'}</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '50%' }]}>IZIN</Text>
                                <Text style={[styles.tableCell, { width: '50%', borderRightWidth: 0 }]}>{data.attendanceSummary.izin || '-'}</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '50%' }]}>SAKIT</Text>
                                <Text style={[styles.tableCell, { width: '50%', borderRightWidth: 0 }]}>{data.attendanceSummary.sakit || '-'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* SIGNATURES */}
                <View style={styles.datePlace}>
                    <Text>Malang, {signatureDate}</Text>
                </View>
                <Text style={{ textAlign: 'center', fontFamily: 'Times-Bold', marginBottom: 20 }}>Mengetahui,</Text>

                <View style={styles.signatureSection}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureTitle}>Orang Tua</Text>
                        <Text style={styles.signatureName}>.........................</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureTitle}>Muallim/ah</Text>
                        <Text style={styles.signatureName}>.........................</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureTitle}>Pengasuh</Text>
                        <Text style={styles.signatureName}>.........................</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
};
