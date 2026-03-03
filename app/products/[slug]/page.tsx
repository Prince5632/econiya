import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { cache } from 'react';
import NavbarServer from '@/app/components/NavbarServer';
import Footer from '@/app/components/Footer';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductHeroClient from '../components/ProductHeroClient';
import SpecsTabs from '../components/SpecsTabs';

// ── Data fetching with React cache ─────────────────────────────────────────────
const getProduct = cache(async (slug: string) => {
    return await db.product.findUnique({
        where: { slug },
        include: {
            category: true,
            rfqForm: true,
        },
    });
});

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 60;

// ── SEO Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) return {};

    return {
        title: product.metaTitle || `${product.name} | Econiya`,
        description: product.metaDescription || product.description || undefined,
        keywords: product.metaKeywords || undefined,
        openGraph: {
            title: product.metaTitle || product.name,
            description: product.metaDescription || product.description || undefined,
            images: product.ogImage ? [product.ogImage] : undefined,
        },
    };
}

// ── Type helpers ───────────────────────────────────────────────────────────────
interface KeyFeature {
    title: string;
    description: string;
    icon?: string;
}

interface HighlightSpec {
    label: string;
    value: string;
    icon?: string;
}

// Icon mapping for feature cards
const featureIcons: Record<string, any> = {
    shield: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    display: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    ),
    camera: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
        </svg>
    ),
    battery: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="6" width="18" height="12" rx="2" ry="2" /><line x1="23" y1="13" x2="23" y2="11" />
        </svg>
    ),
    wifi: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
    ),
    sim: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
    ),
    audio: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
    ),
    zap: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    settings: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    star: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
};

function getFeatureIcon(iconName?: string): any {
    if (iconName && featureIcons[iconName]) {
        return featureIcons[iconName];
    }
    return featureIcons.star;
}

// ── Highlight spec icons ───────────────────────────────────────────────────────
const highlightIcons: Record<string, any> = {
    camera: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    display: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    ),
    battery: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="13" x2="23" y2="11" />
        </svg>
    ),
    weight: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
    ),
};

function getHighlightIcon(iconName?: string): any | null {
    if (iconName && highlightIcons[iconName]) {
        return highlightIcons[iconName];
    }
    return null;
}

// ── Main Page Component ────────────────────────────────────────────────────────
export default async function ProductDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product || !product.isPublished) {
        notFound();
    }

    // Parse JSON fields safely
    const images: string[] = Array.isArray(product.images) ? (product.images as unknown as string[]) : [];
    const keyFeatures: KeyFeature[] = Array.isArray(product.keyFeatures) ? (product.keyFeatures as unknown as KeyFeature[]) : [];
    const highlightSpecs: HighlightSpec[] = Array.isArray(product.highlightSpecs) ? (product.highlightSpecs as unknown as HighlightSpec[]) : [];
    const specs: Record<string, Record<string, string>> | null =
        product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs)
            ? (product.specs as unknown as Record<string, Record<string, string>>)
            : null;
    const hasContent = product.content && product.content.trim().length > 0;
    const categoryName = product.category?.name || '';

    return (
        <>
            <NavbarServer />
            <main className="product-detail-page">
                {/* ── Breadcrumb ─────────────────────────────────────────────── */}
                <nav className="product-breadcrumb" aria-label="Breadcrumb">
                    <div className="product-container">
                        <ol>
                            {categoryName && <li><a href={`/products?category=${categoryName}`}>{categoryName}</a></li>}
                            <li className="current">{product.name}</li>
                        </ol>
                    </div>
                </nav>

                {/* ── Hero Section ───────────────────────────────────────────── */}
                <section className="product-hero">
                    <div className="product-container">
                        <div className="product-hero-grid">
                            {/* Image */}
                            <div className="product-hero-image">
                                <ProductImageGallery images={images} productName={product.name} />
                            </div>

                            {/* Info */}
                            <div className="product-hero-info">
                                {/* Category Badge */}
                                {categoryName && (
                                    <span className="product-category-badge">{categoryName}</span>
                                )}

                                {/* Product Name */}
                                <h1 className="product-title">{product.name}</h1>

                                {/* Sub Category Line */}
                                {categoryName && (
                                    <div className="product-subcategory-line">
                                        <span className="subcategory-divider">|</span>
                                        <span className="subcategory-text">{categoryName}</span>
                                    </div>
                                )}

                                {/* Highlight Specs Chips */}
                                {highlightSpecs.length > 0 && (
                                    <div className="product-highlight-specs">
                                        {highlightSpecs.map((spec, idx) => (
                                            <div key={idx} className="product-highlight-chip">
                                                {getHighlightIcon(spec.icon) && (
                                                    <span className="highlight-icon">{getHighlightIcon(spec.icon)}</span>
                                                )}
                                                <div>
                                                    <span className="highlight-label">{spec.label}</span>
                                                    <span className="highlight-value">{spec.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Client interactive elements: description + RFQ */}
                                <ProductHeroClient
                                    productName={product.name}
                                    rfqForm={product.rfqForm as any}
                                    description={product.description}
                                    content={product.content}
                                    categoryName={categoryName}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Key Features ───────────────────────────────────────────── */}
                {keyFeatures.length > 0 && (
                    <section className="product-features-section product-section-animate">
                        <div className="product-container">
                            <h2 className="product-section-title">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                Key Features
                            </h2>
                            <div className="product-features-grid">
                                {keyFeatures.map((feature, idx) => (
                                    <div key={idx} className="product-feature-card">
                                        <div className="feature-icon-wrapper">
                                            {getFeatureIcon(feature.icon)}
                                        </div>
                                        <h3 className="feature-title">{feature.title}</h3>
                                        <p className="feature-description">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Specifications Tabs ────────────────────────────────────── */}
                {specs && (
                    <section className="product-section-animate">
                        <div className="product-container">
                            <SpecsTabs specs={specs} />
                        </div>
                    </section>
                )}

            </main>
            <Footer />
        </>
    );
}
