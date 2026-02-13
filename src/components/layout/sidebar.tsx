'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    CreditCard,
    FileText,
    GraduationCap,
    Calendar,
    BookOpen,
    ClipboardList
} from 'lucide-react'
import { useTransition } from 'react'

const routes = [
    {
        label: 'Dasbor',
        icon: LayoutDashboard,
        href: '/',
        color: 'text-sky-500',
        roles: ['admin', 'pengasuh', 'guru']
    },
    {
        label: 'Data Santri',
        icon: Users,
        href: '/santri',
        color: 'text-violet-500',
        roles: ['admin', 'pengasuh']
    },
    {
        label: 'Syahriah',
        icon: CreditCard,
        href: '/payments',
        color: 'text-pink-700',
        roles: ['admin', 'pengasuh']
    },
    {
        label: 'Perizinan',
        icon: FileText,
        href: '/permissions',
        color: 'text-orange-700',
        roles: ['admin', 'pengasuh']
    },
    {
        label: 'Nilai Akademik',
        icon: GraduationCap,
        href: '/grades',
        color: 'text-emerald-500',
        roles: ['admin', 'pengasuh', 'guru']
    },
    {
        label: 'Absensi',
        icon: FileText,
        href: '/attendance',
        color: 'text-yellow-500',
        roles: ['admin', 'pengasuh', 'guru']
    },
    {
        label: 'Monitoring Tahfidz',
        icon: BookOpen,
        href: '/monitoring',
        color: 'text-teal-500',
        roles: ['admin', 'pengasuh', 'guru']
    },
    {
        label: 'Raport',
        icon: ClipboardList,
        href: '/reports',
        color: 'text-purple-500',
        roles: ['admin', 'pengasuh']
    },
    {
        label: 'Kalender',
        icon: Calendar,
        href: '/calendar',
        color: 'text-indigo-500',
        roles: ['admin', 'pengasuh', 'guru']
    },
    // {
    //     label: 'Pengguna',
    //     icon: Users,
    //     href: '/users',
    //     color: 'text-slate-500',
    //     roles: ['admin'] // Only admin
    // },
]

interface SidebarProps {
    role?: string
}

import { UserNav } from '@/components/layout/user-nav'
import { logout } from '@/app/(auth)/login/actions'

export function Sidebar({ role = 'guru' }: SidebarProps) {
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition();

    // Normalize role (handle legacy 'ustadz' name)
    const normalizedRole = role === 'ustadz' ? 'guru' : role;

    const filteredRoutes = routes.filter(route =>
        route.roles.includes(normalizedRole as string)
    )

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] relative overflow-hidden">
            {/* Gradient Overlay for Sleek Look */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="px-3 py-2 flex-1 relative z-10 flex flex-col">
                <div className="flex items-center pl-3 mb-10 mt-2 gap-3">
                    <div className="relative w-12 h-12 bg-white rounded-full p-1 shadow-lg">
                        <img src="/logo.png" alt="Logo" className="object-contain w-full h-full" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white leading-none">
                            SIPPIA
                        </h1>
                        <p className="text-[9px] text-emerald-100 font-medium tracking-wide opacity-80 mt-1 leading-tight">
                            Sistem Informasi Pondok Pesantren<br />Imam Ad-Damanhuri
                        </p>
                    </div>
                </div>

                <div className="space-y-1 flex-1">
                    {filteredRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200 ease-in-out',
                                (route.href === '/' ? pathname === '/' : pathname?.startsWith(route.href))
                                    ? 'bg-white/10 text-white shadow-sm font-semibold'
                                    : 'text-emerald-100/70 hover:text-white hover:bg-white/10 hover:translate-x-1'
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn('h-5 w-5 mr-3 transition-colors', (route.href === '/' ? pathname === '/' : pathname?.startsWith(route.href)) ? 'text-white' : 'text-emerald-100/70 group-hover:text-white')} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Bottom User Section */}
                <div className="mt-auto pt-6 border-t border-[var(--sidebar-border)] px-2">
                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                        <div className="flex flex-col flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                                {role === 'admin' ? 'Administrator' : role === 'pengasuh' ? 'Pengasuh' : 'Ustadz/Guru'}
                            </p>
                            <p className="text-[10px] text-emerald-200 truncate capitalize">
                                {role} {process.env.NODE_ENV === 'development' && `(${role})`}
                            </p>
                        </div>
                        {/* We reuse UserNav but maybe we want a custom logout button here? 
                            For now, let's keep it simple or implement a direct logout button if UserNav is too small */}
                        {/* Placeholder for UserNav or Logout */}
                        {/* Since UserNav requires an email prop which we might not have efficiently passed down here without fetching, 
                             we might just put a static logout or need to fetch user in Sidebar (client component limitation).
                             However, Layout passes 'role', but not 'user' object. 
                             Let's assume for now we just show the role nicely and maybe a logout icon. 
                         */}
                        <button
                            disabled={isPending}
                            onClick={() => {
                                startTransition(async () => {
                                    try {
                                        await logout();
                                    } catch (error) {
                                        console.error('Logout failed:', error);
                                        window.location.href = '/login';
                                    }
                                });
                            }}
                            className={cn(
                                "p-2 hover:bg-white/10 rounded-full transition-colors text-emerald-200 hover:text-white cursor-pointer",
                                isPending && "opacity-50 cursor-not-allowed"
                            )}
                            title="Keluar"
                        >
                            {isPending ? (
                                <div className="h-4 w-4 border-2 border-emerald-200 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
