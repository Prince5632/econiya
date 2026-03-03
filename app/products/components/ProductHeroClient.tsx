'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const RfqModal = dynamic(() => import('./RfqModal'), { ssr: false });
const GetQuoteModal = dynamic(() => import('@/app/components/GetQuoteModal'), { ssr: false });

interface RfqFormConfig {
    id: string;
    name: string;
    description?: string;
    fields: any[];
}

interface ProductHeroClientProps {
    productName: string;
    rfqForm: RfqFormConfig | null;
    description: string | null;
    content?: string | null;
    categoryName?: string;
}

export default function ProductHeroClient({ productName, rfqForm, description, content, categoryName }: ProductHeroClientProps) {
    const [showRfq, setShowRfq] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    const hasContent = content && content.trim().length > 0;
    const hasDescription = description && description.trim().length > 0;

    // Fetch categories for the fallback GetQuoteModal (only when no rfqForm)
    useEffect(() => {
        if (!rfqForm) {
            fetch('/api/categories')
                .then(r => r.json())
                .then((data) => {
                    if (Array.isArray(data)) setCategories(data);
                })
                .catch(() => { });
        }
    }, [rfqForm]);

    return (
        <>
            {/* Description — shows 4 lines clamped, expandable */}
            {hasDescription && (
                <div className="product-hero-description">
                    <p className={`product-hero-desc-text ${expanded ? 'expanded' : ''}`}>
                        {description}
                    </p>
                </div>
            )}

            {/* Long Content / Rich HTML — smoothly revealed */}
            {hasContent && (
                <div
                    className={`product-long-description ${expanded ? 'expanded' : ''}`}
                    ref={contentRef}
                >
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            )}

            {/* Read More / Show Less toggle */}
            {(hasDescription || hasContent) && (
                <button
                    className="product-readmore"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? 'Show Less' : 'Read More'} {expanded ? '↑' : '↓'}
                </button>
            )}

            {/* Request Quote Button — always visible */}
            <button
                onClick={() => setShowRfq(true)}
                className="product-rfq-button"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Request Quote
            </button>

            {/* Product-specific RFQ Modal (when rfqForm is set) */}
            {rfqForm ? (
                <RfqModal
                    rfqForm={rfqForm}
                    productName={productName}
                    isOpen={showRfq}
                    onClose={() => setShowRfq(false)}
                />
            ) : (
                /* General Quote Modal fallback (when no rfqForm) */
                <GetQuoteModal
                    isOpen={showRfq}
                    onClose={() => setShowRfq(false)}
                    categories={categories}
                    defaultCategory={categoryName}
                    productName={productName}
                />
            )}
        </>
    );
}
