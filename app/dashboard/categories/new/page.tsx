'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import SeoFields from '../../components/SeoFields';

export default function NewCategoryPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '', slug: '', description: '', image: '', sortOrder: 0, isPublished: true,
        metaTitle: '', metaDescription: '', metaKeywords: '', ogImage: '',
    });

    function updateField(field: string, value: any) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError('');
        const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (res.ok) router.push('/dashboard/categories');
        else { const data = await res.json(); setError(data.error); setSaving(false); }
    }

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">New Category</h1>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category Name *</label>
                        <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)} required className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                        <textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={3} className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Image URL</label>
                        <input type="text" value={form.image} onChange={e => updateField('image', e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Sort Order</label>
                            <input type="number" value={form.sortOrder} onChange={e => updateField('sortOrder', parseInt(e.target.value) || 0)} className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={form.isPublished} onChange={e => updateField('isPublished', e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-indigo-600" />
                                <span className="text-sm text-zinc-700 dark:text-zinc-300">Published</span>
                            </label>
                        </div>
                    </div>
                </div>

                <SeoFields metaTitle={form.metaTitle} metaDescription={form.metaDescription} metaKeywords={form.metaKeywords} ogImage={form.ogImage} slug={form.slug} onChange={updateField} onSlugGenerate={() => updateField('slug', slugify(form.name, { lower: true, strict: true }))} />

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => router.back()} className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
                    <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create Category'}</button>
                </div>
            </form>
        </div>
    );
}
