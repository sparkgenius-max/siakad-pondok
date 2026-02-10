'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, Users, Wallet, GraduationCap, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

interface ExportButtonProps {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg'
}

export function ExportButton({ variant = 'outline', size = 'default' }: ExportButtonProps) {
    const exportToExcel = async (type: 'santri' | 'payments' | 'grades' | 'permissions' | 'attendance') => {
        toast.loading('Menyiapkan data...')

        try {
            const response = await fetch(`/api/export?type=${type}`)
            if (!response.ok) throw new Error('Failed to fetch data')

            const data = await response.json()

            if (!data || data.length === 0) {
                toast.dismiss()
                toast.error('Tidak ada data untuk di-export')
                return
            }

            // Create workbook
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(data)

            // Auto-width columns
            const colWidths = Object.keys(data[0]).map(key => ({
                wch: Math.max(key.length, ...data.map((row: any) => String(row[key] || '').length)) + 2
            }))
            ws['!cols'] = colWidths

            const sheetName = {
                santri: 'Data Santri',
                payments: 'Pembayaran',
                grades: 'Nilai',
                permissions: 'Perizinan',
                attendance: 'Absensi'
            }[type]

            XLSX.utils.book_append_sheet(wb, ws, sheetName)

            // Generate filename with date
            const date = new Date().toISOString().split('T')[0]
            const filename = `${type}_${date}.xlsx`

            // Download
            XLSX.writeFile(wb, filename)

            toast.dismiss()
            toast.success(`Berhasil export ${data.length} data ke ${filename}`)
        } catch (error) {
            toast.dismiss()
            toast.error('Gagal export data')
            console.error(error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Pilih Data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportToExcel('santri')}>
                    <Users className="h-4 w-4 mr-2" />
                    Data Santri
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel('payments')}>
                    <Wallet className="h-4 w-4 mr-2" />
                    Pembayaran
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel('grades')}>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Nilai Akademik
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel('attendance')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Absensi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel('permissions')}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Perizinan
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
