'use client';

import { useState } from 'react';
import { HiOutlineHandThumbUp } from 'react-icons/hi2';

interface Comment {
    id: string;
    name: string;
    body: string;
    createdAt: string;
}

interface Props {
    blogId: string;
    initialComments: Comment[];
}

export default function CommentSection({ blogId, initialComments }: Props) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [form, setForm] = useState({ name: '', email: '', body: '', website: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true); setError('');
        const res = await fetch(`/api/blogs/${blogId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            setSubmitted(true);
            setForm({ name: '', email: '', body: '', website: '' });
        } else {
            const d = await res.json();
            setError(d.error?.fieldErrors ? Object.values(d.error.fieldErrors).flat().join(', ') : (d.error ?? 'Failed to submit'));
        }
        setSubmitting(false);
    }

    return (
        <section id="comments" className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
            <h2 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-white">
                Comments {comments.length > 0 && <span className="ml-1 text-base font-normal text-zinc-400">({comments.length})</span>}
            </h2>

            {/* Approved comment list */}
            {comments.length > 0 && (
                <div className="mb-10 space-y-6">
                    {comments.map(c => (
                        <div key={c.id} className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                                {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">{c.name}</span>
                                    <span className="text-xs text-zinc-400">{new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{c.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form */}
            {submitted ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-500/20 dark:bg-green-500/5">
                    <HiOutlineHandThumbUp className="mx-auto mb-2 h-8 w-8 text-green-500" />
                    <p className="font-semibold text-green-800 dark:text-green-400">Thanks for your comment!</p>
                    <p className="mt-1 text-sm text-green-600 dark:text-green-500/80">It will appear after moderation.</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-white">Leave a Comment</h3>
                    {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Honeypot — hidden from real users */}
                        <input type="text" name="website" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                            tabIndex={-1} aria-hidden="true" className="hidden" autoComplete="off" />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name *</label>
                                <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Your name"
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email *</label>
                                <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    placeholder="your@email.com (not shown)"
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Comment *</label>
                            <textarea required rows={4} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                                placeholder="Share your thoughts…"
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <button type="submit" disabled={submitting}
                            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                            {submitting ? 'Submitting…' : 'Post Comment'}
                        </button>
                    </form>
                </div>
            )}
        </section>
    );
}
