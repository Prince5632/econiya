'use client';

import { useState, useRef } from 'react';

interface ProductImageGalleryProps {
    images: string[] | null;
    productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
    const validImages = images && Array.isArray(images) && images.length > 0 ? images : [];
    const [activeIndex, setActiveIndex] = useState(0);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
    };

    if (validImages.length === 0) {
        return (
            <div className="product-image-gallery">
                <div className="product-image-main product-image-placeholder">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>No image available</span>
                </div>
            </div>
        );
    }

    return (
        <div className="product-image-gallery-container">
            <div className="product-image-main-wrapper">
                {validImages.length > 1 && (
                    <button className="gallery-nav prev" onClick={handlePrev} aria-label="Previous image">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                )}

                <div className="product-image-main">
                    <img
                        src={validImages[activeIndex]}
                        alt={`${productName} - Image ${activeIndex + 1}`}
                    />
                </div>

                {validImages.length > 1 && (
                    <button className="gallery-nav next" onClick={handleNext} aria-label="Next image">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                )}

                {validImages.length > 1 && (
                    <div className="gallery-dots">
                        {validImages.map((_, idx) => (
                            <button
                                key={idx}
                                className={`gallery-dot ${idx === activeIndex ? 'active' : ''}`}
                                onClick={() => setActiveIndex(idx)}
                                aria-label={`Go to image ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
