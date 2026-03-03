'use client';

import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Delete',
    onConfirm,
    onCancel,
    isLoading,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onCancel}>
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
                        <HiOutlineExclamationTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">{title}</h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-700 hover:shadow-xl disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Deleting...
                            </span>
                        ) : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
