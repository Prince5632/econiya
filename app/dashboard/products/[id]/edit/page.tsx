'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import slugify from 'slugify';
import dynamic from 'next/dynamic';
import SeoFields from '../../../components/SeoFields';

const RichTextEditor = dynamic(() => import('../../../components/RichTextEditor'), { ssr: false });

interface Category { id: string; name: string; }
interface RfqForm { id: string; name: string; }

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [rfqForms, setRfqForms] = useState<RfqForm[]>([]);
    const [form, setForm] = useState({
        name: '', slug: '', description: '', content: '', categoryId: '', rfqFormId: '',
        images: [] as string[], isPublished: false, sortOrder: 0,
        metaTitle: '', metaDescription: '', metaKeywords: '', ogImage: '',
    });

    useEffect(() => {
        Promise.all([
            fetch(`/api/products/${id}`).then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/rfq-forms').then(r => r.json()),
        ]).then(([data, cats, forms]) => {
            setCategories(cats);
            setRfqForms(forms);
            setForm({
                name: data.name || '', slug: data.slug || '', description: data.description || '',
                content: data.content || '', categoryId: data.categoryId || '', rfqFormId: data.rfqFormId || '',
                images: data.images || [], isPublished: data.isPublished || false, sortOrder: data.sortOrder || 0,
                metaTitle: data.metaTitle || '', metaDescription: data.metaDescription || '',
                metaKeywords: data.metaKeywords || '', ogImage: data.ogImage || '',
            });
            setLoading(false);
        });
    }, [id]);

    function updateField(field: string, value: any) { setForm(prev => ({ ...prev, [field]: value })); }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setSaving(true); setError('');
        const res = await fetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, images: form.images.length ? form.images : null }) });
        if (res.ok) router.push('/dashboard/products');
        else { const data = await res.json(); setError(data.error); setSaving(false); }
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>;

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Edit Product</h1>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Product Name *</label>
                        <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)} required className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category *</label>
                            <select value={form.categoryId} onChange={e => updateField('categoryId', e.target.value)} required className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">RFQ Form</label>
                            <select value={form.rfqFormId} onChange={e => updateField('rfqFormId', e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
                                <option value="">No RFQ form</option>
                                {rfqForms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Short Description</label>
                        <textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Content</label>
                        <RichTextEditor content={form.content} onChange={html => updateField('content', html)} />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input type="checkbox" checked={form.isPublished} onChange={e => updateField('isPublished', e.target.checked)} className="peer sr-only" />
                            <div className="peer h-6 w-11 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-zinc-600" />
                        </label>
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Published</span>
                    </div>
                </div>
                <SeoFields metaTitle={form.metaTitle} metaDescription={form.metaDescription} metaKeywords={form.metaKeywords} ogImage={form.ogImage} slug={form.slug} onChange={updateField} onSlugGenerate={() => updateField('slug', slugify(form.name, { lower: true, strict: true }))} />
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => router.back()} className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
                    <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Update Product'}</button>
                </div>
            </form>
        </div>
    );
}
