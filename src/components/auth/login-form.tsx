'use client'

import { useActionState } from 'react'
import { login } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

// Define a type for the state
type State = {
    error?: string | null
}

const initialState: State = {
    error: null,
}

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-8 border-b border-gray-100">
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center p-2 shadow-inner">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-emerald-800">SIAKAD IDAMAN</CardTitle>
                <CardDescription className="text-emerald-600/80 font-medium">
                    Sistem Informasi Akademik<br />Pondok Pesantren Imam Ad-Damanhuri
                </CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="grid gap-4 pt-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-emerald-900">Email / Nama Pengguna</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nama@pesantren.com"
                            required
                            className="border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/30"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-emerald-900">Kata Sandi</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/30"
                        />
                    </div>
                    {state?.error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            <AlertCircle size={16} />
                            <span>{state.error}</span>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="pt-6">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 shadow-lg hover:shadow-emerald-500/25 transition-all" disabled={isPending}>
                        {isPending ? 'Memproses...' : 'Masuk Aplikasi'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
