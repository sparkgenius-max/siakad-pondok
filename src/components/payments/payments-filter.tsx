'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useCallback, useTransition } from 'react'
import { Loader2 } from 'lucide-react'

const MONTHS = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
]

interface PaymentsFilterProps {
    selectedMonth: number
    selectedYear: number
    currentYear: number
}

export function PaymentsFilter({
    selectedMonth,
    selectedYear,
    currentYear,
}: PaymentsFilterProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            // Ensure tab is always recap when using this filter
            params.set('tab', 'recap')

            return params.toString()
        },
        [searchParams]
    )

    const handleFilterChange = (name: string, value: string) => {
        startTransition(() => {
            router.push(`${pathname}?${createQueryString(name, value)}`)
        })
    }

    return (
        <div className="flex items-center gap-2 flex-wrap w-full">
            <Select
                value={String(selectedMonth)}
                onValueChange={(val) => handleFilterChange('month', val)}
                disabled={isPending}
            >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                    {MONTHS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={String(selectedYear)}
                onValueChange={(val) => handleFilterChange('year', val)}
                disabled={isPending}
            >
                <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                    {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {isPending && (
                <div className="flex items-center py-2 sm:py-0">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    )
}
