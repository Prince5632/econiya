import Link from 'next/link';
import { getHeaderMenu, type NavItem } from '@/lib/navigation';
import { getSiteSettings } from '@/lib/settings';
import HeaderShell from './HeaderShell';
import HeaderMobileToggle from './HeaderMobileToggle';

/* ── Level-3 Sub-Menu Item ──────────────────────────────────────────────── */

function SubMenuItem({ item }: { item: NavItem }) {
    if (!item.children || item.children.length === 0) {
        return (
            <Link
                href={item.url}
                target={item.target}
                className="eh-dropdown-item"
            >
                {item.label}
            </Link>
        );
    }

    return (
        <div className="eh-submenu">
            <div className="eh-dropdown-item">
                {item.label}
                <svg className="eh-submenu-arrow" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="eh-submenu-panel">
                {item.children.map(gc => (
                    <Link
                        key={gc.id}
                        href={gc.url}
                        target={gc.target}
                        className="eh-dropdown-item"
                    >
                        {gc.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

/* ── Nav Item (Top Level) ───────────────────────────────────────────────── */

function NavItemDesktop({ item }: { item: NavItem }) {
    // Simple link (no children)
    if (!item.children || item.children.length === 0) {
        return (
            <Link
                href={item.url}
                target={item.target}
                className="eh-nav-link"
            >
                {item.label}
            </Link>
        );
    }

    // Dropdown with children
    return (
        <div className="eh-dropdown">
            <button className="eh-nav-link" aria-haspopup="true">
                {item.label}
                <svg className="eh-chevron" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            <div className="eh-dropdown-panel">
                {item.children.map(child => (
                    <SubMenuItem key={child.id} item={child} />
                ))}
            </div>
        </div>
    );
}

/* ── Header (Server Component) ──────────────────────────────────────────── */

export default async function Header() {
    const [items, settings] = await Promise.all([
        getHeaderMenu(),
        getSiteSettings(),
    ]);

    return (
        <HeaderShell>
            <div className="eh-container">
                {/* Logo */}
                <Link href="/" className="eh-logo">
                    {settings.logoUrl ? (
                        <img
                            src={settings.logoUrl}
                            alt={settings.siteName}
                            className="eh-logo-img"
                        />
                    ) : (
                        <div className="eh-logo-icon">
                            {settings.siteName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="eh-logo-text">{settings.siteName}</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="eh-nav" aria-label="Main navigation">
                    {items.map(item => (
                        <NavItemDesktop key={item.id} item={item} />
                    ))}
                </nav>

                {/* Desktop CTA */}
                <Link href="/contact" className="eh-cta eh-cta-desktop">
                    Get in Touch
                </Link>

                {/* Mobile Hamburger + Drawer */}
                <HeaderMobileToggle items={items} siteName={settings.siteName} />
            </div>
        </HeaderShell>
    );
}
