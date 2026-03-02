import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import NavbarServer from '@/app/components/NavbarServer';
import Footer from '@/app/components/Footer';
import CommentSection from './CommentSection';
import { HiOutlineClock, HiOutlineCalendar, HiOutlineTag } from 'react-icons/hi2';

export const revalidate = 60;

interface Props { params: Promise<{ slug: string }> }

async function getBlog(slug: string) {
    return db.blog.findUnique({
        where: { slug },
        include: {
            comments: {
                where: { status: 'approved' },
                select: { id: true, name: true, body: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
            },
        },
    });
}

async function getRelated(blog: { id: string; tags: string[]; category: string | null }) {
    return db.blog.findMany({
        where: {
            isPublished: true,
            id: { not: blog.id },
            OR: [
                ...(blog.category ? [{ category: blog.category }] : []),
                ...(blog.tags.length > 0 ? [{ tags: { hasSome: blog.tags } }] : []),
            ],
        },
        select: { id: true, title: true, slug: true, thumbnail: true, featuredImage: true, category: true, readTime: true, publishedAt: true, createdAt: true },
        orderBy: { publishedAt: 'desc' },
        take: 3,
    });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const blog = await getBlog(slug);
    if (!blog) return {};
    return {
        title: blog.metaTitle || blog.title,
        description: blog.metaDescription || blog.excerpt || undefined,
        keywords: blog.metaKeywords || blog.tags.join(', ') || undefined,
        openGraph: {
            title: blog.metaTitle || blog.title,
            description: blog.metaDescription || blog.excerpt || undefined,
            images: blog.ogImage ? [blog.ogImage] : blog.featuredImage ? [blog.featuredImage] : undefined,
            type: 'article',
            publishedTime: blog.publishedAt?.toISOString(),
        },
    };
}

export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params;
    const blog = await getBlog(slug);

    if (!blog || !blog.isPublished) notFound();

    const related = await getRelated(blog);
    const pubDate = blog.publishedAt ?? blog.createdAt;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: blog.title,
        description: blog.excerpt,
        image: blog.featuredImage || blog.ogImage,
        datePublished: pubDate,
        dateModified: blog.updatedAt,
        author: { '@type': 'Person', name: blog.authorName || 'Econiya Team' },
        publisher: { '@type': 'Organization', name: 'Econiya Technologies' },
    };

    return (
        <>
            <NavbarServer />
            <main className="min-h-screen bg-white pt-20 dark:bg-zinc-950 md:pt-24">
                {/* Cover image */}
                {blog.featuredImage && (
                    <div className="mx-auto w-full max-w-5xl overflow-hidden px-4 sm:px-6">
                        <img src={blog.featuredImage} alt={blog.title} className="mt-8 h-[300px] w-full rounded-2xl object-cover sm:h-[400px] lg:h-[500px]" />
                    </div>
                )}

                <article className="mx-auto max-w-[720px] px-4 py-12 sm:px-6 lg:py-16">
                    {/* Category */}
                    {blog.category && (
                        <Link href={`/blog?category=${encodeURIComponent(blog.category)}`}
                            className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                            {blog.category}
                        </Link>
                    )}

                    <h1 className="mb-8 font-serif text-4xl font-bold leading-[1.15] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-[54px]">
                        {blog.title}
                    </h1>

                    {/* Author row */}
                    <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-y border-zinc-100 py-6 dark:border-zinc-800/60">
                        {/* Avatar */}
                        <div className="flex items-center gap-3.5">
                            {blog.authorAvatar ? (
                                <img src={blog.authorAvatar} alt={blog.authorName || ''} className="h-11 w-11 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700" />
                            ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                    {(blog.authorName || 'A').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{blog.authorName || 'Econiya Editorial'}</p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                                    <span>{new Date(pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    <span>·</span>
                                    <span>{blog.readTime ?? 1} min read</span>
                                </div>
                            </div>
                        </div>

                        {/* Social share */}
                        <div className="flex items-center gap-2">
                            <ShareButton href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(`https://econiya.com/blog/${blog.slug}`)}`} label="Share on X" icon="𝕏" />
                            <ShareButton href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://econiya.com/blog/${blog.slug}`)}`} label="Share on LinkedIn" icon="in" />
                        </div>
                    </div>

                    {/* Prose content */}
                    <div
                        className="blog-prose prose prose-lg prose-zinc max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-img:rounded-2xl"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Tags */}
                    {blog.tags.length > 0 && (
                        <div className="mt-10 flex flex-wrap items-center gap-2">
                            <HiOutlineTag className="h-4 w-4 text-zinc-400" />
                            {blog.tags.map(t => (
                                <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`}
                                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors dark:bg-zinc-800 dark:text-zinc-300">
                                    #{t}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Comment section */}
                    <CommentSection
                        blogId={blog.id}
                        initialComments={blog.comments.map(c => ({
                            ...c,
                            createdAt: c.createdAt.toISOString(),
                        }))}
                    />
                </article>

                {/* Related posts */}
                {related.length > 0 && (
                    <section className="border-t border-zinc-100 bg-gray-50/60 py-12 dark:border-zinc-800 dark:bg-zinc-900/40">
                        <div className="mx-auto max-w-5xl px-4 sm:px-6">
                            <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">Related Articles</h2>
                            <div className="grid gap-5 sm:grid-cols-3">
                                {related.map(r => {
                                    const img = r.thumbnail || r.featuredImage;
                                    return (
                                        <Link key={r.id} href={`/blog/${r.slug}`}
                                            className="group rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:border-zinc-800 dark:bg-zinc-950">
                                            {img ? <img src={img} alt={r.title} className="h-36 w-full object-cover group-hover:opacity-90 transition-opacity" /> : <div className="h-36 bg-gradient-to-br from-indigo-500/10 to-violet-500/10" />}
                                            <div className="p-4">
                                                {r.category && <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">{r.category}</span>}
                                                <p className="mt-1 text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-white line-clamp-2 transition-colors">{r.title}</p>
                                                <span className="mt-2 flex items-center gap-1 text-xs text-zinc-400"><HiOutlineClock className="h-3.5 w-3.5" />{r.readTime ?? 1} min</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <Footer />

            {/* JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </>
    );
}

function ShareButton({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" title={label}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-xs font-bold text-zinc-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors dark:border-zinc-700 dark:text-zinc-400">
            {icon}
        </a>
    );
}
