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
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Login SIAKAD</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account.
                </CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    {state?.error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 rounded-md">
                            <AlertCircle size={16} />
                            <span>{state.error}</span>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled={isPending}>
                        {isPending ? 'Signing in...' : 'Sign in'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
