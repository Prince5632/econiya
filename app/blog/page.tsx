import { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import NavbarServer from '@/app/components/NavbarServer';
import Footer from '@/app/components/Footer';
import { HiOutlineMagnifyingGlass, HiOutlineClock, HiOutlineArrowRight } from 'react-icons/hi2';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Blog — Insights & Expert Articles | Econiya Technologies',
    description:
        'Explore the latest insights, industry news, technology deep-dives, and expert articles from the Econiya Technologies team. Stay ahead with IoT, digital transformation, and industrial automation trends.',
    keywords: 'Econiya blog, IoT insights, industry news, digital transformation, industrial automation, technology articles',
    openGraph: {
        title: 'Blog — Insights & Expert Articles | Econiya Technologies',
        description: 'Explore the latest insights, industry news, technology deep-dives, and expert articles from the Econiya Technologies team.',
        type: 'website',
        url: 'https://econiya.com/blog',
    },
    alternates: {
        canonical: 'https://econiya.com/blog',
    },
};

interface SearchParams {
    searchParams: Promise<{ search?: string; tag?: string; category?: string; page?: string }>;
}

/* ══════════════════════════════════════════════════════════════════════════
   Blog Listing Page — SEO-optimized, premium design
   ══════════════════════════════════════════════════════════════════════════ */
export default async function BlogListPage({ searchParams }: SearchParams) {
    const { search, tag, category, page } = await searchParams;
    const currentPage = Number(page ?? 1);
    const perPage = 9;

    // ── Build where clause ──────────────────────────────────────────────
    const where: Record<string, unknown> = { isPublished: true };
    if (tag) (where as Record<string, unknown>).tags = { has: tag };
    if (category) (where as Record<string, unknown>).category = { equals: category, mode: 'insensitive' };
    if (search) {
        (where as Record<string, unknown>).OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [blogs, total, allBlogs, featuredBlog] = await Promise.all([
        db.blog.findMany({
            where,
            select: {
                id: true, title: true, slug: true, excerpt: true,
                thumbnail: true, featuredImage: true, tags: true,
                category: true, authorName: true, authorAvatar: true,
                readTime: true, publishedAt: true, createdAt: true,
            },
            orderBy: { publishedAt: 'desc' },
            skip: (currentPage - 1) * perPage,
            take: perPage,
        }),
        db.blog.count({ where }),
        // For sidebar tags/categories
        db.blog.findMany({
            where: { isPublished: true },
            select: { tags: true, category: true },
        }),
        // Featured / latest post (only on first unfiltered page)
        (!search && !tag && !category && currentPage === 1)
            ? db.blog.findFirst({
                where: { isPublished: true },
                select: {
                    id: true, title: true, slug: true, excerpt: true,
                    thumbnail: true, featuredImage: true, tags: true,
                    category: true, authorName: true, authorAvatar: true,
                    readTime: true, publishedAt: true, createdAt: true,
                },
                orderBy: { publishedAt: 'desc' },
            })
            : null,
    ]);

    const totalPages = Math.ceil(total / perPage);

    // Tags & categories counts
    const tagCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    allBlogs.forEach((b) => {
        b.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] ?? 0) + 1; });
        if (b.category) categoryCounts[b.category] = (categoryCounts[b.category] ?? 0) + 1;
    });
    const popularTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([t]) => t);
    const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

    // Exclude the featured post from the grid on page 1
    const gridBlogs = featuredBlog
        ? blogs.filter((b) => b.id !== featuredBlog.id)
        : blogs;

    // JSON-LD structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Econiya Technologies Blog',
        description: 'Insights, industry news, and expert articles from the Econiya Technologies team.',
        url: 'https://econiya.com/blog',
        publisher: {
            '@type': 'Organization',
            name: 'Econiya Technologies',
            url: 'https://econiya.com',
        },
        blogPost: blogs.slice(0, 5).map((b) => ({
            '@type': 'BlogPosting',
            headline: b.title,
            url: `https://econiya.com/blog/${b.slug}`,
            datePublished: (b.publishedAt ?? b.createdAt)?.toString(),
            author: { '@type': 'Person', name: b.authorName || 'Econiya Team' },
        })),
    };

    return (
        <>
            <NavbarServer />
            <main className="min-h-screen bg-white pt-[72px] dark:bg-zinc-950">
                {/* ── Hero Section ── */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1729] via-[#1a2744] to-[#0c1220] py-20 sm:py-28">
                    {/* Decorative grid */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Cpath d=\'M0 0h1v40H0zM39 0h1v40h-1z\'/%3E%3Cpath d=\'M0 0h40v1H0zM0 39h40v1H0z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
                    {/* Decorative gradient orbs */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-500/8 rounded-full blur-[100px]" />

                    <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
                        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300 backdrop-blur-sm ring-1 ring-white/10">
                            Econiya Blog
                        </span>
                        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Insights, Ideas &{' '}
                            <span className="bg-gradient-to-r from-red-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                                Innovation
                            </span>
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-indigo-200/70 sm:text-lg">
                            Deep-dives into IoT, digital transformation, and industrial automation —
                            from the engineers and leaders at Econiya Technologies.
                        </p>

                        {/* Search bar */}
                        <form method="GET" action="/blog" className="mx-auto mt-9 flex max-w-lg items-center gap-2 rounded-2xl bg-white/[0.08] px-5 py-3 ring-1 ring-white/[0.12] backdrop-blur-xl transition-all focus-within:bg-white/[0.12] focus-within:ring-white/20">
                            <HiOutlineMagnifyingGlass className="h-5 w-5 shrink-0 text-indigo-300" />
                            <input
                                name="search"
                                defaultValue={search ?? ''}
                                placeholder="Search articles, topics, tags…"
                                className="flex-1 bg-transparent text-sm text-white placeholder-indigo-300/50 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/30 hover:brightness-110"
                            >
                                Search
                            </button>
                        </form>

                        {/* Quick category pills */}
                        {categories.length > 0 && (
                            <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2">
                                <Link
                                    href="/blog"
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${!category ? 'bg-white/20 text-white ring-1 ring-white/30' : 'text-indigo-300/70 hover:bg-white/10 hover:text-white'}`}
                                >
                                    All
                                </Link>
                                {categories.map(([cat, count]) => (
                                    <Link
                                        key={cat}
                                        href={`/blog?category=${encodeURIComponent(cat)}`}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${category === cat ? 'bg-white/20 text-white ring-1 ring-white/30' : 'text-indigo-300/70 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {cat} <span className="ml-0.5 opacity-50">({count})</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Active Filters Bar ── */}
                {(tag || category || search) && (
                    <div className="border-b border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
                            <span className="text-xs text-zinc-400">Filtered by:</span>
                            {tag && <FilterChip label={`Tag: #${tag}`} href="/blog" />}
                            {category && <FilterChip label={`Category: ${category}`} href="/blog" />}
                            {search && <FilterChip label={`"${search}"`} href="/blog" />}
                            <Link href="/blog" className="ml-2 text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
                                Clear all →
                            </Link>
                        </div>
                    </div>
                )}

                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    {/* ── Featured Post (page 1 only, no filters) ── */}
                    {featuredBlog && (
                        <section className="mb-14">
                            <FeaturedCard blog={featuredBlog} />
                        </section>
                    )}

                    <div className="flex gap-10">
                        {/* ── Main Grid ── */}
                        <div className="min-w-0 flex-1">
                            {gridBlogs.length === 0 && !featuredBlog ? (
                                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-24 text-center dark:border-zinc-800 dark:bg-zinc-900">
                                    <p className="text-lg font-semibold text-zinc-400">No articles found</p>
                                    <p className="mt-1 text-sm text-zinc-400">Try a different search or <Link href="/blog" className="text-red-500 hover:underline">clear filters</Link></p>
                                </div>
                            ) : (
                                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                                    {gridBlogs.map((blog) => (
                                        <BlogCard key={blog.id} blog={blog} />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Blog pagination">
                                    {currentPage > 1 && (
                                        <PaginationLink href={buildHref({ search, tag, category, page: currentPage - 1 })} label="← Previous" />
                                    )}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                                        <PaginationLink key={pg} href={buildHref({ search, tag, category, page: pg })} label={String(pg)} active={pg === currentPage} />
                                    ))}
                                    {currentPage < totalPages && (
                                        <PaginationLink href={buildHref({ search, tag, category, page: currentPage + 1 })} label="Next →" />
                                    )}
                                </nav>
                            )}
                        </div>

                        {/* ── Sidebar ── */}
                        <aside className="hidden w-64 shrink-0 lg:block">
                            {/* Categories */}
                            {categories.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400">Categories</h3>
                                    <ul className="space-y-0.5">
                                        {categories.map(([cat, count]) => (
                                            <li key={cat}>
                                                <Link
                                                    href={`/blog?category=${encodeURIComponent(cat)}`}
                                                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${category === cat
                                                        ? 'bg-red-50 font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                                                        }`}
                                                >
                                                    {cat}
                                                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{count}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Popular Tags */}
                            {popularTags.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400">Popular Tags</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {popularTags.map((t) => (
                                            <Link
                                                key={t}
                                                href={`/blog?tag=${encodeURIComponent(t)}`}
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${tag === t
                                                    ? 'bg-red-600 text-white shadow-sm'
                                                    : 'bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                    }`}
                                            >
                                                #{t}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Newsletter CTA */}
                            <div className="rounded-2xl bg-gradient-to-br from-[#0f1729] to-[#1a2744] p-5 text-center">
                                <p className="text-sm font-bold text-white">Stay Updated</p>
                                <p className="mt-1 text-xs text-indigo-200/60">Get the latest articles delivered to your inbox.</p>
                                <Link
                                    href="/contact"
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:brightness-110"
                                >
                                    Subscribe <HiOutlineArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />

            {/* JSON-LD structured data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════════════════════════════════ */

interface BlogData {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    featuredImage: string | null;
    tags: string[];
    category: string | null;
    authorName: string | null;
    authorAvatar: string | null;
    readTime: number | null;
    publishedAt: Date | string | null;
    createdAt: Date | string;
}

function FeaturedCard({ blog }: { blog: BlogData }) {
    const image = blog.featuredImage || blog.thumbnail;
    const date = blog.publishedAt ?? blog.createdAt;
    return (
        <Link
            href={`/blog/${blog.slug}`}
            className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 lg:grid-cols-5"
        >
            {/* Image */}
            <div className="relative col-span-3 aspect-[16/9] overflow-hidden bg-zinc-100 lg:aspect-auto lg:min-h-[360px]">
                {image ? (
                    <img
                        src={image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
                        <span className="text-6xl opacity-20">📝</span>
                    </div>
                )}
                {blog.category && (
                    <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
                        {blog.category}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="col-span-2 flex flex-col justify-center px-8 py-8 lg:px-10 lg:py-10">
                <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-red-500">
                    Featured Article
                </span>
                <h2 className="mb-3 text-2xl font-bold leading-tight text-zinc-900 transition-colors group-hover:text-red-600 dark:text-white lg:text-3xl">
                    {blog.title}
                </h2>
                {blog.excerpt && (
                    <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {blog.excerpt}
                    </p>
                )}

                <div className="mt-auto flex items-center gap-3">
                    {blog.authorAvatar ? (
                        <img src={blog.authorAvatar} alt={blog.authorName || ''} className="h-9 w-9 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-700" />
                    ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-600 dark:bg-red-500/10">
                            {(blog.authorName || 'E').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{blog.authorName || 'Econiya Team'}</p>
                        <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><HiOutlineClock className="h-3 w-3" />{blog.readTime ?? 1} min</span>
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function BlogCard({ blog }: { blog: BlogData }) {
    const image = blog.thumbnail || blog.featuredImage;
    const date = blog.publishedAt ?? blog.createdAt;

    return (
        <Link
            href={`/blog/${blog.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
            {/* Thumbnail */}
            <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                {image ? (
                    <img
                        src={image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900">
                        <span className="text-4xl opacity-20">📝</span>
                    </div>
                )}
                {blog.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-300">
                        {blog.category}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-5">
                <h2 className="mb-2 line-clamp-2 text-[15px] font-bold leading-snug text-zinc-900 transition-colors group-hover:text-red-600 dark:text-white">
                    {blog.title}
                </h2>
                {blog.excerpt && (
                    <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {blog.excerpt}
                    </p>
                )}

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        {blog.authorAvatar ? (
                            <img src={blog.authorAvatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">
                                {(blog.authorName || 'E').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{blog.authorName || 'Econiya'}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        <span className="mx-0.5">·</span>
                        {blog.readTime ?? 1} min
                    </span>
                </div>

                {/* Tag pills */}
                {blog.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((t) => (
                            <span key={t} className="rounded-full bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                                #{t}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}

function FilterChip({ label, href }: { label: string; href: string }) {
    return (
        <Link href={href} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400">
            {label}
            <span className="ml-0.5 opacity-60">×</span>
        </Link>
    );
}

function PaginationLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${active
                ? 'bg-red-600 text-white shadow-sm shadow-red-200'
                : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-700'
                }`}
        >
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
