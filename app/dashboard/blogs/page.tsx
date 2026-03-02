'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineChatBubbleLeftRight, HiOutlineEye } from 'react-icons/hi2';
import ConfirmDialog from '../components/ConfirmDialog';

interface Blog {
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    status: string;
    category: string | null;
    tags: string[];
    updatedAt: string;
}

interface BlogWithCounts extends Blog {
    pendingComments?: number;
}

function StatusBadge({ status }: { status: string }) {
    const isPublished = status === 'PUBLISHED';
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isPublished
            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
            {isPublished ? 'Published' : 'Draft'}
        </span>
    );
}

export default function BlogsListPage() {
    const [blogs, setBlogs] = useState<BlogWithCounts[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetch('/api/blogs')
            .then(r => r.json())
            .then(d => {
                const blogsData = Array.isArray(d) ? d : d.blogs ?? [];
                setBlogs(blogsData);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete() {
        if (!deleteId) return;
        setDeleting(true);
        await fetch(`/api/blogs/${deleteId}`, { method: 'DELETE' });
        setBlogs(blogs.filter(b => b.id !== deleteId));
        setDeleteId(null);
        setDeleting(false);
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Blogs</h1>
                    <p className="mt-1 text-sm text-zinc-500">Manage blog posts — {blogs.length} total</p>
                </div>
                <Link href="/dashboard/blogs/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                    <HiOutlinePlus className="h-4 w-4" /> New Blog Post
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Title</th>
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Category / Tags</th>
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Updated</th>
                            <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {blogs.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-400">No blog posts yet. <Link href="/dashboard/blogs/new" className="text-indigo-500 hover:underline">Create one →</Link></td></tr>
                        ) : blogs.map(blog => (
                            <tr key={blog.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                <td className="px-4 py-3">
                                    <span className="font-medium text-zinc-900 dark:text-white">{blog.title}</span>
                                    <span className="block text-xs text-zinc-400 mt-0.5">/{blog.slug}</span>
                                </td>
                                <td className="px-4 py-3">
                                    {blog.category && <span className="mb-1 block text-xs font-medium text-zinc-500">{blog.category}</span>}
                                    <div className="flex flex-wrap gap-1">
                                        {blog.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">{tag}</span>
                                        ))}
                                        {blog.tags?.length > 2 && <span className="text-xs text-zinc-400">+{blog.tags.length - 2}</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-3"><StatusBadge status={blog.status || (blog.isPublished ? 'PUBLISHED' : 'DRAFT')} /></td>
                                <td className="px-4 py-3 text-zinc-500">{new Date(blog.updatedAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {blog.isPublished && (
                                            <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer"
                                                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" title="View public page">
                                                <HiOutlineEye className="h-4 w-4" />
                                            </a>
                                        )}
                                        <Link href={`/dashboard/blogs/${blog.id}/comments`}
                                            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" title="Moderate comments">
                                            <HiOutlineChatBubbleLeftRight className="h-4 w-4" />
                                        </Link>
                                        <Link href={`/dashboard/blogs/${blog.id}/edit`}
                                            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            <HiOutlinePencilSquare className="h-4 w-4" />
                                        </Link>
                                        <button onClick={() => setDeleteId(blog.id)}
                                            className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                                            <HiOutlineTrash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmDialog isOpen={!!deleteId} title="Delete Blog Post"
                message="Are you sure? This will permanently delete the blog post and all its comments."
                onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={deleting} />
        </div>
    );
}
