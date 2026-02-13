'use client'

import { useState, useRef, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileUp, Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { importSantri } from '@/app/(dashboard)/santri/actions'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function SantriImportDialog() {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState<any[]>([])
    const [canScroll, setCanScroll] = useState(false)
    const tableContainerRef = useRef<HTMLDivElement>(null)

    // Check for horizontal overflow
    const checkScroll = () => {
        if (tableContainerRef.current) {
            const { scrollWidth, clientWidth } = tableContainerRef.current
            setCanScroll(scrollWidth > clientWidth)
        }
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener('resize', checkScroll)
        return () => window.removeEventListener('resize', checkScroll)
    }, [preview, open])

    // Reset state when dialog is closed
    useEffect(() => {
        if (!open) {
            const timer = setTimeout(() => {
                resetState()
            }, 300) // Small delay to wait for close animation
            return () => clearTimeout(timer)
        }
    }, [open])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            const reader = new FileReader()
            reader.onload = (event) => {
                const bstr = event.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const rawData: any[] = XLSX.utils.sheet_to_json(ws)
                const filteredData = rawData.filter((row: any) => {
                    const name = row.nama || row.Name || row.name
                    if (!name) return false
                    const rowString = JSON.stringify(row).toUpperCase()
                    if (rowString.includes('INSTRUKSI PENTING') || rowString.includes('WAJIB DIISI')) {
                        return false
                    }
                    return true
                })
                setPreview(filteredData.slice(0, 5)) // Preview first 5 rows of valid data
            }
            reader.readAsBinaryString(selectedFile)
        }
    }

    const downloadTemplate = () => {
        // Headers consistent with backend
        const headers = [['nis', 'nama', 'jk', 'kelas', 'asrama', 'alamat', 'wali', 'hp_wali', 'program']]

        // Sample Data - showing empty NIS for new students
        const sampleData = [
            ['', 'Ahmad Santri', 'L', 'Ula', 'Abu Bakar', 'Malang', 'Bpk. Ahmad', '08123', 'Diniyah'],
            ['', 'Fatimah', 'P', '-', 'Aisyah', 'Surabaya', 'Ibu Fatimah', '08124', 'Tahfidz']
        ]

        const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...sampleData])

        // Set column widths
        worksheet['!cols'] = [
            { wch: 15 }, // nis
            { wch: 25 }, // nama
            { wch: 5 },  // jk
            { wch: 10 }, // kelas
            { wch: 15 }, // asrama
            { wch: 30 }, // alamat
            { wch: 20 }, // wali
            { wch: 15 }, // hp_wali
            { wch: 12 }  // program
        ]

        // Add validation notes
        const info = [
            ['INSTRUKSI PENTING:'],
            ['1. NAMA: Wajib diisi.'],
            ['2. NIS: Kosongkan untuk santri baru (otomatis). Isi dengan NIS yang sudah ada jika ingin mengupdate data (Nama/Kelas/Asrama) santri tersebut.'],
            ['3. KELAS: Wajib untuk Diniyah (Ula/Wustha/Ulya). Tahfidz boleh kosong (otomatis "-").'],
            ['4. JK: Gunakan L atau P.']
        ]

        XLSX.utils.sheet_add_aoa(worksheet, info, { origin: 'A5' })

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Santri')

        XLSX.writeFile(workbook, 'template_import_santri.xlsx')
        toast.info('Template berhasil diunduh. Gunakan NIS jika ingin mengupdate data santri yang ada.')
    }

    const handleImport = async () => {
        if (!file) return

        setLoading(true)
        try {
            const reader = new FileReader()
            reader.onload = async (event) => {
                const bstr = event.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const rawData: any[] = XLSX.utils.sheet_to_json(ws)

                // Sanitize: Filter out empty rows, instruction rows, and ensure plain objects
                const sanitizedData = rawData
                    .filter((row: any) => {
                        // 1. Must have a name
                        const name = row.nama || row.Name || row.name
                        if (!name) return false

                        // 2. Must not be an instruction row (checking common keywords in any field)
                        const rowString = JSON.stringify(row).toUpperCase()
                        if (rowString.includes('INSTRUKSI PENTING') || rowString.includes('WAJIB DIISI')) {
                            return false
                        }

                        return true
                    })
                    .map((row: any) => {
                        // 3. Ensure we pass ONLY plain types (strings, numbers, booleans)
                        // This prevents "Only plain objects can be passed to Server Functions"
                        const cleanRow: any = {}
                        for (const key in row) {
                            if (Object.prototype.hasOwnProperty.call(row, key)) {
                                const value = row[key]
                                // Convert anything complex (Dates, etc.) to string/primitive
                                if (value instanceof Date) {
                                    cleanRow[key] = value.toISOString()
                                } else if (typeof value === 'object' && value !== null) {
                                    cleanRow[key] = JSON.stringify(value)
                                } else {
                                    cleanRow[key] = value
                                }
                            }
                        }
                        return cleanRow
                    })

                if (sanitizedData.length === 0) {
                    toast.error('Tidak ada data santri yang valid ditemukan dalam file')
                    setLoading(false)
                    return
                }

                const result = await importSantri(sanitizedData)
                if (result.error) {
                    toast.error(result.error)
                } else {
                    toast.success(`Berhasil mengimpor ${result.count} data santri`)
                    setOpen(false)
                    setFile(null)
                    setPreview([])
                }
                setLoading(false)
            }
            reader.readAsBinaryString(file)
        } catch (error) {
            toast.error('Gagal mengimpor data')
            setLoading(false)
        }
    }

    const resetState = () => {
        setFile(null)
        setPreview([])
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-9 md:h-10 text-xs md:text-sm">
                    <FileUp className="w-4 h-4" />
                    <span className="hidden sm:inline">Import Data</span>
                    <span className="sm:hidden">Import</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[700px] gap-0 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-6 pb-2 shrink-0 border-b">
                    <DialogTitle>Import Data Santri</DialogTitle>
                    <DialogDescription>
                        Unggah file Excel untuk mengimpor data santri secara massal.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6 custom-scrollbar">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="template" className="text-sm font-medium">1. Unduh Template</Label>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full sm:w-fit flex items-center justify-center gap-2"
                            onClick={downloadTemplate}
                        >
                            <Download className="h-4 w-4" />
                            Template Excel
                        </Button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="file" className="text-sm font-medium">2. Pilih File Excel</Label>
                        <Input
                            key={open ? 'active' : 'inactive'}
                            id="file"
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="cursor-pointer text-sm"
                        />
                    </div>

                    {file && preview.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-medium">Preview Data (5 baris pertama):</Label>
                            <div className="border rounded-lg p-0 bg-slate-50 overflow-hidden shadow-sm">
                                <div
                                    ref={tableContainerRef}
                                    className="overflow-x-auto max-w-full custom-scrollbar"
                                >
                                    <table className="text-[11px] w-full border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100/80 border-b">
                                                {/* Use all possible keys from first 5 rows to ensure consistency */}
                                                {Array.from(new Set(preview.flatMap(Object.keys))).map(key => (
                                                    <th key={key} className="text-left px-3 py-2.5 whitespace-nowrap font-semibold text-slate-700 uppercase tracking-wider border-r last:border-0">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.map((row, i) => {
                                                const allKeys = Array.from(new Set(preview.flatMap(Object.keys)))
                                                return (
                                                    <tr key={i} className="border-b last:border-0 hover:bg-slate-100/50 transition-colors">
                                                        {allKeys.map((key, j) => (
                                                            <td key={j} className="px-3 py-2 whitespace-nowrap text-slate-600 border-r last:border-0">
                                                                {row[key] !== undefined && row[key] !== null ? String(row[key]) : '-'}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {canScroll && (
                                    <div className="p-2 bg-slate-100/50 border-t text-[10px] text-center text-slate-500 font-medium animate-in fade-in slide-in-from-bottom-1 duration-300">
                                        Geser ke samping untuk melihat semua kolom &rarr;
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!file && (
                        <Alert className="bg-blue-50/50 border-blue-200 py-3">
                            <AlertCircle className="h-4 w-4 text-blue-600 px-0" />
                            <div className="ml-2">
                                <AlertTitle className="text-blue-800 text-sm font-semibold">Informasi Kolom</AlertTitle>
                                <AlertDescription className="text-blue-700 text-[11px] leading-relaxed mt-1">
                                    Gunakan kolom: <span className="font-mono bg-blue-100 px-1 rounded text-blue-800">nis, nama, jk (L/P), kelas, asrama, alamat, wali, hp_wali, program</span>.<br />
                                    <span className="mt-1 block"><i>Nama wajib diisi. NIS otomatis dibuat jika kosong. Data lama dengan NIS sama akan diperbarui.</i></span>
                                </AlertDescription>
                            </div>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="p-6 pt-2 border-t flex flex-col-reverse sm:flex-row gap-2 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="w-full sm:w-auto min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100/50"
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengimpor...</>
                        ) : (
                            <><CheckCircle2 className="mr-2 h-4 w-4" /> Proses Import</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
