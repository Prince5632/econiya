import { db } from '@/lib/db';
import Link from 'next/link';
import {
    HiOutlineDocumentText,
    HiOutlineCube,
    HiOutlinePencilSquare,
    HiOutlinePhoto,
    HiOutlineClipboardDocumentList,
    HiOutlineFolder,
    HiOutlineChatBubbleBottomCenterText,
    HiOutlinePlus,
    HiOutlineArrowTrendingUp,
    HiOutlineArrowRight,
    HiOutlineCalendar,
    HiOutlineClock,
} from 'react-icons/hi2';

async function getStats() {
    const [pages, categories, products, blogs, media, rfqSubmissions, quoteRequests, newQuotes, recentProducts, recentQuotes] = await Promise.all([
        db.page.count(),
        db.category.count(),
        db.product.count(),
        db.blog.count(),
        db.media.count(),
        db.rfqSubmission.count(),
        db.quoteRequest.count(),
        db.quoteRequest.count({ where: { status: 'new' } }),
        db.product.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, slug: true, isPublished: true, createdAt: true, category: { select: { name: true } } } }),
        db.quoteRequest.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, productName: true, category: true, status: true, createdAt: true } }),
    ]);
    return { pages, categories, products, blogs, media, rfqSubmissions, quoteRequests, newQuotes, recentProducts, recentQuotes };
}

const statCards = [
    { label: 'Products', key: 'products' as const, icon: HiOutlineCube, href: '/dashboard/products', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-500/5', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Categories', key: 'categories' as const, icon: HiOutlineFolder, href: '/dashboard/categories', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-500/5', text: 'text-amber-600 dark:text-amber-400' },
    { label: 'Quote Requests', key: 'quoteRequests' as const, icon: HiOutlineChatBubbleBottomCenterText, href: '/dashboard/quote-requests', gradient: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50 dark:bg-blue-500/5', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Pages', key: 'pages' as const, icon: HiOutlineDocumentText, href: '/dashboard/pages', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-500/5', text: 'text-violet-600 dark:text-violet-400' },
    { label: 'Blogs', key: 'blogs' as const, icon: HiOutlinePencilSquare, href: '/dashboard/blogs', gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-50 dark:bg-pink-500/5', text: 'text-pink-600 dark:text-pink-400' },
    { label: 'Media Files', key: 'media' as const, icon: HiOutlinePhoto, href: '/dashboard/media', gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50 dark:bg-indigo-500/5', text: 'text-indigo-600 dark:text-indigo-400' },
];

const quickActions = [
    { label: 'New Product', href: '/dashboard/products/new', icon: HiOutlineCube, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400' },
    { label: 'New Blog', href: '/dashboard/blogs/new', icon: HiOutlinePencilSquare, color: 'text-pink-600 bg-pink-50 hover:bg-pink-100 dark:bg-pink-500/10 dark:hover:bg-pink-500/20 dark:text-pink-400' },
    { label: 'New Page', href: '/dashboard/pages/new', icon: HiOutlineDocumentText, color: 'text-violet-600 bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/10 dark:hover:bg-violet-500/20 dark:text-violet-400' },
    { label: 'New Category', href: '/dashboard/categories/new', icon: HiOutlineFolder, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400' },
];

function timeAgo(date: Date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

export default async function DashboardPage() {
    const stats = await getStats();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 md:p-8 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0xMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
                <div className="relative">
                    <p className="text-indigo-200 text-sm font-medium">{greeting} 👋</p>
                    <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Welcome to your Dashboard</h1>
                    <p className="mt-2 text-indigo-200/80 text-sm max-w-xl">
                        Here&apos;s what&apos;s happening with your website today. Manage your content, track quote requests, and organize your products.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        {stats.newQuotes > 0 && (
                            <Link href="/dashboard/quote-requests" className="inline-flex items-center gap-2 rounded-lg bg-white/15 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white hover:bg-white/25 transition-colors">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                {stats.newQuotes} new quote request{stats.newQuotes !== 1 ? 's' : ''}
                                <HiOutlineArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                {statCards.map((card) => (
                    <Link
                        key={card.key}
                        href={card.href}
                        className={`group relative rounded-2xl border border-zinc-200/80 bg-white p-4 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-200/50 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:shadow-zinc-900/50`}
                    >
                        <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                            <card.icon className={`h-5 w-5 ${card.text}`} />
                        </div>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">
                            {stats[card.key]}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                            {card.label}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Quick Actions</h2>
                <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${action.color}`}
                        >
                            <HiOutlinePlus className="h-3.5 w-3.5" />
                            {action.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Two Column: Recent Products + Recent Quotes */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Products */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <HiOutlineCube className="h-4 w-4 text-emerald-500" />
                            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Recently Added Products</h3>
                        </div>
                        <Link href="/dashboard/products" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors">
                            View all →
                        </Link>
                    </div>
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {stats.recentProducts.length === 0 ? (
                            <div className="px-5 py-8 text-center text-sm text-zinc-400">No products yet</div>
                        ) : stats.recentProducts.map((product) => (
                            <Link key={product.id} href={`/dashboard/products/${product.id}/edit`} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex-shrink-0">
                                        <HiOutlineCube className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{product.name}</p>
                                        <p className="text-[11px] text-zinc-400">{product.category?.name || 'Uncategorized'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                    <span className={`inline-flex h-1.5 w-1.5 rounded-full ${product.isPublished ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                                        <HiOutlineClock className="h-3 w-3" />
                                        {timeAgo(new Date(product.createdAt))}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Quote Requests */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <HiOutlineChatBubbleBottomCenterText className="h-4 w-4 text-blue-500" />
                            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Recent Quote Requests</h3>
                        </div>
                        <Link href="/dashboard/quote-requests" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors">
                            View all →
                        </Link>
                    </div>
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {stats.recentQuotes.length === 0 ? (
                            <div className="px-5 py-8 text-center text-sm text-zinc-400">No quote requests yet</div>
                        ) : stats.recentQuotes.map((quote) => (
                            <Link key={quote.id} href="/dashboard/quote-requests" className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${quote.status === 'new' ? 'bg-blue-50 dark:bg-blue-500/10' : quote.status === 'reviewed' ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10'}`}>
                                        <HiOutlineChatBubbleBottomCenterText className={`h-4 w-4 ${quote.status === 'new' ? 'text-blue-500' : quote.status === 'reviewed' ? 'text-amber-500' : 'text-emerald-500'}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{quote.name}</p>
                                        <p className="text-[11px] text-zinc-400">{quote.productName || quote.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${quote.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : quote.status === 'reviewed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                                        {quote.status}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
