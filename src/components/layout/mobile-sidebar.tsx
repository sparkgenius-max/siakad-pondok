'use client'

import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface MobileSidebarProps {
    role?: string
}

export const MobileSidebar = ({ role }: MobileSidebarProps) => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-none w-64 bg-slate-900 gap-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Menu Navigasi</SheetTitle>
                    <SheetDescription>
                        Akses cepat ke berbagai fitur Siakad Pondok
                    </SheetDescription>
                </SheetHeader>
                <Sidebar role={role} />
            </SheetContent>
        </Sheet>
    )
}
