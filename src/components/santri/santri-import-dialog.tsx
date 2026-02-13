'use client'

import { useState } from 'react'
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
                const data = XLSX.utils.sheet_to_json(ws)
                setPreview(data.slice(0, 5)) // Preview first 5 rows
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
                const data = XLSX.utils.sheet_to_json(ws)

                const result = await importSantri(data)
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
            <DialogContent className="w-[95vw] sm:max-w-[500px] gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Import Data Santri</DialogTitle>
                    <DialogDescription>
                        Unggah file Excel untuk mengimpor data santri secara massal.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-2 space-y-6">
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
                            <div className="border rounded-lg p-0 bg-slate-50 overflow-hidden">
                                <div className="overflow-x-auto max-w-full custom-scrollbar">
                                    <table className="text-[10px] w-full border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100 border-b">
                                                {Object.keys(preview[0]).map(key => (
                                                    <th key={key} className="text-left px-3 py-2 whitespace-nowrap font-bold text-slate-700 uppercase tracking-wider border-r last:border-0">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.map((row, i) => (
                                                <tr key={i} className="border-b last:border-0 hover:bg-slate-100/50 transition-colors">
                                                    {Object.values(row).map((val: any, j) => (
                                                        <td key={j} className="px-3 py-2 whitespace-nowrap text-slate-600 border-r last:border-0">{String(val)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-2 bg-slate-100/50 border-t text-[9px] text-center text-slate-400 font-medium sm:hidden">
                                    Geser ke samping untuk melihat kolom lain &rarr;
                                </div>
                            </div>
                        </div>
                    )}

                    {!file && (
                        <Alert className="bg-blue-50 border-blue-200 py-3">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-800 text-sm">Informasi Kolom</AlertTitle>
                            <AlertDescription className="text-blue-700 text-[11px] leading-relaxed">
                                Gunakan kolom: <b>nis, nama, jk (L/P), kelas, asrama, alamat, wali, hp_wali, program</b>.<br />
                                <i>Nama wajib diisi. NIS otomatis dibuat jika kosong (Sequence). Data lama dengan NIS sama akan diperbarui.</i>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-2">
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
                        className="w-full sm:w-auto min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
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
