import { UserNav } from './user-nav'
import { MobileSidebar } from './mobile-sidebar'

interface HeaderProps {
    role: string
    email?: string
}

export default function Header({ role, email }: HeaderProps) {
    return (
        <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex h-16 items-center px-4">
                <MobileSidebar role={role} />
                <h2 className="text-xl font-bold md:hidden ml-2 text-emerald-700">SIPPIA</h2>
                <div className="ml-auto flex items-center space-x-4 md:hidden">
                    {email && <UserNav email={email} />}
                </div>
            </div>
        </div>
    )
}
