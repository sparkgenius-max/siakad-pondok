'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw, Settings } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error)
    }, [error])

    const isEnvError = error.message.includes('environment variables') || error.message.includes('Supabase')

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">Terjadi Kesalahan Server</h2>
                <p className="text-slate-600 mb-8">
                    {isEnvError
                        ? "Sepertinya ada konfigurasi (Environment Variables) yang belum lengkap di Vercel."
                        : "Aplikasi mengalami kendala saat memuat data dari server."}
                </p>

                {isEnvError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
                        <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2">
                            <Settings size={14} /> Solusi:
                        </h3>
                        <ul className="text-xs text-amber-700 space-y-2 list-disc pl-4">
                            <li>Pastikan <b>NEXT_PUBLIC_SUPABASE_URL</b> sudah diset di Vercel.</li>
                            <li>Pastikan <b>NEXT_PUBLIC_SUPABASE_ANON_KEY</b> sudah diset di Vercel.</li>
                            <li>Pastikan <b>SUPABASE_SERVICE_ROLE_KEY</b> sudah diset di Vercel (tanpa atau dengan NEXT_PUBLIC_).</li>
                            <li>Setelah menambah environment variables, lakukan <b>Redeploy</b> di Vercel.</li>
                        </ul>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                        <RefreshCcw size={16} /> Coba Lagi
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = '/login'}
                        className="w-full"
                    >
                        Kembali ke Login
                    </Button>
                </div>

                {error.digest && (
                    <p className="mt-6 text-[10px] text-slate-400 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    )
}
