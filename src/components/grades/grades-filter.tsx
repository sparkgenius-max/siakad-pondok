'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'
import { useState, useTransition } from 'react'

interface GradesFilterProps {
    programs: string[]
    classes: string[]
    subjects: string[]
    years: string[]
    semesters: { value: string; label: string }[]
    activeProgram: string
}

export function GradesFilter({
    programs,
    classes,
    subjects,
    years,
    semesters,
    activeProgram,
}: GradesFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // Local state for immediate UI feedback (optional, but good for select)
    // Actually, for instant filter, we can just push directly.

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        // Reset page to 1 on filter change
        params.set('page', '1')

        startTransition(() => {
            router.push(`/grades?${params.toString()}`, { scroll: false })
        })
    }

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('q')
        params.delete('class')
        params.delete('subject')
        params.delete('year')
        params.delete('semester') // Optional: maybe keep semester?
        params.set('page', '1')

        startTransition(() => {
            router.push(`/grades?${params.toString()}`, { scroll: false })
        })
    }

    const hasActiveFilters =
        searchParams.has('q') ||
        searchParams.has('class') ||
        searchParams.has('subject') ||
        (searchParams.get('year') && searchParams.get('year') !== 'all')

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Filter className="w-4 h-4" />
                Filter:
            </div>

            <div className="flex flex-wrap gap-2 items-center flex-1 w-full">
                {activeProgram === 'Diniyah' && (
                    <Select
                        value={searchParams.get('class') || 'all'}
                        onValueChange={(val) => handleFilterChange('class', val)}
                    >
                        <SelectTrigger className="w-full sm:w-[130px] h-9">
                            <SelectValue placeholder="Semua Kelas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kelas</SelectItem>
                            {classes.map((c) => (
                                <SelectItem key={c} value={c}>Kelas {c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Select
                    value={searchParams.get('subject') || 'all'}
                    onValueChange={(val) => handleFilterChange('subject', val)}
                >
                    <SelectTrigger className="w-full sm:w-[180px] h-9">
                        <SelectValue placeholder="Semua Mapel" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Mapel</SelectItem>
                        {subjects.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={searchParams.get('year') || 'all'}
                    onValueChange={(val) => handleFilterChange('year', val)}
                >
                    <SelectTrigger className="w-full sm:w-[140px] h-9">
                        <SelectValue placeholder="Semua Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Tahun</SelectItem>
                        {years.map((y) => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={searchParams.get('semester') || 'Ganjil'}
                    onValueChange={(val) => handleFilterChange('semester', val)}
                >
                    <SelectTrigger className="w-full sm:w-[140px] h-9">
                        <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                        {semesters.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-9 px-2 text-muted-foreground hover:text-red-500 w-full sm:w-auto"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Reset
                    </Button>
                )}
            </div>
        </div>
    )
}
