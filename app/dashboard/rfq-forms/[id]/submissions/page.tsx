'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    HiOutlineArrowLeft,
    HiOutlineClipboardDocumentList,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineBuildingOffice,
    HiOutlineCalendar,
    HiOutlineEye,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineArrowPath,
    HiOutlineCheck,
    HiOutlineXMark,
} from 'react-icons/hi2';

interface Submission {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    formData: Record<string, any>;
    createdAt: string;
    form: { name: string };
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

export default function RfqSubmissionsPage() {
    const params = useParams();
    const formId = params.id as string;
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/rfq-submissions?formId=${formId}`).then(r => r.json()).then(d => { setSubmissions(d); setLoading(false); });
    }, [formId]);

    async function updateStatus(id: string, newStatus: string) {
        setUpdatingId(id);
        try {
            const res = await fetch(`/api/rfq-submissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
                if (selectedSubmission?.id === id) setSelectedSubmission(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch { /* ignore */ }
        setUpdatingId(null);
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Loading submissions...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/rfq-forms" className="mb-3 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    <HiOutlineArrowLeft className="h-4 w-4" /> Back to RFQ Forms
                </Link>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                        <HiOutlineClipboardDocumentList className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    RFQ Submissions
                </h1>
                <p className="mt-1 text-sm text-zinc-500 ml-[52px]">
                    {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                    {submissions.length > 0 && submissions[0]?.form?.name && ` for "${submissions[0].form.name}"`}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Submissions list */}
                <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800/50 dark:bg-zinc-900/50">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Submitter</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden sm:table-cell">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-16 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                                    <HiOutlineClipboardDocumentList className="h-6 w-6 text-zinc-400" />
                                                </div>
                                                <p className="text-sm font-medium text-zinc-500">No submissions yet</p>
                                                <p className="text-xs text-zinc-400">Submissions will appear here when users fill out this form</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : submissions.map(sub => (
                                    <tr
                                        key={sub.id}
                                        onClick={() => setSelectedSubmission(sub)}
                                        className={`cursor-pointer transition-colors duration-150 ${selectedSubmission?.id === sub.id
                                            ? 'bg-indigo-50/50 dark:bg-indigo-500/5'
                                            : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50'
                                            }`}
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white flex-shrink-0">
                                                    {sub.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-zinc-800 dark:text-white truncate">{sub.name}</p>
                                                    <p className="text-[11px] text-zinc-400 truncate">{sub.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_CONFIG[sub.status]?.bg || STATUS_CONFIG.new.bg} ${STATUS_CONFIG[sub.status]?.color || STATUS_CONFIG.new.color}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-zinc-400 hidden sm:table-cell">
                                            {timeAgo(sub.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail panel */}
                <div>
                    {selectedSubmission ? (
                        <div className="rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden sticky top-20">
                            {/* Header */}
                            <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-white/20 backdrop-blur-sm">
                                        {selectedSubmission.status.toUpperCase()}
                                    </span>
                                    <button onClick={() => setSelectedSubmission(null)} className="rounded-lg p-1 hover:bg-white/20 transition-colors">
                                        <HiOutlineXMark className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold backdrop-blur-sm">
                                        {selectedSubmission.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{selectedSubmission.name}</h3>
                                        <p className="text-violet-200 text-xs">{selectedSubmission.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 space-y-4">
                                <div className="space-y-2.5">
                                    {selectedSubmission.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <HiOutlinePhone className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                            <span className="text-zinc-700 dark:text-zinc-300">{selectedSubmission.phone}</span>
                                        </div>
                                    )}
                                    {selectedSubmission.company && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <HiOutlineBuildingOffice className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                            <span className="text-zinc-700 dark:text-zinc-300">{selectedSubmission.company}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm">
                                        <HiOutlineCalendar className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                        <span className="text-zinc-500">{new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>

                                <hr className="border-zinc-100 dark:border-zinc-800" />

                                {/* Form Data */}
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Form Responses</p>
                                    <div className="space-y-3">
                                        {Object.entries(selectedSubmission.formData).map(([key, value]) => (
                                            <div key={key} className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-3">
                                                <p className="text-[11px] font-medium text-zinc-400 capitalize mb-0.5">{key.replace(/_/g, ' ')}</p>
                                                <p className="text-sm text-zinc-800 dark:text-zinc-200">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

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
                                                    onClick={() => updateStatus(selectedSubmission.id, status)}
                                                    disabled={updatingId === selectedSubmission.id || selectedSubmission.status === status}
                                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${selectedSubmission.status === status
                                                        ? `${config.bg} ${config.color} ring-2 ring-current/20`
                                                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                                                        } disabled:opacity-50`}
                                                >
                                                    {selectedSubmission.status === status && <HiOutlineCheck className="h-3.5 w-3.5" />}
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
                            <p className="text-sm font-medium text-zinc-500">No submission selected</p>
                            <p className="text-xs text-zinc-400 mt-1">Click a submission to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
