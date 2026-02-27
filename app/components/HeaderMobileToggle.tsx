'use client';

import { useState } from 'react';
import MobileNav from './MobileNav';

interface NavItem {
    id: string;
    label: string;
    url: string;
    order: number;
    target: string;
    parentId: string | null;
    children?: NavItem[];
}

interface HeaderMobileToggleProps {
    items: NavItem[];
    siteName: string;
}

export default function HeaderMobileToggle({ items, siteName }: HeaderMobileToggleProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                className="eh-hamburger"
                onClick={() => setOpen(true)}
                aria-label="Open navigation menu"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
            </button>

            <MobileNav
                items={items}
                isOpen={open}
                onClose={() => setOpen(false)}
                siteName={siteName}
            />
        </>
    );
}
