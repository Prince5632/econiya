'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2';
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

    useEffect(() => {
        fetch('/api/rfq-forms').then(r => r.json()).then(d => { setForms(d); setLoading(false); });
    }, []);

    async function handleDelete() {
        if (!deleteId) return;
        setDeleting(true);
        await fetch(`/api/rfq-forms/${deleteId}`, { method: 'DELETE' });
        setForms(forms.filter(f => f.id !== deleteId));
        setDeleteId(null);
        setDeleting(false);
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">RFQ Forms</h1>
                    <p className="mt-1 text-sm text-zinc-500">Manage request for quote form configurations</p>
                </div>
                <Link href="/dashboard/rfq-forms/new" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                    <HiOutlinePlus className="h-4 w-4" /> New RFQ Form
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Form Name</th>
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Linked Products</th>
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Submissions</th>
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Created</th>
                            <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {forms.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-400">No RFQ forms yet.</td></tr>
                        ) : forms.map(form => (
                            <tr key={form.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-zinc-900 dark:text-white">{form.name}</p>
                                    {form.description && <p className="mt-0.5 text-xs text-zinc-400">{form.description}</p>}
                                </td>
                                <td className="px-4 py-3"><span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{form._count.products}</span></td>
                                <td className="px-4 py-3"><span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{form._count.submissions}</span></td>
                                <td className="px-4 py-3 text-zinc-500">{new Date(form.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/dashboard/rfq-forms/${form.id}/submissions`} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" title="View Submissions"><HiOutlineEye className="h-4 w-4" /></Link>
                                        <Link href={`/dashboard/rfq-forms/${form.id}/edit`} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"><HiOutlinePencilSquare className="h-4 w-4" /></Link>
                                        <button onClick={() => setDeleteId(form.id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><HiOutlineTrash className="h-4 w-4" /></button>
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
