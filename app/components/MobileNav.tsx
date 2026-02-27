'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface NavItem {
    id: string;
    label: string;
    url: string;
    order: number;
    target: string;
    parentId: string | null;
    children?: NavItem[];
}

interface MobileNavProps {
    items: NavItem[];
    isOpen: boolean;
    onClose: () => void;
    siteName: string;
}

export default function MobileNav({ items, isOpen, onClose, siteName }: MobileNavProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Close on Escape key
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKey);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const toggle = useCallback((id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    return (
        <>
            {/* Overlay */}
            <div
                className={`econiya-mobile-overlay ${isOpen ? 'is-open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className={`econiya-mobile-drawer ${isOpen ? 'is-open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
            >
                {/* Drawer Header */}
                <div className="emd-header">
                    <Link href="/" className="eh-logo" onClick={onClose}>
                        <div className="eh-logo-icon">E</div>
                        <span className="eh-logo-text" style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800 }}>
                            {siteName}
                        </span>
                    </Link>
                    <button className="emd-close" onClick={onClose} aria-label="Close menu">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="emd-nav">
                    {items.map(item => (
                        <div key={item.id} className="emd-nav-item">
                            {item.children && item.children.length > 0 ? (
                                <>
                                    <button
                                        className="emd-nav-link"
                                        onClick={() => toggle(item.id)}
                                        aria-expanded={!!expanded[item.id]}
                                    >
                                        {item.label}
                                        <svg
                                            className={`emd-expand-icon ${expanded[item.id] ? 'is-expanded' : ''}`}
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    <div className={`emd-children ${expanded[item.id] ? 'is-expanded' : ''}`}>
                                        {item.children.map(child => (
                                            <div key={child.id}>
                                                {child.children && child.children.length > 0 ? (
                                                    <>
                                                        <button
                                                            className="emd-child-link"
                                                            onClick={() => toggle(child.id)}
                                                            aria-expanded={!!expanded[child.id]}
                                                        >
                                                            {child.label}
                                                            <svg
                                                                className={`emd-expand-icon ${expanded[child.id] ? 'is-expanded' : ''}`}
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                                style={{ width: 14, height: 14 }}
                                                            >
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                        <div className={`emd-grandchildren ${expanded[child.id] ? 'is-expanded' : ''}`}>
                                                            {child.children.map(gc => (
                                                                <Link
                                                                    key={gc.id}
                                                                    href={gc.url}
                                                                    target={gc.target}
                                                                    className="emd-grandchild-link"
                                                                    onClick={onClose}
                                                                >
                                                                    {gc.label}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Link
                                                        href={child.url}
                                                        target={child.target}
                                                        className="emd-child-link"
                                                        onClick={onClose}
                                                    >
                                                        {child.label}
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <Link
                                    href={item.url}
                                    target={item.target}
                                    className="emd-nav-link"
                                    onClick={onClose}
                                >
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* CTA */}
                <div className="emd-cta-wrap">
                    <Link href="/contact" className="emd-cta" onClick={onClose}>
                        Get in Touch
                    </Link>
                </div>
            </div>
        </>
    );
}
