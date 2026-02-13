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
        const template = [
            {
                nis: '12345',
                nama: 'Ahmad Santri',
                jk: 'L',
                kelas: '7A',
                asrama: 'Asrama A',
                alamat: 'Jl. Contoh No. 1',
                wali: 'Bpk. Ahmad',
                hp_wali: '08123456789',
                program: 'Tahfidz'
            }
        ]
        const ws = XLSX.utils.json_to_sheet(template)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Template Santri')
        XLSX.writeFile(wb, 'template_import_santri.xlsx')
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
                    resetState()
                }
                setLoading(false)
            }
            reader.readAsBinaryString(file)
        } catch (error) {
            toast.error('Terjadi kesalahan saat membaca file')
            setLoading(false)
        }
    }

    const resetState = () => {
        setFile(null)
        setPreview([])
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetState()
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    <span>Import Excel</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Import Data Santri</DialogTitle>
                    <DialogDescription>
                        Unggah file Excel untuk menambah banyak data santri sekaligus.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="template" className="text-sm font-medium">1. Unduh Template</Label>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-fit flex items-center gap-2"
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
                            className="cursor-pointer"
                        />
                    </div>

                    {file && preview.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-medium">Preview Data (5 baris pertama):</Label>
                            <div className="border rounded-md p-2 bg-slate-50 overflow-x-auto">
                                <table className="text-[10px] w-full border-collapse">
                                    <thead>
                                        <tr className="border-b">
                                            {Object.keys(preview[0]).map(key => (
                                                <th key={key} className="text-left p-1 whitespace-nowrap">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.map((row, i) => (
                                            <tr key={i} className="border-b last:border-0">
                                                {Object.values(row).map((val: any, j) => (
                                                    <td key={j} className="p-1 whitespace-nowrap">{String(val)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {!file && (
                        <Alert className="bg-blue-50 border-blue-200">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-800 text-sm">Informasi Kolom</AlertTitle>
                            <AlertDescription className="text-blue-700 text-[11px] leading-relaxed">
                                Gunakan kolom: <b>nis, nama, jk (L/P), kelas, asrama, alamat, wali, hp_wali, program</b>.<br />
                                <i>NIS dan Nama wajib diisi. Data lama dengan NIS sama akan diperbarui.</i>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="min-w-[100px]"
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
