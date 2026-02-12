'use client'

import { useState, useEffect } from 'react'
import { updatePermissionStatus } from '@/app/(dashboard)/permissions/actions'
import { Button } from '@/components/ui/button'
import { Printer, MoreHorizontal, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
// import { PDFDownloadLink } from '@react-pdf/renderer' // Removed for performance
import { PermissionDocument } from './permission-pdf'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function PermissionActions({ id, status, data }: { id: string; status: string; data?: any }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const handleStatusUpdate = async (newStatus: 'berlangsung' | 'selesai' | 'terlambat') => {
        setIsLoading(true)
        try {
            await updatePermissionStatus(id, newStatus)
            toast.success(`Status diperbarui menjadi ${newStatus}`)
        } catch (error: any) {
            console.error('[PermissionActions] Error:', error)
            toast.error(`Gagal memperbarui status: ${error?.message || 'Unknown error'}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2 justify-end">
            {isClient && data ? (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1"
                    disabled={isLoading}
                    onClick={async () => {
                        setIsLoading(true);
                        try {
                            // Dynamically import pdf to avoid server-side issues and reduce initial bundle status
                            const { pdf } = await import('@react-pdf/renderer');
                            const blob = await pdf(<PermissionDocument data={data} />).toBlob();
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `surat_izin_${data.santri?.name || 'santri'}_${new Date().getTime()}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                        } catch (error) {
                            console.error('PDF Generation Error:', error);
                            toast.error('Gagal membuat PDF');
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                >
                    <Printer className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">{isLoading ? 'Loading...' : 'Print'}</span>
                </Button>
            ) : null}

            {!data && (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1"
                    onClick={() => toast.error("Data perizinan tidak lengkap")}
                >
                    <Printer className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Print</span>
                </Button>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleStatusUpdate('berlangsung')}>
                        <Clock className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Berlangsung</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusUpdate('selesai')}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span>Selesai</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusUpdate('terlambat')}>
                        <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                        <span>Terlambat</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
