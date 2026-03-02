'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineCheck, HiOutlineXMark, HiOutlineTrash, HiOutlineArrowLeft, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

interface Comment {
    id: string;
    name: string;
    body: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
] as const;

type Tab = typeof TABS[number]['key'];

export default function BlogCommentsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('pending');
    const [blogTitle, setBlogTitle] = useState('');

    useEffect(() => {
        Promise.all([
            fetch(`/api/blogs/${id}`, { headers: { 'x-admin': '1' } }).then(r => r.json()),
            fetch(`/api/blogs/${id}/comments`, { headers: { 'x-admin': '1' } }).then(r => r.json()),
        ]).then(([blog, cmts]) => {
            setBlogTitle(blog.title || 'Blog');
            setComments(cmts);
            setLoading(false);
        });
    }, [id]);

    async function moderate(commentId: string, status: 'approved' | 'rejected') {
        await fetch(`/api/blogs/${id}/comments/${commentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, status } : c));
    }

    async function remove(commentId: string) {
        if (!confirm('Delete this comment permanently?')) return;
        await fetch(`/api/blogs/${id}/comments/${commentId}`, { method: 'DELETE' });
        setComments(prev => prev.filter(c => c.id !== commentId));
    }

    const filtered = activeTab === 'all' ? comments : comments.filter(c => c.status === activeTab);
    const pendingCount = comments.filter(c => c.status === 'pending').length;

    const statusBadge: Record<Comment['status'], string> = {
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        approved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    };

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>;

    return (
        <div>
            <div className="mb-6 flex items-center gap-4">
                <Link href="/dashboard/blogs" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <HiOutlineArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <HiOutlineChatBubbleLeftRight className="h-6 w-6 text-indigo-500" />
                        Comments
                        {pendingCount > 0 && (
                            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{pendingCount}</span>
                        )}
                    </h1>
                    <p className="mt-0.5 text-sm text-zinc-500 truncate max-w-xs">{blogTitle}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800 w-fit">
                {TABS.map(tab => (
                    <button key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === tab.key
                            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}>
                        {tab.label}
                        {tab.key === 'pending' && pendingCount > 0 && (
                            <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
                    No {activeTab === 'all' ? '' : activeTab} comments yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(comment => (
                        <div key={comment.id}
                            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                            {comment.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{comment.name}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[comment.status]}`}>
                                            {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                                        </span>
                                        <span className="ml-auto text-xs text-zinc-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="ml-10 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{comment.body}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {comment.status !== 'approved' && (
                                        <button onClick={() => moderate(comment.id, 'approved')}
                                            title="Approve"
                                            className="rounded-md p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10">
                                            <HiOutlineCheck className="h-4 w-4" />
                                        </button>
                                    )}
                                    {comment.status !== 'rejected' && (
                                        <button onClick={() => moderate(comment.id, 'rejected')}
                                            title="Reject"
                                            className="rounded-md p-1.5 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10">
                                            <HiOutlineXMark className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button onClick={() => remove(comment.id)}
                                        title="Delete"
                                        className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                                        <HiOutlineTrash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
