import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { cache } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// Use React cache to avoid duplicate DB calls between generateMetadata and the component
const getPage = cache(async (slug: string) => {
    return await db.page.findUnique({
        where: { slug },
    });
});

interface PageProps {
    params: Promise<{ slug: string }>;
}

// ISR: revalidate every 60 seconds for published pages
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPage(slug);

    if (!page) return {};

    return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || undefined,
        keywords: page.metaKeywords || undefined,
        openGraph: page.ogImage ? { images: [page.ogImage] } : undefined,
    };
}

export default async function PublicPageView({ params }: PageProps) {
    const { slug } = await params;

    // Concurrent execution of auth and DB fetch
    const [session, page] = await Promise.all([
        auth(),
        getPage(slug)
    ]);

    const isLoggedIn = !!session?.user;

    if (!page) {
        notFound();
    }

    // Only allow viewing draft pages if logged in as admin
    const isDraft = page.status === 'DRAFT' || !page.isPublished;
    if (isDraft && !isLoggedIn) {
        notFound();
    }

    // ── Custom Code Page ─────────────────────────────────────────────
    if (page.pageType === 'custom_code') {
        return (
            <>
                <Header />
                <main className="page-content">
                    {isDraft && (
                        <div className="mx-auto max-w-7xl px-4">
                            <div className="mb-4 mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                                ● Draft Mode — This page is not yet public.
                            </div>
                        </div>
                    )}
                    {/* Scoped CSS */}
                    {page.cssContent && (
                        <style dangerouslySetInnerHTML={{ __html: page.cssContent }} />
                    )}
                    {/* Custom HTML */}
                    {page.htmlContent && (
                        <div
                            className="custom-page-content"
                            dangerouslySetInnerHTML={{ __html: page.htmlContent }}
                        />
                    )}
                    {/* Custom JS */}
                    {page.jsContent && (
                        <script
                            dangerouslySetInnerHTML={{ __html: page.jsContent }}
                        />
                    )}
                </main>
                <Footer />
            </>
        );
    }

    // ── Rich Text Page ───────────────────────────────────────────────
    return (
        <>
            <Header />
            <main className="page-content mx-auto max-w-4xl px-4 py-12 md:py-20">
                <article className="prose prose-zinc max-w-none dark:prose-invert">
                    {isDraft && (
                        <div className="mb-8 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                            ● Draft Mode — This page is not yet public.
                        </div>
                    )}
                    <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
                        {page.title}
                    </h1>
                    <div
                        className="mt-8 rich-text-content"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </article>
            </main>
            <Footer />
        </>
    );
}
