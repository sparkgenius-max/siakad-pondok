'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash, Eye } from 'lucide-react'
import Link from 'next/link'
import { SantriDialog } from './santri-dialog'
import { deleteSantri } from '@/app/(dashboard)/santri/actions'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Program } from '@/types'

export function SantriActions({
    santri,
    programs = [],
    enrolledProgramIds = []
}: {
    santri: any
    programs?: Program[]
    enrolledProgramIds?: string[]
}) {
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const handleDelete = async () => {
        try {
            await deleteSantri(santri.id)
            toast.success('Santri berhasil dihapus')
        } catch (error) {
            toast.error('Gagal menghapus santri')
        } finally {
            setShowDeleteDialog(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/santri/${santri.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600 focus:text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak bisa dibatalkan. Semua data santri ini termasuk pembayaran,
                            perizinan, dan nilai akan ikut terhapus.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {showEditDialog && (
                <SantriDialog
                    santri={santri}
                    programs={programs}
                    enrolledProgramIds={enrolledProgramIds}
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                />
            )}
        </>
    )
}
