'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineDocumentText,
    HiOutlineMagnifyingGlass,
    HiOutlineXMark,
    HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

interface Page {
    id: string;
    title: string;
    slug: string;
    status: string;
    isPublished: boolean;
    pageType: string;
    updatedAt: string;
}

export default function PagesListPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

    async function fetchPages() {
        try {
            const res = await fetch('/api/pages');
            const data = await res.json();
            setPages(Array.isArray(data) ? data : []);
        } catch {
            setPages([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!deleteId) return;
        setDeleting(true);
        await fetch(`/api/pages/${deleteId}`, { method: 'DELETE' });
        setPages(pages.filter((p) => p.id !== deleteId));
        setDeleteId(null);
        setDeleting(false);
    }

    const filtered = pages.filter(p => {
        if (!search) return true;
        const s = search.toLowerCase();
        return p.title.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s);
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Loading pages...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                            <HiOutlineDocumentText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        Pages
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 ml-[52px]">
                        {pages.length} page{pages.length !== 1 ? 's' : ''} total
                    </p>
                </div>
                <Link href="/dashboard/pages/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200">
                    <HiOutlinePlus className="h-4 w-4" /> New Page
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search pages by title or slug..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-800 placeholder-zinc-400 transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-indigo-500/50 dark:focus:ring-indigo-500/10"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                        <HiOutlineXMark className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800/50 dark:bg-zinc-900/50">
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Page</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden md:table-cell">Updated</th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                            <HiOutlineDocumentText className="h-6 w-6 text-zinc-400" />
                                        </div>
                                        <p className="text-sm font-medium text-zinc-500">{search ? 'No pages match your search' : 'No pages yet'}</p>
                                        {!search && (
                                            <Link href="/dashboard/pages/new" className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                                                Create your first page →
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map((page) => (
                            <tr key={page.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/10 flex-shrink-0">
                                            <HiOutlineDocumentText className="h-4 w-4 text-violet-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-zinc-800 dark:text-white truncate">{page.title}</p>
                                            <p className="text-[11px] text-zinc-400 truncate">/{page.slug}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <StatusBadge isPublished={page.isPublished} />
                                </td>
                                <td className="px-5 py-3.5 text-xs text-zinc-400 hidden md:table-cell">
                                    {new Date(page.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {page.isPublished && (
                                            <Link href={`/${page.slug}`} target="_blank" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition-colors" title="View on site">
                                                <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
                                            </Link>
                                        )}
                                        <Link href={`/dashboard/pages/${page.id}/edit`} className="rounded-lg p-2 text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 transition-colors" title="Edit">
                                            <HiOutlinePencilSquare className="h-4 w-4" />
                                        </Link>
                                        <button onClick={() => setDeleteId(page.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors" title="Delete">
                                            <HiOutlineTrash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-zinc-400 ml-1">
                Showing {filtered.length} of {pages.length} pages
            </p>
            <ConfirmDialog
                isOpen={!!deleteId}
                title="Delete Page"
                message="Are you sure you want to delete this page? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                isLoading={deleting}
            />
        </div>
    );
}
