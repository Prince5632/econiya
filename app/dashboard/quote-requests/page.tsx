'use client';

import { useEffect, useState } from 'react';
import { HiOutlineChatBubbleBottomCenterText, HiOutlineEye, HiOutlineCheck } from 'react-icons/hi2';

interface QuoteRequest {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    category: string;
    message: string | null;
    status: string;
    createdAt: string;
}

const STATUS_OPTIONS = ['new', 'reviewed', 'completed'];

const STATUS_STYLES: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    reviewed: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
};

export default function QuoteRequestsPage() {
    const [requests, setRequests] = useState<QuoteRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<QuoteRequest | null>(null);
    const [filter, setFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/quote-requests')
            .then(r => r.json())
            .then(d => { setRequests(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    async function updateStatus(id: string, newStatus: string) {
        setUpdatingId(id);
        try {
            const res = await fetch(`/api/quote-requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
                if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch { /* ignore */ }
        setUpdatingId(null);
    }

    const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

    const counts = {
        all: requests.length,
        new: requests.filter(r => r.status === 'new').length,
        reviewed: requests.filter(r => r.status === 'reviewed').length,
        completed: requests.filter(r => r.status === 'completed').length,
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                    <HiOutlineChatBubbleBottomCenterText className="h-7 w-7 text-indigo-500" />
                    Quote Requests
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                    All quote requests submitted from the website
                </p>
            </div>

            {/* Stats Row */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Total', key: 'all', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
                    { label: 'New', key: 'new', color: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
                    { label: 'Reviewed', key: 'reviewed', color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
                    { label: 'Completed', key: 'completed', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
                ].map(s => (
                    <button
                        key={s.key}
                        onClick={() => setFilter(s.key)}
                        className={`rounded-xl border p-4 text-left transition-all ${filter === s.key
                            ? 'border-indigo-200 ring-2 ring-indigo-100 dark:border-indigo-500/30 dark:ring-indigo-500/10'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                            } bg-white dark:bg-zinc-950`}
                    >
                        <p className="text-xs font-medium text-zinc-500">{s.label}</p>
                        <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                            {counts[s.key as keyof typeof counts]}
                        </p>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Submissions list */}
                <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Email</th>
                                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Category</th>
                                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-400">No quote requests yet.</td></tr>
                                ) : filtered.map(req => (
                                    <tr
                                        key={req.id}
                                        onClick={() => setSelected(req)}
                                        className={`cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors ${selected?.id === req.id ? 'bg-indigo-50 dark:bg-indigo-500/5' : ''}`}
                                    >
                                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{req.name}</td>
                                        <td className="px-4 py-3 text-zinc-500">{req.email}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-500/10 dark:text-gray-400">
                                                {req.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[req.status] || STATUS_STYLES.new}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail panel */}
                <div>
                    {selected ? (
                        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                                Request Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-zinc-400">Name</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{selected.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400">Email</p>
                                    <p className="text-sm text-zinc-900 dark:text-white">{selected.email}</p>
                                </div>
                                {selected.phone && (
                                    <div>
                                        <p className="text-xs text-zinc-400">Phone</p>
                                        <p className="text-sm text-zinc-900 dark:text-white">{selected.phone}</p>
                                    </div>
                                )}
                                {selected.company && (
                                    <div>
                                        <p className="text-xs text-zinc-400">Company</p>
                                        <p className="text-sm text-zinc-900 dark:text-white">{selected.company}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-zinc-400">Category</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{selected.category}</p>
                                </div>
                                {selected.message && (
                                    <div>
                                        <p className="text-xs text-zinc-400">Message</p>
                                        <p className="text-sm text-zinc-900 dark:text-white whitespace-pre-wrap">{selected.message}</p>
                                    </div>
                                )}

                                <hr className="border-zinc-200 dark:border-zinc-700" />

                                {/* Status Update */}
                                <div>
                                    <p className="text-xs text-zinc-400 mb-2">Update Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {STATUS_OPTIONS.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => updateStatus(selected.id, status)}
                                                disabled={updatingId === selected.id || selected.status === status}
                                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${selected.status === status
                                                    ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400'
                                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                                                    } disabled:opacity-50`}
                                            >
                                                {selected.status === status && <HiOutlineCheck className="h-3.5 w-3.5" />}
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <p className="text-xs text-zinc-400">Submitted</p>
                                    <p className="text-sm text-zinc-500">
                                        {new Date(selected.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
                            <div className="text-center">
                                <HiOutlineEye className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                                <p className="text-sm text-zinc-400">Click a request to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
