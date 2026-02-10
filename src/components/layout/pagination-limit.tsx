'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export function PaginationLimit({
    currentLimit,
}: {
    currentLimit: number
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const onLimitChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('limit', value)
        params.set('page', '1') // Reset to first page when limit changes
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">Data per halaman:</span>
            <Select
                value={String(currentLimit)}
                onValueChange={onLimitChange}
            >
                <SelectTrigger className="h-8 w-[70px] md:h-9 md:w-[80px]">
                    <SelectValue placeholder={String(currentLimit)} />
                </SelectTrigger>
                <SelectContent>
                    {[10, 20, 50, 100].map((val) => (
                        <SelectItem key={val} value={String(val)}>
                            {val}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
