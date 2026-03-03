'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineFolder,
    HiOutlineMagnifyingGlass,
    HiOutlineXMark,
} from 'react-icons/hi2';
import ConfirmDialog from '../components/ConfirmDialog';

interface Category {
    id: string;
    name: string;
    slug: string;
    isPublished: boolean;
    sortOrder: number;
    _count: { products: number };
}

export default function CategoriesListPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(d => { setCategories(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    async function handleDelete() {
        if (!deleteId) return;
        setDeleting(true);
        await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' });
        setCategories(categories.filter(c => c.id !== deleteId));
        setDeleteId(null);
        setDeleting(false);
    }

    const filtered = categories.filter(c => {
        if (!search) return true;
        const s = search.toLowerCase();
        return c.name.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s);
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Loading categories...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                            <HiOutlineFolder className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        Categories
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 ml-[52px]">
                        {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} total
                    </p>
                </div>
                <Link href="/dashboard/categories/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200">
                    <HiOutlinePlus className="h-4 w-4" /> New Category
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search categories..."
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
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Category</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden sm:table-cell">Products</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden md:table-cell">Order</th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                            <HiOutlineFolder className="h-6 w-6 text-zinc-400" />
                                        </div>
                                        <p className="text-sm font-medium text-zinc-500">{search ? 'No categories match your search' : 'No categories yet'}</p>
                                        {!search && (
                                            <Link href="/dashboard/categories/new" className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                                                Create your first category →
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map(cat => (
                            <tr key={cat.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 flex-shrink-0">
                                            <HiOutlineFolder className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-zinc-800 dark:text-white truncate">{cat.name}</p>
                                            <p className="text-[11px] text-zinc-400 truncate">/{cat.slug}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 hidden sm:table-cell">
                                    <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                        {cat._count.products} product{cat._count.products !== 1 ? 's' : ''}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-sm text-zinc-500 hidden md:table-cell">
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                        {cat.sortOrder}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link href={`/dashboard/categories/${cat.id}/edit`} className="rounded-lg p-2 text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 transition-colors" title="Edit">
                                            <HiOutlinePencilSquare className="h-4 w-4" />
                                        </Link>
                                        <button onClick={() => setDeleteId(cat.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors" title="Delete">
                                            <HiOutlineTrash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmDialog isOpen={!!deleteId} title="Delete Category" message="Deleting a category will also delete all its products." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={deleting} />
        </div>
    );
}
