'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineClipboardDocumentList,
    HiOutlineMagnifyingGlass,
    HiOutlineXMark,
} from 'react-icons/hi2';
import ConfirmDialog from '../components/ConfirmDialog';

interface RfqForm {
    id: string;
    name: string;
    description: string;
    _count: { submissions: number; products: number };
    createdAt: string;
}

export default function RfqFormsListPage() {
    const [forms, setForms] = useState<RfqForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/rfq-forms').then(r => r.json()).then(d => { setForms(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    async function handleDelete() {
        if (!deleteId) return;
        setDeleting(true);
        await fetch(`/api/rfq-forms/${deleteId}`, { method: 'DELETE' });
        setForms(forms.filter(f => f.id !== deleteId));
        setDeleteId(null);
        setDeleting(false);
    }

    const filtered = forms.filter(f => {
        if (!search) return true;
        const s = search.toLowerCase();
        return f.name.toLowerCase().includes(s) || (f.description || '').toLowerCase().includes(s);
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Loading RFQ forms...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                            <HiOutlineClipboardDocumentList className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        RFQ Forms
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 ml-[52px]">
                        Manage request for quote form configurations
                    </p>
                </div>
                <Link href="/dashboard/rfq-forms/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200">
                    <HiOutlinePlus className="h-4 w-4" /> New RFQ Form
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search forms..."
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
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Form Name</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden sm:table-cell">Products</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Submissions</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden md:table-cell">Created</th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-5 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                            <HiOutlineClipboardDocumentList className="h-6 w-6 text-zinc-400" />
                                        </div>
                                        <p className="text-sm font-medium text-zinc-500">{search ? 'No forms match your search' : 'No RFQ forms yet'}</p>
                                        {!search && (
                                            <Link href="/dashboard/rfq-forms/new" className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                                                Create your first form →
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map(form => (
                            <tr key={form.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/10 flex-shrink-0">
                                            <HiOutlineClipboardDocumentList className="h-4 w-4 text-violet-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-zinc-800 dark:text-white truncate">{form.name}</p>
                                            {form.description && <p className="text-[11px] text-zinc-400 truncate">{form.description}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 hidden sm:table-cell">
                                    <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                        {form._count.products}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                        {form._count.submissions}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-xs text-zinc-400 hidden md:table-cell">{new Date(form.createdAt).toLocaleDateString()}</td>
                                <td className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link href={`/dashboard/rfq-forms/${form.id}/submissions`} className="rounded-lg p-2 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 transition-colors" title="View Submissions">
                                            <HiOutlineEye className="h-4 w-4" />
                                        </Link>
                                        <Link href={`/dashboard/rfq-forms/${form.id}/edit`} className="rounded-lg p-2 text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 transition-colors" title="Edit">
                                            <HiOutlinePencilSquare className="h-4 w-4" />
                                        </Link>
                                        <button onClick={() => setDeleteId(form.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors" title="Delete">
                                            <HiOutlineTrash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmDialog isOpen={!!deleteId} title="Delete RFQ Form" message="This will also delete all submissions for this form." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={deleting} />
        </div>
    );
}
