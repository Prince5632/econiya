'use client';

interface StatusBadgeProps {
    isPublished: boolean;
}

export default function StatusBadge({ isPublished }: StatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isPublished
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                }`}
        >
            <span
                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
            />
            {isPublished ? 'Published' : 'Draft'}
        </span>
    );
}
