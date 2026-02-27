'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import dynamic from 'next/dynamic';
import SeoFields from '../../components/SeoFields';

const RichTextEditor = dynamic(() => import('../../components/RichTextEditor'), { ssr: false });

export default function NewPagePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        slug: '',
        content: '',
        isPublished: false,
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        ogImage: '',
    });

    function updateField(field: string, value: string | boolean) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function generateSlug() {
        updateField('slug', slugify(form.title, { lower: true, strict: true }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError('');

        const res = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            router.push('/dashboard/pages');
        } else {
            const data = await res.json();
            setError(data.error || 'Failed to create page');
            setSaving(false);
        }
    }

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Create New Page</h1>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Page Title *
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                required
                                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Content
                            </label>
                            <RichTextEditor content={form.content} onChange={(html) => updateField('content', html)} />
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={form.isPublished}
                                    onChange={(e) => updateField('isPublished', e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-zinc-600" />
                            </label>
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">Publish immediately</span>
                        </div>
                    </div>
                </div>

                <SeoFields
                    metaTitle={form.metaTitle}
                    metaDescription={form.metaDescription}
                    metaKeywords={form.metaKeywords}
                    ogImage={form.ogImage}
                    slug={form.slug}
                    onChange={updateField}
                    onSlugGenerate={generateSlug}
                />

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Create Page'}
                    </button>
                </div>
            </form>
        </div>
    );
}
