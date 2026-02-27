import { db } from '@/lib/db';
import {
    HiOutlineDocumentText,
    HiOutlineCube,
    HiOutlinePencilSquare,
    HiOutlinePhoto,
    HiOutlineClipboardDocumentList,
    HiOutlineFolder,
} from 'react-icons/hi2';
import Link from 'next/link';

async function getStats() {
    const [pages, categories, products, blogs, media, rfqSubmissions] = await Promise.all([
        db.page.count(),
        db.category.count(),
        db.product.count(),
        db.blog.count(),
        db.media.count(),
        db.rfqSubmission.count(),
    ]);
    return { pages, categories, products, blogs, media, rfqSubmissions };
}

const statCards = [
    { label: 'Pages', key: 'pages' as const, icon: HiOutlineDocumentText, href: '/dashboard/pages', color: 'from-blue-500 to-cyan-500' },
    { label: 'Categories', key: 'categories' as const, icon: HiOutlineFolder, href: '/dashboard/categories', color: 'from-amber-500 to-orange-500' },
    { label: 'Products', key: 'products' as const, icon: HiOutlineCube, href: '/dashboard/products', color: 'from-emerald-500 to-teal-500' },
    { label: 'Blogs', key: 'blogs' as const, icon: HiOutlinePencilSquare, href: '/dashboard/blogs', color: 'from-violet-500 to-purple-500' },
    { label: 'Media Files', key: 'media' as const, icon: HiOutlinePhoto, href: '/dashboard/media', color: 'from-pink-500 to-rose-500' },
    { label: 'RFQ Submissions', key: 'rfqSubmissions' as const, icon: HiOutlineClipboardDocumentList, href: '/dashboard/rfq-forms', color: 'from-indigo-500 to-blue-500' },
];

export default async function DashboardPage() {
    const stats = await getStats();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Overview of your content management system
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((card) => (
                    <Link
                        key={card.key}
                        href={card.href}
                        className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    {card.label}
                                </p>
                                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                                    {stats[card.key]}
                                </p>
                            </div>
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                                <card.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-400">
                            View all →
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
