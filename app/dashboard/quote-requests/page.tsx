'use client';

import { useEffect, useState } from 'react';
import {
    HiOutlineChatBubbleBottomCenterText,
    HiOutlineEye,
    HiOutlineCheck,
    HiOutlineMagnifyingGlass,
    HiOutlineFunnel,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineBuildingOffice,
    HiOutlineCube,
    HiOutlineCalendar,
    HiOutlineXMark,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineArrowPath,
    HiOutlineFolder,
} from 'react-icons/hi2';

interface QuoteRequest {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    category: string;
    productName: string | null;
    message: string | null;
    status: string;
    createdAt: string;
}

const STATUS_OPTIONS = ['new', 'reviewed', 'completed'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    new: { label: 'New', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: HiOutlineClock },
    reviewed: { label: 'Reviewed', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: HiOutlineArrowPath },
    completed: { label: 'Completed', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: HiOutlineCheckCircle },
};

function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function QuoteRequestsPage() {
    const [requests, setRequests] = useState<QuoteRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<QuoteRequest | null>(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
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

    const filtered = requests
        .filter(r => filter === 'all' || r.status === filter)
        .filter(r => {
            if (!search) return true;
            const s = search.toLowerCase();
            return r.name.toLowerCase().includes(s) ||
                r.email.toLowerCase().includes(s) ||
                (r.productName || '').toLowerCase().includes(s) ||
                r.category.toLowerCase().includes(s);
        });

    const counts = {
        all: requests.length,
        new: requests.filter(r => r.status === 'new').length,
        reviewed: requests.filter(r => r.status === 'reviewed').length,
        completed: requests.filter(r => r.status === 'completed').length,
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Loading quote requests...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                            <HiOutlineChatBubbleBottomCenterText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        Quote Requests
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 ml-[52px]">
                        Manage and respond to incoming quote requests
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Total', key: 'all' as const, icon: HiOutlineChatBubbleBottomCenterText, gradient: 'from-zinc-500 to-zinc-600' },
                    { label: 'New', key: 'new' as const, icon: HiOutlineClock, gradient: 'from-blue-500 to-blue-600' },
                    { label: 'Reviewed', key: 'reviewed' as const, icon: HiOutlineArrowPath, gradient: 'from-amber-500 to-amber-600' },
                    { label: 'Completed', key: 'completed' as const, icon: HiOutlineCheckCircle, gradient: 'from-emerald-500 to-emerald-600' },
                ].map(s => (
                    <button
                        key={s.key}
                        onClick={() => setFilter(s.key)}
                        className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 ${filter === s.key
                            ? 'border-indigo-200 bg-white shadow-lg shadow-indigo-100/50 dark:border-indigo-500/30 dark:bg-zinc-950 dark:shadow-none ring-1 ring-indigo-100 dark:ring-indigo-500/10'
                            : 'border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-sm`}>
                                <s.icon className="h-4 w-4" />
                            </div>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">
                                {counts[s.key]}
                            </p>
                        </div>
                        <p className="mt-2 text-xs font-medium text-zinc-400">{s.label}</p>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search by name, email, product, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-800 placeholder-zinc-400 transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-indigo-500/50 dark:focus:ring-indigo-500/10"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                        <HiOutlineXMark className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Submissions list */}
                <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800/50 dark:bg-zinc-900/50">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Requester</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden md:table-cell">Product</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden sm:table-cell">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-16 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                                    <HiOutlineChatBubbleBottomCenterText className="h-6 w-6 text-zinc-400" />
                                                </div>
                                                <p className="text-sm font-medium text-zinc-500">No quote requests found</p>
                                                <p className="text-xs text-zinc-400">{search ? 'Try a different search term' : 'New requests will appear here'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(req => (
                                    <tr
                                        key={req.id}
                                        onClick={() => setSelected(req)}
                                        className={`cursor-pointer transition-colors duration-150 ${selected?.id === req.id
                                            ? 'bg-indigo-50/50 dark:bg-indigo-500/5'
                                            : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50'
                                            }`}
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white flex-shrink-0">
                                                    {req.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-zinc-800 dark:text-white truncate">{req.name}</p>
                                                    <p className="text-[11px] text-zinc-400 truncate">{req.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 hidden md:table-cell">
                                            {req.productName ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                    <HiOutlineCube className="h-3 w-3" />
                                                    {req.productName}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-lg bg-zinc-50 px-2.5 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                                    {req.category}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_CONFIG[req.status]?.bg} ${STATUS_CONFIG[req.status]?.color}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-zinc-400 hidden sm:table-cell">
                                            {timeAgo(req.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400 ml-1">
                        Showing {filtered.length} of {requests.length} requests
                    </p>
                </div>

                {/* Detail panel */}
                <div>
                    {selected ? (
                        <div className="rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden sticky top-20">
                            {/* Detail Header */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-white/20 backdrop-blur-sm`}>
                                        {selected.status.toUpperCase()}
                                    </span>
                                    <button onClick={() => setSelected(null)} className="rounded-lg p-1 hover:bg-white/20 transition-colors">
                                        <HiOutlineXMark className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold backdrop-blur-sm">
                                        {selected.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{selected.name}</h3>
                                        <p className="text-indigo-200 text-xs">{selected.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Body */}
                            <div className="p-5 space-y-4">
                                {/* Contact Info */}
                                <div className="space-y-2.5">
                                    {selected.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <HiOutlinePhone className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                            <span className="text-zinc-700 dark:text-zinc-300">{selected.phone}</span>
                                        </div>
                                    )}
                                    {selected.company && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <HiOutlineBuildingOffice className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                            <span className="text-zinc-700 dark:text-zinc-300">{selected.company}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm">
                                        <HiOutlineFolder className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                        <span className="text-zinc-700 dark:text-zinc-300">{selected.category}</span>
                                    </div>
                                    {selected.productName && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <HiOutlineCube className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">{selected.productName}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm">
                                        <HiOutlineCalendar className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                        <span className="text-zinc-500">{new Date(selected.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Message */}
                                {selected.message && (
                                    <>
                                        <hr className="border-zinc-100 dark:border-zinc-800" />
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Message</p>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-3">
                                                {selected.message}
                                            </p>
                                        </div>
                                    </>
                                )}

                                <hr className="border-zinc-100 dark:border-zinc-800" />

                                {/* Status Update */}
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Update Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {STATUS_OPTIONS.map(status => {
                                            const config = STATUS_CONFIG[status];
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => updateStatus(selected.id, status)}
                                                    disabled={updatingId === selected.id || selected.status === status}
                                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${selected.status === status
                                                        ? `${config.bg} ${config.color} ring-2 ring-current/20`
                                                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                                                        } disabled:opacity-50`}
                                                >
                                                    {selected.status === status && <HiOutlineCheck className="h-3.5 w-3.5" />}
                                                    {config.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-16 dark:border-zinc-800">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-3">
                                <HiOutlineEye className="h-7 w-7 text-zinc-300 dark:text-zinc-600" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500">No request selected</p>
                            <p className="text-xs text-zinc-400 mt-1">Click a request to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
