'use client';

import { useEffect, useState, useRef } from 'react';
import { HiOutlineTrash, HiOutlineCloudArrowUp, HiOutlineClipboard } from 'react-icons/hi2';
import ConfirmDialog from '../components/ConfirmDialog';

interface MediaItem {
    id: string;
    url: string;
    displayName: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    folder: string;
    altText: string;
    createdAt: string;
}

export default function MediaPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [folder, setFolder] = useState('general');
    const [copied, setCopied] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch('/api/media').then(r => r.json()).then(d => { setMedia(d); setLoading(false); });
    }, []);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files?.length) return;
        setUploading(true);

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);
            formData.append('displayName', file.name);

            const res = await fetch('/api/media', { method: 'POST', body: formData });
            if (res.ok) {
                const newMedia = await res.json();
                setMedia(prev => [newMedia, ...prev]);
            }
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handleDelete() {
        if (!deleteId) return;
        setDeleting(true);
        await fetch(`/api/media/${deleteId}`, { method: 'DELETE' });
        setMedia(media.filter(m => m.id !== deleteId));
        setDeleteId(null);
        setDeleting(false);
    }

    function copyUrl(url: string) {
        navigator.clipboard.writeText(url);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
    }

    function formatSize(bytes: number) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Media Library</h1>
                    <p className="mt-1 text-sm text-zinc-500">Manage images, PDFs, and other files</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={folder} onChange={e => setFolder(e.target.value)} className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
                        <option value="general">General</option>
                        <option value="products">Products</option>
                        <option value="blogs">Blogs</option>
                        <option value="pages">Pages</option>
                    </select>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
                        <HiOutlineCloudArrowUp className="h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload'}
                        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleUpload} className="hidden" />
                    </label>
                </div>
            </div>

            {media.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 py-20 dark:border-zinc-700">
                    <HiOutlineCloudArrowUp className="mb-3 h-12 w-12 text-zinc-300" />
                    <p className="text-zinc-400">No media files yet. Upload your first file.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {media.map(item => (
                        <div key={item.id} className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                {item.mimeType.startsWith('image/') ? (
                                    <img src={item.url} alt={item.altText || item.displayName} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <span className="text-3xl font-bold text-zinc-300 uppercase">{item.mimeType.split('/')[1]?.slice(0, 4)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-2.5">
                                <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">{item.displayName}</p>
                                <p className="text-xs text-zinc-400">{formatSize(item.size)}</p>
                            </div>
                            {/* Hover actions */}
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <button onClick={() => copyUrl(item.url)} className="rounded-lg bg-white/90 p-2 text-zinc-700 shadow hover:bg-white" title="Copy URL">
                                    <HiOutlineClipboard className="h-4 w-4" />
                                </button>
                                <button onClick={() => setDeleteId(item.id)} className="rounded-lg bg-white/90 p-2 text-red-600 shadow hover:bg-white" title="Delete">
                                    <HiOutlineTrash className="h-4 w-4" />
                                </button>
                            </div>
                            {copied === item.url && (
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white">Copied!</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog isOpen={!!deleteId} title="Delete Media" message="This will permanently delete the file from S3 storage." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={deleting} />
        </div>
    );
}
