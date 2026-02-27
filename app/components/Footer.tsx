import Link from 'next/link';
import Image from 'next/image';
import { productCategories } from '@/lib/products';
import { getGlobalSettings } from '@/lib/landing-db';

const Footer = async () => {
    const settings = await getGlobalSettings();
    const { footer, contactInfo } = settings || {};

    return (
        <footer className="relative bg-gradient-to-br from-white via-red-50/30 to-white overflow-hidden">

            {/* Dot pattern background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #dc2626 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* Large faded gradient logo watermark */}
            <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] opacity-[0.03] pointer-events-none">
                <div className="w-full h-full bg-gradient-to-br from-red-500 to-yellow-500 rounded-full blur-3xl" />
            </div>

            {/* Gradient top accent line */}
            <div className="h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" />

            {/* Main Footer */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Company Info with Logo */}
                    <div className="space-y-5 lg:col-span-1">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/images/logos/Econiya _2026-02-23T06-54-51.316Z.png"
                                alt="Econiya"
                                width={180}
                                height={55}
                                className="h-12 w-auto"
                            />
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            System Integrators &amp; Automation Partners specializing in Ex/IS certified
                            Wireless Telephony, Radio Communication, and Industrial Automation.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex space-x-3 pt-2">
                            {/* LinkedIn */}
                            <a href={footer?.socialLinks?.find((l: any) => l.platform?.toLowerCase() === 'linkedin')?.url || '#'}
                                target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 text-red-600 flex items-center justify-center hover:from-red-600 hover:to-red-700 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-red-200 hover:-translate-y-1">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                            {/* Twitter / X */}
                            <a href={footer?.socialLinks?.find((l: any) => l.platform?.toLowerCase() === 'twitter')?.url || '#'}
                                target="_blank" rel="noopener noreferrer" aria-label="Twitter"
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 text-red-600 flex items-center justify-center hover:from-red-600 hover:to-red-700 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-red-200 hover:-translate-y-1">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            {/* Instagram */}
                            <a href={footer?.socialLinks?.find((l: any) => l.platform?.toLowerCase() === 'instagram')?.url || '#'}
                                target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 text-red-600 flex items-center justify-center hover:from-red-600 hover:to-red-700 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-red-200 hover:-translate-y-1">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            </a>
                            {/* YouTube */}
                            <a href={footer?.socialLinks?.find((l: any) => l.platform?.toLowerCase() === 'youtube')?.url || '#'}
                                target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 text-red-600 flex items-center justify-center hover:from-red-600 hover:to-red-700 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-red-200 hover:-translate-y-1">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-yellow-500" />
                            Products
                        </h3>
                        <ul className="space-y-3">
                            {productCategories.map((category) => (
                                <li key={category.slug}>
                                    <Link href={`/products/${category.slug}`}
                                        className="text-gray-500 hover:text-red-600 text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-yellow-500" />
                            Company
                        </h3>
                        <ul className="space-y-3">

                            <li>
                                <Link href="/products" className="text-gray-500 hover:text-red-600 text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-gray-500 hover:text-red-600 text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-500 hover:text-red-600 text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-yellow-500" />
                            Contact
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                </div>
                                <span className="text-gray-500 text-sm">{contactInfo?.address || 'Address not set'}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                </div>
                                <a href={`mailto:${contactInfo?.email}`} className="text-gray-500 hover:text-red-600 text-sm transition-colors duration-200">
                                    {contactInfo?.email || 'Email not set'}
                                </a>
                            </li>
                            <li className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                                </div>
                                <span className="text-gray-500 text-sm">{contactInfo?.phone || 'Phone not set'}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-10 border-t border-red-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-gray-400 text-xs">
                        © {new Date().getFullYear()} Econiya Technologies. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-3 sm:mt-0">
                        <a href="#" className="text-gray-400 hover:text-red-600 text-xs transition-colors duration-200">Privacy Policy</a>
                        <a href="#" className="text-gray-400 hover:text-red-600 text-xs transition-colors duration-200">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
