'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productCategories } from '@/lib/products';

const industries = [
    {
        title: 'IoT & IIoT Services',
        description: 'ATEX-certified devices for hazardous environments',
        href: '/#industries',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
        ),
    },
    {
        title: 'Wireless Communication',
        description: 'Mission-critical radio and DECT systems',
        href: '/#industries',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.5 9.5 0 0113.436 0M3.515 8.485a13.5 13.5 0 0116.97 0" />
            </svg>
        ),
    },
    {
        title: 'Gas Detection',
        description: 'Portable monitoring for hazardous zones',
        href: '/#industries',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
        ),
    },
    {
        title: 'Water & Gas Pipeline',
        description: 'Smart monitoring and resource management',
        href: '/#industries',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.645-5.355l-.707.707M6.352 6.352l-.707.707M12 3.75V3m0 18v-.75" />
            </svg>
        ),
    },
];

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [hoveredCategory, setHoveredCategory] = useState<number>(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDropdownEnter = (name: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveDropdown(name);
        if (name === 'products') setHoveredCategory(0);
    };

    const handleDropdownLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 200);
    };

    const toggleMobileDropdown = (name: string) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const closeMobile = () => {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
    };

    return (
        <nav
            ref={navRef}
            className={`fixed w-full z-50 top-0 left-0 transition-all duration-500 ${isScrolled
                ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-gray-100'
                : 'bg-transparent'
                }`}
        >
            {/* Thin accent bar at top */}
            <div className={`h-[2px] bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-[72px]">

                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center group">
                        <Image
                            src="/images/logos/Econiya _2026-02-23T06-54-51.316Z.png"
                            alt="Econiya Logo"
                            width={160}
                            height={40}
                            className="w-auto h-10 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">

                        {/* Products */}
                        <div
                            className="relative"
                            onMouseEnter={() => handleDropdownEnter('products')}
                            onMouseLeave={handleDropdownLeave}
                        >
                            <button
                                className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-[15px] font-medium rounded-lg transition-all duration-200
                                    ${activeDropdown === 'products'
                                        ? 'text-red-600 bg-red-50/80'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                                    }`}
                            >
                                Products
                                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === 'products' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Products Mega Menu — Two-panel: Categories left, Products right */}
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 ${activeDropdown === 'products' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                                }`}>
                                <div className="w-[720px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex">

                                    {/* Left Panel — Categories */}
                                    <div className="w-[260px] bg-gray-50/80 border-r border-gray-100 py-4 px-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] px-4 mb-3">Categories</p>
                                        {productCategories.map((category, index) => (
                                            <button
                                                key={category.slug}
                                                onMouseEnter={() => setHoveredCategory(index)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${hoveredCategory === index
                                                    ? 'bg-white shadow-sm text-red-600'
                                                    : 'text-gray-600 hover:bg-white/60'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${hoveredCategory === index
                                                    ? 'bg-red-50 text-red-500'
                                                    : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <span className={`text-sm font-semibold block transition-colors ${hoveredCategory === index ? 'text-red-600' : 'text-gray-800'
                                                        }`}>{category.name}</span>
                                                    <span className="text-[11px] text-gray-400">{category.items.length} product{category.items.length > 1 ? 's' : ''}</span>
                                                </div>
                                                <svg className={`w-3.5 h-3.5 ml-auto flex-shrink-0 transition-all duration-200 ${hoveredCategory === index ? 'text-red-400 opacity-100' : 'text-gray-300 opacity-0'
                                                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Right Panel — Products for selected category */}
                                    <div className="flex-1 py-4 px-5">
                                        <div className="flex items-center justify-between mb-4 px-1">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">
                                                    {productCategories[hoveredCategory]?.name}
                                                </h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                                                    {productCategories[hoveredCategory]?.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            {productCategories[hoveredCategory]?.items.map((item) => (
                                                <Link
                                                    key={item.slug}
                                                    href={`/products/${productCategories[hoveredCategory].slug}`}
                                                    className="group/product flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50/80 hover:to-transparent transition-all duration-200"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 group-hover/product:from-red-50 group-hover/product:to-red-100/50 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200">
                                                        <div className="w-2 h-2 rounded-full bg-gray-300 group-hover/product:bg-red-400 transition-colors" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-semibold text-gray-800 group-hover/product:text-red-600 transition-colors">{item.name}</h4>
                                                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
                                                    </div>
                                                    <svg className="w-4 h-4 text-gray-300 group-hover/product:text-red-400 ml-auto self-center opacity-0 group-hover/product:opacity-100 transition-all -translate-x-1 group-hover/product:translate-x-0 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            ))}
                                        </div>

                                        {/* View category link */}
                                        <div className="mt-3 pt-3 border-t border-gray-50 px-1">
                                            <Link
                                                href={`/products/${productCategories[hoveredCategory]?.slug}`}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors group/link"
                                            >
                                                View all {productCategories[hoveredCategory]?.name} products
                                                <svg className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Industry */}
                        <div
                            className="relative"
                            onMouseEnter={() => handleDropdownEnter('industry')}
                            onMouseLeave={handleDropdownLeave}
                        >
                            <button
                                className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-[15px] font-medium rounded-lg transition-all duration-200
                                    ${activeDropdown === 'industry'
                                        ? 'text-red-600 bg-red-50/80'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                                    }`}
                            >
                                Industry
                                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === 'industry' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Industry Dropdown */}
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 ${activeDropdown === 'industry' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                                }`}>
                                <div className="w-[380px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
                                    <div className="px-6 pt-5 pb-3 border-b border-gray-50">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Industries We Serve</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Solutions for every sector</p>
                                    </div>
                                    <div className="p-3">
                                        {industries.map((industry, i) => (
                                            <Link
                                                key={i}
                                                href={industry.href}
                                                className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50/80 hover:to-transparent transition-all duration-200 group/item"
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover/item:from-red-50 group-hover/item:to-red-100/50 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover/item:text-red-500 transition-all duration-200">
                                                    {industry.icon}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-semibold text-gray-900 group-hover/item:text-red-600 transition-colors">{industry.title}</h4>
                                                    <p className="text-xs text-gray-400 mt-0.5">{industry.description}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Blogs */}
                        <Link
                            href="/blogs"
                            className="px-4 py-2.5 text-[15px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-lg transition-all duration-200"
                        >
                            Blogs
                        </Link>

                        {/* Contact Us */}
                        <Link
                            href="/contact"
                            className="px-4 py-2.5 text-[15px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-lg transition-all duration-200"
                        >
                            Contact Us
                        </Link>
                    </div>

                    {/* Right Side CTA */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            href="/contact"
                            className="relative group inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-md shadow-red-200/50 hover:shadow-lg hover:shadow-red-300/50 hover:-translate-y-[1px]"
                        >
                            Get a Quote
                            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <div className="w-5 h-4 relative flex flex-col justify-between">
                            <span className={`block h-[2px] w-full bg-gray-700 rounded-full transition-all duration-300 origin-center ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                            <span className={`block h-[2px] w-full bg-gray-700 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 scale-0' : ''}`} />
                            <span className={`block h-[2px] w-full bg-gray-700 rounded-full transition-all duration-300 origin-center ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className="bg-white/98 backdrop-blur-xl border-t border-gray-100 shadow-xl overflow-y-auto max-h-[calc(85vh-72px)]">
                    <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">

                        {/* Products Mobile */}
                        <div>
                            <button
                                onClick={() => toggleMobileDropdown('products')}
                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-200 ${activeDropdown === 'products' ? 'text-red-600 bg-red-50/80' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Products
                                <svg className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'products' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${activeDropdown === 'products' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                <div className="pl-2 pr-2 py-2 space-y-3">
                                    {productCategories.map((category) => (
                                        <div key={category.slug}>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-1.5 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                {category.name}
                                            </p>
                                            {category.items.map((item) => (
                                                <Link
                                                    key={item.slug}
                                                    href={`/products/${category.slug}`}
                                                    className="block px-4 py-2.5 ml-4 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50/50 transition-all"
                                                    onClick={closeMobile}
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Industry Mobile */}
                        <div>
                            <button
                                onClick={() => toggleMobileDropdown('industry')}
                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-200 ${activeDropdown === 'industry' ? 'text-red-600 bg-red-50/80' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Industry
                                <svg className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'industry' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${activeDropdown === 'industry' ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                <div className="pl-4 pr-2 py-2 space-y-1">
                                    {industries.map((industry, i) => (
                                        <Link
                                            key={i}
                                            href={industry.href}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-red-600 hover:bg-red-50/50 transition-all"
                                            onClick={closeMobile}
                                        >
                                            <span className="w-5 h-5 text-gray-400">{industry.icon}</span>
                                            {industry.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Blogs Mobile */}
                        <Link
                            href="/blogs"
                            className="block px-4 py-3.5 rounded-xl text-[15px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all"
                            onClick={closeMobile}
                        >
                            Blogs
                        </Link>

                        {/* Contact Us Mobile */}
                        <Link
                            href="/contact"
                            className="block px-4 py-3.5 rounded-xl text-[15px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all"
                            onClick={closeMobile}
                        >
                            Contact Us
                        </Link>

                        {/* Mobile CTA */}
                        <div className="pt-3 pb-1 px-2">
                            <Link
                                href="/contact"
                                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-red-200/50 hover:shadow-xl transition-all"
                                onClick={closeMobile}
                            >
                                Get a Quote
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
