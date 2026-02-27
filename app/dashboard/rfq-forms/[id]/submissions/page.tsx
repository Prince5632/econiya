'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineArrowLeft } from 'react-icons/hi2';

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

export default function RfqSubmissionsPage() {
    const params = useParams();
    const formId = params.id as string;
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    useEffect(() => {
        fetch(`/api/rfq-submissions?formId=${formId}`).then(r => r.json()).then(d => { setSubmissions(d); setLoading(false); });
    }, [formId]);

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>;

    return (
        <div>
            <div className="mb-6">
                <Link href="/dashboard/rfq-forms" className="mb-3 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700">
                    <HiOutlineArrowLeft className="h-4 w-4" /> Back to RFQ Forms
                </Link>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">RFQ Submissions</h1>
                <p className="mt-1 text-sm text-zinc-500">{submissions.length} submission(s)</p>
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
                                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {submissions.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-12 text-center text-zinc-400">No submissions yet.</td></tr>
                                ) : submissions.map(sub => (
                                    <tr key={sub.id} onClick={() => setSelectedSubmission(sub)} className={`cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 ${selectedSubmission?.id === sub.id ? 'bg-indigo-50 dark:bg-indigo-500/5' : ''}`}>
                                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{sub.name}</td>
                                        <td className="px-4 py-3 text-zinc-500">{sub.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sub.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : sub.status === 'reviewed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>{sub.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail panel */}
                <div>
                    {selectedSubmission ? (
                        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Submission Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-zinc-400">Name</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedSubmission.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400">Email</p>
                                    <p className="text-sm text-zinc-900 dark:text-white">{selectedSubmission.email}</p>
                                </div>
                                {selectedSubmission.phone && <div><p className="text-xs text-zinc-400">Phone</p><p className="text-sm text-zinc-900 dark:text-white">{selectedSubmission.phone}</p></div>}
                                {selectedSubmission.company && <div><p className="text-xs text-zinc-400">Company</p><p className="text-sm text-zinc-900 dark:text-white">{selectedSubmission.company}</p></div>}
                                <hr className="border-zinc-200 dark:border-zinc-700" />
                                <h4 className="text-xs font-semibold uppercase text-zinc-400">Form Data</h4>
                                {Object.entries(selectedSubmission.formData).map(([key, value]) => (
                                    <div key={key}>
                                        <p className="text-xs text-zinc-400">{key.replace(/_/g, ' ')}</p>
                                        <p className="text-sm text-zinc-900 dark:text-white">{String(value)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
                            <p className="text-sm text-zinc-400">Click a submission to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
