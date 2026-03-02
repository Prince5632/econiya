import { Metadata } from 'next';
import { db } from '@/lib/db';
import NavbarServer from '@/app/components/NavbarServer';
import Footer from '@/app/components/Footer';
import Link from 'next/link';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Products | Econiya',
    description: 'Explore our range of intrinsically safe devices, gas detectors, wireless communication systems, and industrial IoT solutions.',
};

interface ProductWithCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    images: any;
    category: { name: string; slug: string };
    highlightSpecs: any;
}

export default async function ProductsListingPage() {
    let categories: any[] = [];
    try {
        categories = await db.category.findMany({
            where: { isPublished: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                products: {
                    where: { isPublished: true },
                    orderBy: { sortOrder: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        images: true,
                        highlightSpecs: true,
                    },
                },
            },
        });
    } catch {
        // Graceful fallback
    }

    return (
        <>
            <NavbarServer />
            <main className="product-detail-page">
                {/* Header */}
                <section style={{ background: '#1a2744', padding: '60px 0 50px' }}>
                    <div className="product-container">
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                            Our Products
                        </h1>
                        <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.7)', marginTop: '12px', maxWidth: '600px', lineHeight: 1.6 }}>
                            Explore our comprehensive range of intrinsically safe devices and industrial solutions designed for hazardous environments.
                        </p>
                    </div>
                </section>

                {/* Categories & Products */}
                <section style={{ padding: '60px 0 80px' }}>
                    <div className="product-container">
                        {categories.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
                                <p style={{ fontSize: '1.125rem' }}>No products available at this time.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                                {categories.map((category) => (
                                    <div key={category.id}>
                                        <div style={{ marginBottom: '24px' }}>
                                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a2744', margin: 0, letterSpacing: '-0.01em' }}>
                                                {category.name}
                                            </h2>
                                            {category.description && (
                                                <p style={{ fontSize: '0.9375rem', color: '#6b7280', marginTop: '6px', lineHeight: 1.6 }}>
                                                    {category.description}
                                                </p>
                                            )}
                                        </div>
                                        {category.products.length === 0 ? (
                                            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No products in this category yet.</p>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                                {category.products.map((product: ProductWithCategory) => {
                                                    const images = Array.isArray(product.images) ? product.images : [];
                                                    const firstImage = images.length > 0 ? images[0] : null;
                                                    return (
                                                        <Link
                                                            key={product.id}
                                                            href={`/products/${product.slug}`}
                                                            className="product-feature-card"
                                                            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}
                                                        >
                                                            <div style={{
                                                                width: '100%', aspectRatio: '4/3', borderRadius: '10px',
                                                                background: '#f8f9fa', border: '1px solid #e5e7eb',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                                                            }}>
                                                                {firstImage ? (
                                                                    <img src={firstImage as string} alt={product.name} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
                                                                ) : (
                                                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
                                                                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a2744', margin: 0 }}>
                                                                    {product.name}
                                                                </h3>
                                                                {product.description && (
                                                                    <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '4px 0 0', lineHeight: 1.5 }}>
                                                                        {product.description.length > 100
                                                                            ? product.description.slice(0, 100) + '...'
                                                                            : product.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span style={{
                                                                fontSize: '0.8125rem', fontWeight: 700, color: '#c62828',
                                                                display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto',
                                                            }}>
                                                                View Details →
                                                            </span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
