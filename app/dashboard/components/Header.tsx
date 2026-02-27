'use client';

import { signOut } from 'next-auth/react';
import { HiOutlineBars3, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';

interface HeaderProps {
    onMenuToggle: () => void;
    userName?: string;
}

export default function Header({ onMenuToggle, userName }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 md:px-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800"
                >
                    <HiOutlineBars3 className="h-5 w-5" />
                </button>
                <h1 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Welcome back
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                        {userName ? userName.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <span className="hidden text-sm font-medium text-zinc-700 md:block dark:text-zinc-300">
                        {userName || 'Admin'}
                    </span>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}
