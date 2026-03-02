'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import slugify from 'slugify';
import dynamic from 'next/dynamic';
import SeoFields from '../../../components/SeoFields';
import { HiOutlineEye, HiOutlinePhoto } from 'react-icons/hi2';

const RichTextEditor = dynamic(() => import('../../../components/RichTextEditor'), { ssr: false });

const statusOptions = [
    { value: 'DRAFT', label: 'Draft', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
    { value: 'PUBLISHED', label: 'Published', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
];

function calcReadTime(html: string) {
    const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [form, setForm] = useState({
        title: '', slug: '', excerpt: '', content: '',
        thumbnail: '', featuredImage: '',
        tags: [] as string[],
        category: '', authorName: 'Admin', authorAvatar: '',
        status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
        readTime: 1,
        metaTitle: '', metaDescription: '', metaKeywords: '', ogImage: '',
    });

    useEffect(() => {
        fetch(`/api/blogs/${id}`).then(r => r.json()).then(data => {
            setForm({
                title: data.title || '',
                slug: data.slug || '',
                excerpt: data.excerpt || '',
                content: data.content || '',
                thumbnail: data.thumbnail || '',
                featuredImage: data.featuredImage || '',
                tags: data.tags || [],
                category: data.category || '',
                authorName: data.authorName || 'Admin',
                authorAvatar: data.authorAvatar || '',
                status: (data.status || 'DRAFT') as 'DRAFT' | 'PUBLISHED',
                readTime: data.readTime || 1,
                metaTitle: data.metaTitle || '',
                metaDescription: data.metaDescription || '',
                metaKeywords: data.metaKeywords || '',
                ogImage: data.ogImage || '',
            });
            setLoading(false);
        });
    }, [id]);

    function updateField(field: string, value: unknown) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function addTag() {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !form.tags.includes(tag)) { updateField('tags', [...form.tags, tag]); setTagInput(''); }
    }
    function removeTag(tag: string) { updateField('tags', form.tags.filter(t => t !== tag)); }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setSaving(true); setError('');
        const payload = { ...form, readTime: form.content ? calcReadTime(form.content) : form.readTime };
        const res = await fetch(`/api/blogs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) router.push('/dashboard/blogs');
        else { const d = await res.json(); setError(d.error?.fieldErrors ? Object.values(d.error.fieldErrors).flat().join(', ') : d.error); setSaving(false); }
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>;

    const currentStatus = statusOptions.find(s => s.value === form.status)!;

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Edit Blog Post</h1>
                <div className="flex items-center gap-2">
                    {form.slug && (
                        <a href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
                            <HiOutlineEye className="h-4 w-4" /> Preview
                        </a>
                    )}
                </div>
            </div>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Content</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">Status:</span>
                            <button type="button"
                                onClick={() => updateField('status', form.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT')}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${currentStatus.color}`}>
                                {currentStatus.label}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title *</label>
                        <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} required
                            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Excerpt</label>
                        <textarea value={form.excerpt} onChange={e => updateField('excerpt', e.target.value)} rows={2}
                            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-center justify-between">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Content</label>
                            <span className="text-xs text-zinc-400">~{form.readTime} min read</span>
                        </div>
                        <RichTextEditor content={form.content} onChange={html => updateField('content', html)} />
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Post Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
                            <input type="text" value={form.category} onChange={e => updateField('category', e.target.value)}
                                placeholder="e.g. Industry News"
                                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Author Name</label>
                            <input type="text" value={form.authorName} onChange={e => updateField('authorName', e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                <HiOutlinePhoto className="inline h-3.5 w-3.5 mr-1" />Cover Image URL
                            </label>
                            <input type="text" value={form.featuredImage} onChange={e => updateField('featuredImage', e.target.value)}
                                placeholder="https://…"
                                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Thumbnail URL</label>
                            <input type="text" value={form.thumbnail} onChange={e => updateField('thumbnail', e.target.value)}
                                placeholder="https://…"
                                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tags</label>
                        <div className="flex gap-2">
                            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                placeholder="Add tag and press Enter"
                                className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                            <button type="button" onClick={addTag}
                                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">Add</button>
                        </div>
                        {form.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {form.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                                        {tag}<button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-violet-900">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <SeoFields metaTitle={form.metaTitle} metaDescription={form.metaDescription}
                    metaKeywords={form.metaKeywords} ogImage={form.ogImage} slug={form.slug}
                    onChange={updateField}
                    onSlugGenerate={() => updateField('slug', slugify(form.title, { lower: true, strict: true }))} />

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => router.back()}
                        className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
                    <button type="submit" disabled={saving}
                        className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                        {saving ? 'Saving…' : form.status === 'PUBLISHED' ? 'Update & Publish' : 'Save Draft'}
                    </button>
                </div>
            </form>
        </div>
    );
}
