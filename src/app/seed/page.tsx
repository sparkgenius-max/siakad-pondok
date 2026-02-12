'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { seedUser } from './actions'

export default function SeedPage() {
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSignup = async (email: string, role: string, name: string) => {
        setLoading(true)
        setMessage(`Registering ${email}...`)

        try {
            const result = await seedUser(email, role, name)

            if (result.success) {
                setMessage(`✅ Success: ${result.message}`)
            } else {
                setMessage(`❌ Error: ${result.error}`)
            }
        } catch (e) {
            setMessage(`❌ Unexpected Error: ${e}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-4">
            <Card>
                <CardHeader><CardTitle>Manual User Registration (Admin API)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-slate-100 rounded text-sm mb-4">
                        <p>This uses the <strong>Service Role Key</strong> to create users directly, bypassing rate limits and email confirmation.</p>
                        <p>Password will be role + "123" (e.g. <code>admin123</code>).</p>
                        <p className="font-bold mt-2 whitespace-pre-wrap">{message}</p>
                    </div>

                    <div className="flex gap-2 items-center">
                        <div className="flex-1">
                            <p className="font-bold">Admin</p>
                            <p className="text-xs">adminidaman@siakad.com</p>
                        </div>
                        <Button
                            onClick={() => handleSignup('adminidaman@siakad.com', 'admin', 'Administrator IDAMAN')}
                            disabled={loading}
                        >
                            Register Admin
                        </Button>
                    </div>

                    <div className="flex gap-2 items-center">
                        <div className="flex-1">
                            <p className="font-bold">Pengasuh</p>
                            <p className="text-xs">pengasuhidaman@siakad.com</p>
                        </div>
                        <Button
                            onClick={() => handleSignup('pengasuhidaman@siakad.com', 'pengasuh', 'Pengasuh IDAMAN')}
                            disabled={loading}
                        >
                            Register Pengasuh
                        </Button>
                    </div>

                    <div className="flex gap-2 items-center">
                        <div className="flex-1">
                            <p className="font-bold">Guru</p>
                            <p className="text-xs">guruidaman@siakad.com</p>
                        </div>
                        <Button
                            onClick={() => handleSignup('guruidaman@siakad.com', 'ustadz', 'Guru IDAMAN')}
                            disabled={loading}
                        >
                            Register Guru
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
