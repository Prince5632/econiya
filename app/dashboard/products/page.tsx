'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineMagnifyingGlass,
    HiOutlineXMark,
    HiOutlineCube,
    HiOutlineEye,
    HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

interface Product {
    id: string;
    name: string;
    slug: string;
    isPublished: boolean;
    category: { name: string };
    updatedAt: string;
}

export default function ProductsListPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/products').then(r => r.json()).then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    async function handleDelete() {
        if (!deleteId) return;
        setDeleting(true);
        await fetch(`/api/products/${deleteId}`, { method: 'DELETE' });
        setProducts(products.filter(p => p.id !== deleteId));
        setDeleteId(null);
        setDeleting(false);
    }

    const filtered = products.filter(p => {
        if (!search) return true;
        const s = search.toLowerCase();
        return p.name.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s) || (p.category?.name || '').toLowerCase().includes(s);
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Loading products...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                            <HiOutlineCube className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Products
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 ml-[52px]">
                        {products.length} product{products.length !== 1 ? 's' : ''} total
                    </p>
                </div>
                <Link href="/dashboard/products/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200">
                    <HiOutlinePlus className="h-4 w-4" /> New Product
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search products by name, slug, or category..."
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
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Product</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden sm:table-cell">Category</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden md:table-cell">Updated</th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-5 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                            <HiOutlineCube className="h-6 w-6 text-zinc-400" />
                                        </div>
                                        <p className="text-sm font-medium text-zinc-500">{search ? 'No products match your search' : 'No products yet'}</p>
                                        {!search && (
                                            <Link href="/dashboard/products/new" className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                                                Create your first product →
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map(product => (
                            <tr key={product.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex-shrink-0">
                                            <HiOutlineCube className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-zinc-800 dark:text-white truncate">{product.name}</p>
                                            <p className="text-[11px] text-zinc-400 truncate">/{product.slug}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 hidden sm:table-cell">
                                    <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                        {product.category?.name || '—'}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5"><StatusBadge isPublished={product.isPublished} /></td>
                                <td className="px-5 py-3.5 text-xs text-zinc-400 hidden md:table-cell">{new Date(product.updatedAt).toLocaleDateString()}</td>
                                <td className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link href={`/products/${product.slug}`} target="_blank" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition-colors" title="View on site">
                                            <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
                                        </Link>
                                        <Link href={`/dashboard/products/${product.id}/edit`} className="rounded-lg p-2 text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 transition-colors" title="Edit">
                                            <HiOutlinePencilSquare className="h-4 w-4" />
                                        </Link>
                                        <button onClick={() => setDeleteId(product.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors" title="Delete">
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
                Showing {filtered.length} of {products.length} products
            </p>
            <ConfirmDialog isOpen={!!deleteId} title="Delete Product" message="Are you sure? This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={deleting} />
        </div>
    );
}
