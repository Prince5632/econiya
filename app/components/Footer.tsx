import Link from 'next/link';
import { getNavMenu } from '@/lib/navigation';

export default async function Footer() {
    const menu = await getNavMenu('footer');

    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <Link href="/" className="footer-logo">
                        <div className="footer-logo-icon">E</div>
                        <span className="footer-logo-text">Econiya</span>
                    </Link>
                    <p className="footer-tagline">
                        Digital Platforms Pvt. Ltd. — A Subsidiary of CWG Limited
                    </p>
                </div>

                <nav className="footer-nav">
                    {menu?.items?.map((item) => (
                        <div key={item.id} className="footer-nav-group">
                            {item.children && item.children.length > 0 ? (
                                <>
                                    <h3 className="footer-nav-heading">{item.label}</h3>
                                    <ul className="footer-nav-list">
                                        {item.children.map((child) => (
                                            <li key={child.id}>
                                                <Link
                                                    href={child.url}
                                                    target={child.target}
                                                    className="footer-nav-link"
                                                >
                                                    {child.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <Link
                                    href={item.url}
                                    target={item.target}
                                    className="footer-nav-link"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {new Date().getFullYear()} Econiya Digital Platforms Pvt. Ltd. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
