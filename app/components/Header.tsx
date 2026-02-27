import Link from 'next/link';
import { getNavMenu, type NavItem } from '@/lib/navigation';

function NavItemDropdown({ item }: { item: NavItem }) {
    if (!item.children || item.children.length === 0) {
        return (
            <Link
                href={item.url}
                target={item.target}
                className="nav-link"
            >
                {item.label}
            </Link>
        );
    }

    return (
        <div className="nav-dropdown">
            <button className="nav-link nav-dropdown-trigger">
                {item.label}
                <svg className="nav-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            <div className="nav-dropdown-menu">
                {item.children.map((child) => (
                    <Link
                        key={child.id}
                        href={child.url}
                        target={child.target}
                        className="nav-dropdown-item"
                    >
                        {child.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default async function Header() {
    const menu = await getNavMenu('header');

    return (
        <header className="site-header">
            <div className="header-container">
                <Link href="/" className="header-logo">
                    <div className="header-logo-icon">E</div>
                    <span className="header-logo-text">Econiya</span>
                </Link>

                <nav className="header-nav">
                    {menu?.items?.map((item) => (
                        <NavItemDropdown key={item.id} item={item} />
                    ))}
                </nav>

                <Link href="/contact" className="header-cta">
                    Get in Touch
                </Link>
            </div>
        </header>
    );
}
