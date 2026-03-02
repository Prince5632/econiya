import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import NavbarServer from '@/app/components/NavbarServer';
import Footer from '@/app/components/Footer';
import { HiOutlineTag, HiOutlineMagnifyingGlass, HiOutlineClock, HiOutlineUser } from 'react-icons/hi2';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Blog — Econiya Technologies',
    description: 'Insights, industry news, and expert articles from the Econiya Technologies team.',
};

interface SearchParams {
    searchParams: Promise<{ search?: string; tag?: string; category?: string; page?: string }>;
}

export default async function BlogListPage({ searchParams }: SearchParams) {
    const { search, tag, category, page } = await searchParams;
    const currentPage = Number(page ?? 1);

    const params = new URLSearchParams();
    params.set('published', 'true');
    params.set('page', String(currentPage));
    params.set('limit', '9');
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    if (category) params.set('category', category);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    let result: { blogs: BlogCard[]; total: number; totalPages: number } = { blogs: [], total: 0, totalPages: 0 };
    try {
        const res = await fetch(`${baseUrl}/api/blogs?${params}`, { next: { revalidate: 60 } });
        if (res.ok) result = await res.json();
    } catch {
        // fallback: direct DB call
        const [blogs, total] = await Promise.all([
            db.blog.findMany({
                where: {
                    isPublished: true,
                    ...(tag ? { tags: { has: tag } } : {}),
                    ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
                    ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { excerpt: { contains: search, mode: 'insensitive' } }] } : {}),
                },
                select: { id: true, title: true, slug: true, excerpt: true, thumbnail: true, featuredImage: true, tags: true, category: true, authorName: true, readTime: true, publishedAt: true, createdAt: true },
                orderBy: { publishedAt: 'desc' },
                skip: (currentPage - 1) * 9,
                take: 9,
            }),
            db.blog.count({ where: { isPublished: true } }),
        ]);
        result = { blogs: blogs as BlogCard[], total, totalPages: Math.ceil(total / 9) };
    }

    const { blogs, totalPages } = result;

    // Popular tags for the sidebar pills
    const allBlogs = await db.blog.findMany({ where: { isPublished: true }, select: { tags: true, category: true } });
    const tagCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    allBlogs.forEach(b => {
        b.tags.forEach(t => { tagCounts[t] = (tagCounts[t] ?? 0) + 1; });
        if (b.category) categoryCounts[b.category] = (categoryCounts[b.category] ?? 0) + 1;
    });
    const popularTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([t]) => t);
    const categories = Object.keys(categoryCounts);

    return (
        <>
            <NavbarServer />
            <main className="min-h-screen bg-gray-50/50">
                {/* Hero */}
                <section className="bg-gradient-to-br from-[#1a2744] to-[#0f1729] py-20 text-center text-white">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-300">Econiya Blog</p>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Insights & Updates</h1>
                    <p className="mx-auto mt-4 max-w-xl text-base text-indigo-200/80">
                        Industry news, engineering deep-dives, and expert articles from the Econiya team.
                    </p>
                    {/* Search bar */}
                    <form method="GET" action="/blog" className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-xl bg-white/10 px-4 py-2 ring-1 ring-white/20">
                        <HiOutlineMagnifyingGlass className="h-5 w-5 text-indigo-200 shrink-0" />
                        <input name="search" defaultValue={search ?? ''}
                            placeholder="Search articles…"
                            className="flex-1 bg-transparent text-sm text-white placeholder-indigo-200/60 focus:outline-none" />
                        <button type="submit" className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400">
                            Search
                        </button>
                    </form>
                </section>

                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex gap-8">
                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                            {/* Active filters */}
                            {(tag || category || search) && (
                                <div className="mb-6 flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-zinc-500">Filtered by:</span>
                                    {tag && <FilterChip label={`Tag: ${tag}`} href="/blog" />}
                                    {category && <FilterChip label={`Category: ${category}`} href="/blog" />}
                                    {search && <FilterChip label={`"${search}"`} href="/blog" />}
                                </div>
                            )}

                            {blogs.length === 0 ? (
                                <div className="rounded-2xl border border-zinc-200 bg-white py-20 text-center text-zinc-400">
                                    No articles found. <Link href="/blog" className="text-indigo-500 hover:underline">Clear filters →</Link>
                                </div>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-10 flex items-center justify-center gap-2">
                                    {currentPage > 1 && (
                                        <PaginationLink href={buildHref({ search, tag, category, page: currentPage - 1 })} label="← Prev" />
                                    )}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                                        <PaginationLink key={pg} href={buildHref({ search, tag, category, page: pg })}
                                            label={String(pg)} active={pg === currentPage} />
                                    ))}
                                    {currentPage < totalPages && (
                                        <PaginationLink href={buildHref({ search, tag, category, page: currentPage + 1 })} label="Next →" />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="hidden lg:block w-56 shrink-0">
                            {categories.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">Categories</h3>
                                    <ul className="space-y-1">
                                        {categories.map(cat => (
                                            <li key={cat}>
                                                <Link href={`/blog?category=${encodeURIComponent(cat)}`}
                                                    className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${category === cat ? 'bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}>
                                                    {cat}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {popularTags.length > 0 && (
                                <div>
                                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">Popular Tags</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {popularTags.map(t => (
                                            <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`}
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${tag === t ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                                                #{t}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

// ── Types & Sub-components ────────────────────────────────────────────────────

interface BlogCard {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    featuredImage: string | null;
    tags: string[];
    category: string | null;
    authorName: string | null;
    readTime: number | null;
    publishedAt: Date | string | null;
    createdAt: Date | string;
}

function BlogCard({ blog }: { blog: BlogCard }) {
    const image = blog.thumbnail || blog.featuredImage;
    const date = blog.publishedAt ?? blog.createdAt;
    return (
        <Link href={`/blog/${blog.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:shadow-zinc-900">
            {image ? (
                <div className="aspect-video w-full overflow-hidden bg-zinc-100">
                    <img src={image} alt={blog.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
            ) : (
                <div className="aspect-video w-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center">
                    <span className="text-4xl opacity-30">📝</span>
                </div>
            )}
            <div className="flex flex-1 flex-col p-5">
                {blog.category && (
                    <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{blog.category}</span>
                )}
                <h2 className="mb-2 text-base font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 line-clamp-2 transition-colors">{blog.title}</h2>
                {blog.excerpt && <p className="mb-4 flex-1 text-sm text-zinc-500 line-clamp-3">{blog.excerpt}</p>}
                <div className="mt-auto flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><HiOutlineUser className="h-3.5 w-3.5" />{blog.authorName || 'Admin'}</span>
                    <span className="flex items-center gap-1">
                        <HiOutlineClock className="h-3.5 w-3.5" />{blog.readTime ?? 1} min
                    </span>
                    <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {blog.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map(t => (
                            <span key={t} className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">#{t}</span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}

function FilterChip({ label, href }: { label: string; href: string }) {
    return (
        <Link href={href} className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400">
            {label} <span className="ml-1 opacity-60">×</span>
        </Link>
    );
}

function PaginationLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
    return (
        <Link href={href} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'}`}>
            {label}
        </Link>
    );
}

function buildHref({ search, tag, category, page }: { search?: string; tag?: string; category?: string; page?: number }) {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (tag) p.set('tag', tag);
    if (category) p.set('category', category);
    if (page && page > 1) p.set('page', String(page));
    const qs = p.toString();
    return qs ? `/blog?${qs}` : '/blog';
}
