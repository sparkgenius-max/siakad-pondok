'use client'

import { useState } from 'react'
import { updatePermissionStatus } from '@/app/(dashboard)/permissions/actions'
import { Button } from '@/components/ui/button'
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
import { Check, X, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export function PermissionActions({ id, status }: { id: string; status: string }) {
    const [showApproveDialog, setShowApproveDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    if (status !== 'pending') {
        // Show status badge for non-pending items
        if (status === 'approved') {
            return (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Disetujui</span>
                </div>
            )
        }
        if (status === 'rejected') {
            return (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                    <XCircle className="h-4 w-4" />
                    <span>Ditolak</span>
                </div>
            )
        }
        return null
    }

    const handleApprove = async () => {
        setIsLoading(true)
        try {
            await updatePermissionStatus(id, 'approved')
            toast.success('Perizinan disetujui')
        } catch (error) {
            toast.error("Gagal menyetujui perizinan")
        } finally {
            setIsLoading(false)
            setShowApproveDialog(false)
        }
    }

    const handleReject = async () => {
        setIsLoading(true)
        try {
            await updatePermissionStatus(id, 'rejected')
            toast.success('Perizinan ditolak')
        } catch (error) {
            toast.error("Gagal menolak perizinan")
        } finally {
            setIsLoading(false)
            setShowRejectDialog(false)
        }
    }

    return (
        <>
            <div className="flex items-center gap-1 justify-end">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-green-600 border-green-200 hover:text-green-700 hover:bg-green-50 hover:border-green-300"
                    onClick={() => setShowApproveDialog(true)}
                >
                    <Check className="h-4 w-4 mr-1" />
                    Setuju
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                    onClick={() => setShowRejectDialog(true)}
                >
                    <X className="h-4 w-4 mr-1" />
                    Tolak
                </Button>
            </div>

            {/* Approve Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Setujui Perizinan?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menyetujui perizinan ini. Santri akan dicatat sebagai izin yang sah.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? 'Memproses...' : 'Ya, Setujui'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            Tolak Perizinan?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menolak perizinan ini. Santri akan dianggap tidak hadir tanpa izin yang sah.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isLoading ? 'Memproses...' : 'Ya, Tolak'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
