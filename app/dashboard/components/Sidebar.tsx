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
    HiOutlineBars3,
    HiOutlineChatBubbleBottomCenterText,
    HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2';

const navSections = [
    {
        title: 'Overview',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
        ],
    },
    {
        title: 'Content',
        items: [
            { label: 'Pages', href: '/dashboard/pages', icon: HiOutlineDocumentText },
            { label: 'Blogs', href: '/dashboard/blogs', icon: HiOutlinePencilSquare },
            { label: 'Media Library', href: '/dashboard/media', icon: HiOutlinePhoto },
            { label: 'Navigation', href: '/dashboard/navigation', icon: HiOutlineBars3 },
        ],
    },
    {
        title: 'Commerce',
        items: [
            { label: 'Categories', href: '/dashboard/categories', icon: HiOutlineFolder },
            { label: 'Products', href: '/dashboard/products', icon: HiOutlineCube },
            { label: 'RFQ Forms', href: '/dashboard/rfq-forms', icon: HiOutlineClipboardDocumentList },
            { label: 'Quote Requests', href: '/dashboard/quote-requests', icon: HiOutlineChatBubbleBottomCenterText },
        ],
    },
    {
        title: 'System',
        items: [
            { label: 'Settings', href: '/dashboard/settings', icon: HiOutlineCog6Tooth },
        ],
    },
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
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 flex h-full w-[240px] flex-col bg-white border-r border-zinc-200/80 transition-transform duration-300 ease-in-out dark:bg-zinc-950 dark:border-zinc-800 lg:relative lg:z-auto lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo area */}
                <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800/50 flex-shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 text-xs font-bold text-white shadow-md shadow-indigo-500/20">
                            E
                        </div>
                        <div className="leading-tight">
                            <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight block">
                                Econiya
                            </span>
                            <span className="text-[9px] font-medium text-zinc-400 tracking-wider uppercase">Admin</span>
                        </div>
                    </Link>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 lg:hidden dark:hover:bg-zinc-800 transition-colors"
                    >
                        <HiOutlineXMark className="h-4 w-4" />
                    </button>
                </div>

                {/* Navigation - thin scrollbar */}
                <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 sidebar-scroll">
                    {navSections.map((section) => (
                        <div key={section.title}>
                            <p className="mb-1 px-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-400/80 dark:text-zinc-500">
                                {section.title}
                            </p>
                            <ul className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive =
                                        item.href === '/dashboard'
                                            ? pathname === '/dashboard'
                                            : pathname.startsWith(item.href);

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={onClose}
                                                className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150 ${isActive
                                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
                                                    }`}
                                            >
                                                <item.icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
                                                <span className="truncate">{item.label}</span>
                                                {isActive && (
                                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800/50 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                            <HiOutlineWrenchScrewdriver className="h-3 w-3 text-zinc-400" />
                        </div>
                        <div className="leading-tight">
                            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Econiya CMS</p>
                            <p className="text-[9px] text-zinc-400">v1.0.0</p>
                        </div>
                    </div>
                </div>
            </aside>

            <style jsx global>{`
                .sidebar-scroll::-webkit-scrollbar {
                    width: 3px;
                }
                .sidebar-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb {
                    background-color: rgba(161, 161, 170, 0.3);
                    border-radius: 3px;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(161, 161, 170, 0.5);
                }
                .sidebar-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(161, 161, 170, 0.3) transparent;
                }
            `}</style>
        </>
    );
}
