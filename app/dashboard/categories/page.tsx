'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
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

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(d => { setCategories(d); setLoading(false); });
    }, []);

    async function handleDelete() {
        if (!deleteId) return;
        setDeleting(true);
        await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' });
        setCategories(categories.filter(c => c.id !== deleteId));
        setDeleteId(null);
        setDeleting(false);
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Categories</h1>
                    <p className="mt-1 text-sm text-zinc-500">Manage product categories</p>
                </div>
                <Link href="/dashboard/categories/new" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                    <HiOutlinePlus className="h-4 w-4" /> New Category
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Slug</th>
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Products</th>
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Order</th>
                            <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {categories.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-400">No categories yet.</td></tr>
                        ) : categories.map(cat => (
                            <tr key={cat.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{cat.name}</td>
                                <td className="px-4 py-3 text-zinc-500">/{cat.slug}</td>
                                <td className="px-4 py-3"><span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">{cat._count.products}</span></td>
                                <td className="px-4 py-3 text-zinc-500">{cat.sortOrder}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/dashboard/categories/${cat.id}/edit`} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"><HiOutlinePencilSquare className="h-4 w-4" /></Link>
                                        <button onClick={() => setDeleteId(cat.id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><HiOutlineTrash className="h-4 w-4" /></button>
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
