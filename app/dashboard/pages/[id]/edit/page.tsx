'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { HiOutlineEye } from 'react-icons/hi2';
import slugify from 'slugify';
import dynamic from 'next/dynamic';
import SeoFields from '../../../components/SeoFields';

const RichTextEditor = dynamic(() => import('../../../components/RichTextEditor'), { ssr: false });

export default function EditPagePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetch(`/api/pages/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setForm({
                    title: data.title || '',
                    slug: data.slug || '',
                    content: data.content || '',
                    isPublished: data.isPublished || false,
                    metaTitle: data.metaTitle || '',
                    metaDescription: data.metaDescription || '',
                    metaKeywords: data.metaKeywords || '',
                    ogImage: data.ogImage || '',
                });
                setLoading(false);
            });
    }, [id]);

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

        const res = await fetch(`/api/pages/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            router.push('/dashboard/pages');
        } else {
            const data = await res.json();
            setError(data.error || 'Failed to update page');
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Edit Page</h1>

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
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">Published</span>
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
                    {form.slug && (
                        <a
                            href={`/${form.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            <HiOutlineEye className="h-4 w-4" />
                            Preview
                        </a>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Update Page'}
                    </button>
                </div>
            </form>
        </div>
    );
}
