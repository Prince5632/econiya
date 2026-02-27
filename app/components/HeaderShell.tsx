'use client';

import { useState, useEffect } from 'react';

export default function HeaderScrollWatcher({ children }: { children: React.ReactNode }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 10);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className={`econiya-header ${scrolled ? 'is-scrolled' : ''}`}>
            {children}
        </header>
    );
}
