'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useTransition, ReactNode } from 'react'

interface FastTabsProps {
    defaultValue: string
    tabs: { value: string; label: string; content: ReactNode }[]
    paramName?: string
    className?: string
}

export function FastTabs({ defaultValue, tabs, paramName = 'tab', className }: FastTabsProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const currentTab = searchParams.get(paramName) || defaultValue

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(paramName, value)
        // Reset page when changing tabs
        params.delete('page')

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    return (
        <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className={className}
        >
            <TabsList className={isPending ? 'opacity-70 pointer-events-none' : ''}>
                {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="mt-4">
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    )
}

// Client-side only tabs (no URL sync, instant switching)
interface ClientTabsProps {
    defaultValue: string
    tabs: { value: string; label: string; content: ReactNode }[]
    className?: string
}

export function ClientTabs({ defaultValue, tabs, className }: ClientTabsProps) {
    return (
        <Tabs defaultValue={defaultValue} className={className}>
            <TabsList>
                {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="mt-4">
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    )
}
