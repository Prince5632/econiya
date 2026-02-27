'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import dynamic from 'next/dynamic';
import SeoFields from '../../components/SeoFields';

const RichTextEditor = dynamic(() => import('../../components/RichTextEditor'), { ssr: false });

export default function NewBlogPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [form, setForm] = useState({
        title: '', slug: '', excerpt: '', content: '', thumbnail: '', featuredImage: '',
        tags: [] as string[], isPublished: false,
        metaTitle: '', metaDescription: '', metaKeywords: '', ogImage: '',
    });

    function updateField(field: string, value: any) { setForm(prev => ({ ...prev, [field]: value })); }

    function addTag() {
        const tag = tagInput.trim();
        if (tag && !form.tags.includes(tag)) {
            updateField('tags', [...form.tags, tag]);
            setTagInput('');
        }
    }

    function removeTag(tag: string) {
        updateField('tags', form.tags.filter(t => t !== tag));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setSaving(true); setError('');
        const res = await fetch('/api/blogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (res.ok) router.push('/dashboard/blogs');
        else { const data = await res.json(); setError(data.error); setSaving(false); }
    }

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">New Blog Post</h1>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title *</label>
                        <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} required className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Excerpt</label>
                        <textarea value={form.excerpt} onChange={e => updateField('excerpt', e.target.value)} rows={2} placeholder="Brief summary of the blog post" className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Content</label>
                        <RichTextEditor content={form.content} onChange={html => updateField('content', html)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Thumbnail URL</label>
                            <input type="text" value={form.thumbnail} onChange={e => updateField('thumbnail', e.target.value)} placeholder="Small preview image" className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Featured Image URL</label>
                            <input type="text" value={form.featuredImage} onChange={e => updateField('featuredImage', e.target.value)} placeholder="Main hero image" className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                        </div>
                    </div>
                    {/* Tags */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tags</label>
                        <div className="flex gap-2">
                            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Add a tag and press Enter" className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                            <button type="button" onClick={addTag} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">Add</button>
                        </div>
                        {form.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {form.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-violet-900">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input type="checkbox" checked={form.isPublished} onChange={e => updateField('isPublished', e.target.checked)} className="peer sr-only" />
                            <div className="peer h-6 w-11 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-zinc-600" />
                        </label>
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Publish immediately</span>
                    </div>
                </div>
                <SeoFields metaTitle={form.metaTitle} metaDescription={form.metaDescription} metaKeywords={form.metaKeywords} ogImage={form.ogImage} slug={form.slug} onChange={updateField} onSlugGenerate={() => updateField('slug', slugify(form.title, { lower: true, strict: true }))} />
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => router.back()} className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
                    <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create Blog Post'}</button>
                </div>
            </form>
        </div>
    );
}
