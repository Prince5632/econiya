'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HiOutlineDocumentText,
    HiOutlineFolder,
    HiOutlineCube,
    HiOutlineClipboardDocumentList,
    HiOutlinePencilSquare,
    HiOutlinePhoto,
    HiOutlineCog6Tooth,
    HiOutlineHome,
    HiOutlineXMark,
} from 'react-icons/hi2';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
    { label: 'Pages', href: '/dashboard/pages', icon: HiOutlineDocumentText },
    { label: 'Categories', href: '/dashboard/categories', icon: HiOutlineFolder },
    { label: 'Products', href: '/dashboard/products', icon: HiOutlineCube },
    { label: 'RFQ Forms', href: '/dashboard/rfq-forms', icon: HiOutlineClipboardDocumentList },
    { label: 'Blogs', href: '/dashboard/blogs', icon: HiOutlinePencilSquare },
    { label: 'Media', href: '/dashboard/media', icon: HiOutlinePhoto },
    { label: 'Settings', href: '/dashboard/settings', icon: HiOutlineCog6Tooth },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950 lg:relative lg:z-auto lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo area */}
                <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                            C
                        </div>
                        <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                            CMS Admin
                        </span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800"
                    >
                        <HiOutlineXMark className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive =
                                item.href === '/dashboard'
                                    ? pathname === '/dashboard'
                                    : pathname.startsWith(item.href);

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        <item.icon className="h-5 w-5 flex-shrink-0" />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                    <p className="text-xs text-zinc-400">© 2026 CMS Admin</p>
                </div>
            </aside>
        </>
    );
}
