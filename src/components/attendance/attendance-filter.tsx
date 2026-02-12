'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useCallback, useTransition } from 'react'
import { Loader2 } from 'lucide-react'

interface AttendanceFilterProps {
    activeProgram: string
    activeTab: string
    uniqueClasses: string[]
    selectedClass: string
    selectedDate: string
}

export function AttendanceFilter({
    activeProgram,
    activeTab,
    uniqueClasses,
    selectedClass,
    selectedDate,
}: AttendanceFilterProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            // If checking Diniyah and class changes, keep tab / program
            // If switching program, logic is handled by Links in parent, here we handle filters

            return params.toString()
        },
        [searchParams]
    )

    const handleClassChange = (value: string) => {
        startTransition(() => {
            router.push(`${pathname}?${createQueryString('class', value)}`)
        })
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        startTransition(() => {
            router.push(`${pathname}?${createQueryString('date', value)}`)
        })
    }

    return (
        <div className="flex items-center gap-4 flex-wrap">
            <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal</label>
                <div className="relative">
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="w-[180px]"
                        disabled={isPending}
                    />
                </div>
            </div>

            {activeProgram === 'Diniyah' && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Kelas</label>
                    <Select
                        value={selectedClass}
                        onValueChange={handleClassChange}
                        disabled={isPending}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Pilih Kelas" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueClasses.map(cls => (
                                <SelectItem key={cls} value={cls}>Kelas {cls}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {isPending && (
                <div className="flex items-end h-[60px] pb-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    )
}
