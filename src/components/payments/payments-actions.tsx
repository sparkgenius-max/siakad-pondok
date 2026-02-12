'use client'

import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import { PaymentsPDF } from './payments-pdf'
import { useState } from 'react'
import { toast } from 'sonner'

interface PaymentData {
    nis: string
    name: string
    status: string
    amount: number
    date: string
}

interface PaymentsActionsProps {
    data: PaymentData[]
    month: number
    year: number
    totalCollected: number
}

export function PaymentsActions({ data, month, year, totalCollected }: PaymentsActionsProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = async () => {
        setIsGenerating(true)
        try {
            const blob = await pdf(
                <PaymentsPDF
                    data={data}
                    month={month}
                    year={year}
                    totalCollected={totalCollected}
                />
            ).toBlob()

            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `Laporan_Pembayaran_${year}_${month}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast.success('Laporan berhasil didownload')
        } catch (error) {
            console.error('PDF Generation Error:', error)
            toast.error('Gagal membuat PDF')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileDown className="mr-2 h-4 w-4" />
            )}
            Download Laporan
        </Button>
    )
}
