'use client';

import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    HiOutlineBars3,
    HiOutlineArrowRightOnRectangle,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineMagnifyingGlass,
    HiOutlineBell,
    HiOutlineChevronRight,
} from 'react-icons/hi2';

interface HeaderProps {
    onMenuToggle: () => void;
    userName?: string;
}

function getBreadcrumbs(pathname: string) {
    const parts = pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];
    let path = '';
    for (const part of parts) {
        path += `/${part}`;
        const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
        crumbs.push({ label, href: path });
    }
    return crumbs;
}

export default function Header({ onMenuToggle, userName }: HeaderProps) {
    const pathname = usePathname();
    const breadcrumbs = getBreadcrumbs(pathname);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90 md:px-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 lg:hidden dark:hover:bg-zinc-800 transition-colors"
                >
                    <HiOutlineBars3 className="h-5 w-5" />
                </button>

                {/* Breadcrumbs */}
                <nav className="hidden md:flex items-center gap-1 text-sm">
                    {breadcrumbs.map((crumb, i) => (
                        <span key={crumb.href} className="flex items-center gap-1">
                            {i > 0 && <HiOutlineChevronRight className="h-3 w-3 text-zinc-300 dark:text-zinc-600" />}
                            {i === breadcrumbs.length - 1 ? (
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{crumb.label}</span>
                            ) : (
                                <Link href={crumb.href} className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors">
                                    {crumb.label}
                                </Link>
                            )}
                        </span>
                    ))}
                </nav>

                {/* Mobile: just show page title */}
                <span className="md:hidden text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'}
                </span>
            </div>

            <div className="flex items-center gap-2">
                {/* Visit Site */}
                <Link
                    href="/"
                    target="_blank"
                    className="hidden md:flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                >
                    <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
                    Visit Site
                </Link>

                <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 hidden md:block" />

                {/* User info + logout */}
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20">
                        {userName ? userName.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 leading-tight">
                            {userName || 'Admin'}
                        </p>
                        <p className="text-[10px] text-zinc-400">Administrator</p>
                    </div>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-1.5 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    title="Sign out"
                >
                    <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                </button>
            </div>
        </header>
    );
}
