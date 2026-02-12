'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { saveBulkReports, getAttendanceSummaryBulk, getExistingReports, getReportData, saveSingleReport } from '@/app/(dashboard)/reports/actions'
import { Loader2, Save, Printer, FileDown, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ReportDocument } from './report-pdf'
import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { ACADEMIC_YEARS, SEMESTERS, GRADES } from '@/lib/constants'

interface ReportManagerProps {
    classes: string[]
    santriList: { id: string; name: string; nis: string; class: string; program: string }[]
}

type StudentData = {
    kerajinan: string
    kedisiplinan: string
    thirdBehavior: string // kebersihan or kerapian
    notes: string
}

export function ReportManager({ classes, santriList }: ReportManagerProps) {
    const [isLoading, setIsLoading] = useState(false) // For global save
    const [isFetching, startTransition] = useTransition() // For data loading

    // Filter State
    const [selectedProgram, setSelectedProgram] = useState('Diniyah')
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedYear, setSelectedYear] = useState('2025/2026')
    const [selectedSemester, setSelectedSemester] = useState('Genap') // Default Feb 2026

    // Data State
    const [dataLoaded, setDataLoaded] = useState(false)
    const [studentInputs, setStudentInputs] = useState<Record<string, StudentData>>({})
    const [attendanceSummaries, setAttendanceSummaries] = useState<Record<string, { alfa: number; izin: number; sakit: number }>>({})

    // PDF Generation State per student
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null)

    // Filter Logic
    const filteredSantri = santriList.filter(s =>
        (selectedProgram ? s.program === selectedProgram : true) &&
        (selectedProgram === 'Tahfidz' ? true : (selectedClass && selectedClass !== 'all' ? s.class === selectedClass : true))
    )

    const canShowTable = selectedProgram === 'Tahfidz' || (selectedProgram === 'Diniyah' && selectedClass)
    const thirdBehaviorLabel = selectedProgram === 'Diniyah' ? 'Kebersihan' : 'Kerapian'

    // Auto-fetch data when filters change
    useEffect(() => {
        if (!canShowTable || filteredSantri.length === 0) {
            setDataLoaded(false)
            return
        }

        startTransition(async () => {
            const ids = filteredSantri.map(s => s.id)

            // Parallel fetch: Attendance + Existing Reports
            const [attendance, existing] = await Promise.all([
                getAttendanceSummaryBulk(ids, selectedYear, selectedSemester),
                getExistingReports(ids, selectedProgram, selectedYear, selectedSemester),
            ])

            setAttendanceSummaries(attendance)

            // Populate inputs
            const inputs: Record<string, StudentData> = {}
            ids.forEach(id => {
                const existingData = existing[id]
                inputs[id] = {
                    kerajinan: existingData?.behavior?.kerajinan || '',
                    kedisiplinan: existingData?.behavior?.kedisiplinan || '',
                    thirdBehavior: existingData?.behavior?.[selectedProgram === 'Diniyah' ? 'kebersihan' : 'kerapian'] || '',
                    notes: existingData?.notes || '',
                }
            })
            setStudentInputs(inputs)
            setDataLoaded(true)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProgram, selectedClass, selectedYear, selectedSemester])

    const handleInputChange = (santriId: string, field: keyof StudentData, value: string) => {
        setStudentInputs(prev => ({
            ...prev,
            [santriId]: {
                ...prev[santriId],
                [field]: value,
            },
        }))
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.set('program', selectedProgram)
            formData.set('academic_year', selectedYear)
            formData.set('semester', selectedSemester)

            const thirdKey = selectedProgram === 'Diniyah' ? 'kebersihan' : 'kerapian'

            filteredSantri.forEach(s => {
                const data = studentInputs[s.id]
                if (data) {
                    formData.set(`behavior_kerajinan_${s.id}`, data.kerajinan)
                    formData.set(`behavior_kedisiplinan_${s.id}`, data.kedisiplinan)
                    formData.set(`behavior_${thirdKey}_${s.id}`, data.thirdBehavior)
                    formData.set(`notes_${s.id}`, data.notes)
                }
            })

            const result = await saveBulkReports(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(result.message)
            }
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan')
        } finally {
            setIsLoading(false)
        }
    }

    const handlePrintPdf = async (santriId: string, santriName: string) => {
        setGeneratingPdfId(santriId)
        try {
            // 0. Auto-Save specific student data first
            const inputData = studentInputs[santriId]
            if (inputData) {
                const thirdKey = selectedProgram === 'Diniyah' ? 'kebersihan' : 'kerapian'
                const behavior = {
                    kerajinan: inputData.kerajinan,
                    kedisiplinan: inputData.kedisiplinan,
                    [thirdKey]: inputData.thirdBehavior
                }

                // Save silently (or with toast if we want to be explicit, but silent is better for "seamless" feel, maybe just log error)
                const saveResult = await saveSingleReport(
                    santriId,
                    selectedProgram,
                    selectedYear,
                    selectedSemester,
                    behavior,
                    inputData.notes
                )

                if (saveResult.error) {
                    toast.error("Gagal menyimpan data terbaru: " + saveResult.error)
                    // We continue to download even if save fails? Maybe better to stop?
                    // User expects the PDF to contain what they see. If save fails, PDF might be stale (fetched from DB).
                    // Actually, fetch happens in step 1. If save fails here, DB is old. FETCH gets old data.
                    // So we MUST return if save fails.
                    return
                }
            }

            // 1. Fetch complete report data (now guaranteed to be fresh)
            const reportData = await getReportData(santriId, selectedProgram, selectedYear, selectedSemester)

            if (reportData.error) {
                toast.error(reportData.error)
                return
            }

            // 2. Add context data
            const finalData = {
                ...reportData,
                academicYear: selectedYear,
                semester: selectedSemester,
                program: selectedProgram
            }

            // 3. Generate PDF Blob
            const blob = await pdf(<ReportDocument data={finalData} />).toBlob()

            // 4. Trigger Download
            const fileName = `Raport_${santriName.replace(/\s+/g, '_')}_${selectedSemester}_${selectedYear.replace('/', '-')}.pdf`
            saveAs(blob, fileName)
            toast.success(`Raport ${santriName} berhasil didownload`)

        } catch (error: any) {
            console.error(error)
            toast.error("Gagal membuat PDF")
        } finally {
            setGeneratingPdfId(null)
        }
    }

    const GradeSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
        <Select value={value || undefined} onValueChange={onChange}>
            <SelectTrigger className="w-[70px] h-8 text-xs mx-auto">
                <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
                {GRADES.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Printer className="w-5 h-5 text-emerald-600" />
                        Management Raport Santri
                    </CardTitle>
                    <CardDescription>
                        Input perilaku, cek presensi, dan cetak raport PDF dalam satu tempat.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Program</Label>
                            <Select value={selectedProgram} onValueChange={(v) => { setSelectedProgram(v); setDataLoaded(false); }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Diniyah">Diniyah</SelectItem>
                                    <SelectItem value="Tahfidz">Tahfidz</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedProgram !== 'Tahfidz' && (
                            <div className="space-y-2">
                                <Label>Kelas</Label>
                                <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setDataLoaded(false); }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kelas</SelectItem>
                                        {classes.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Tahun Ajaran</Label>
                            <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setDataLoaded(false); }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACADEMIC_YEARS.map(y => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select value={selectedSemester} onValueChange={(v) => { setSelectedSemester(v); setDataLoaded(false); }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SEMESTERS.map(s => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Table */}
            {dataLoaded && !isFetching && (
                <Card>
                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">
                                Daftar Santri — {selectedProgram} {selectedClass && selectedClass !== 'all' ? `Kelas ${selectedClass}` : ''}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Total: {filteredSantri.length} Santri
                            </p>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Simpan Perubahan
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {filteredSantri.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                <p>Tidak ada santri ditemukan untuk filter ini.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40px]">No</TableHead>
                                            <TableHead className="min-w-[200px]">Data Santri</TableHead>
                                            <TableHead className="text-center px-1">Kerajinan</TableHead>
                                            <TableHead className="text-center px-1">Kedisiplinan</TableHead>
                                            <TableHead className="text-center px-1">{thirdBehaviorLabel}</TableHead>
                                            <TableHead className="text-center px-1 w-[50px] text-red-600 font-semibold" title="Alfa">A</TableHead>
                                            <TableHead className="text-center px-1 w-[50px] text-yellow-600 font-semibold" title="Izin">I</TableHead>
                                            <TableHead className="text-center px-1 w-[50px] text-blue-600 font-semibold" title="Sakit">S</TableHead>
                                            <TableHead className="min-w-[180px]">Catatan</TableHead>
                                            <TableHead className="w-[100px] text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSantri.map((s, idx) => {
                                            const data = studentInputs[s.id] || { kerajinan: '', kedisiplinan: '', thirdBehavior: '', notes: '' }
                                            const attendance = attendanceSummaries[s.id] || { alfa: 0, izin: 0, sakit: 0 }
                                            const isPdfLoading = generatingPdfId === s.id

                                            return (
                                                <TableRow key={s.id}>
                                                    <TableCell className="text-muted-foreground text-center">{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-emerald-900">{s.name}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">{s.nis}</div>
                                                    </TableCell>

                                                    {/* Behavior Inputs */}
                                                    <TableCell className="text-center px-1">
                                                        <GradeSelect
                                                            value={data.kerajinan}
                                                            onChange={(v) => handleInputChange(s.id, 'kerajinan', v)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center px-1">
                                                        <GradeSelect
                                                            value={data.kedisiplinan}
                                                            onChange={(v) => handleInputChange(s.id, 'kedisiplinan', v)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center px-1">
                                                        <GradeSelect
                                                            value={data.thirdBehavior}
                                                            onChange={(v) => handleInputChange(s.id, 'thirdBehavior', v)}
                                                        />
                                                    </TableCell>

                                                    {/* Read-only Attendance */}
                                                    <TableCell className="text-center px-1">
                                                        <div className={`text-xs font-bold ${attendance.alfa > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                                                            {attendance.alfa || '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center px-1">
                                                        <div className={`text-xs font-bold ${attendance.izin > 0 ? 'text-yellow-600' : 'text-slate-300'}`}>
                                                            {attendance.izin || '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center px-1">
                                                        <div className={`text-xs font-bold ${attendance.sakit > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                                            {attendance.sakit || '-'}
                                                        </div>
                                                    </TableCell>

                                                    {/* Notes */}
                                                    <TableCell>
                                                        <Input
                                                            placeholder="Catatan..."
                                                            value={data.notes}
                                                            onChange={(e) => handleInputChange(s.id, 'notes', e.target.value)}
                                                            className="h-8 text-xs"
                                                        />
                                                    </TableCell>

                                                    {/* Print Action */}
                                                    <TableCell className="text-center">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                                            onClick={() => handlePrintPdf(s.id, s.name)}
                                                            disabled={isPdfLoading}
                                                            title="Cetak Raport PDF"
                                                        >
                                                            {isPdfLoading ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <FileDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        <div className="mt-4 p-3 bg-blue-50/50 rounded-md border border-blue-100 flex gap-3 text-sm text-blue-800 items-start">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                            <div>
                                <p className="font-semibold mb-1">Informasi Pengisian Raport</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700/80">
                                    <li>Data <strong>Hafalan</strong> (Tahfidz) dan <strong>Nilai Pelajaran</strong> diambil dari database secara otomatis.</li>
                                    <li>Data <strong>Presensi</strong> (A/I/S) dihitung otomatis dari menu Absensi.</li>
                                    <li>Pastikan untuk menekan tombol <span className="font-semibold">Simpan Perubahan</span> sebelum mencetak raport agar data perilaku tersimpan.</li>
                                </ul>
                            </div>
                        </div>

                        {filteredSantri.length > 0 && (
                            <div className="mt-6 flex justify-end sticky bottom-0 bg-white py-4 border-t shadow-lg md:shadow-none md:static md:p-0 md:bg-transparent md:border-0 z-10">
                                <Button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    size="default"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Simpan Semua Data ({filteredSantri.length} santri)
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {isFetching && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
                    <Loader2 className="w-10 h-10 mb-4 animate-spin text-emerald-500" />
                    <p>Sedang memuat data raport...</p>
                </div>
            )}
        </div>
    )
}
