'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const RfqModal = dynamic(() => import('./RfqModal'), { ssr: false });

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

// Default RFQ form used when no custom form is attached to the product
const DEFAULT_RFQ_FORM: RfqFormConfig = {
    id: '',
    name: 'Quote Request',
    fields: [
        { name: 'quantity', label: 'Quantity', type: 'text', required: false },
        { name: 'requirements', label: 'Requirements / Message', type: 'textarea', required: false },
    ],
};

export default function ProductHeroClient({ productName, rfqForm, description, content, categoryName }: ProductHeroClientProps) {
    const [showRfq, setShowRfq] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const hasContent = content && content.trim().length > 0;
    const hasDescription = description && description.trim().length > 0;

    // Use custom RFQ form if available, otherwise use the default
    const activeRfqForm = rfqForm || DEFAULT_RFQ_FORM;

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

            <RfqModal
                rfqForm={activeRfqForm}
                productName={productName}
                categoryName={categoryName}
                isOpen={showRfq}
                onClose={() => setShowRfq(false)}
            />
        </>
    );
}

