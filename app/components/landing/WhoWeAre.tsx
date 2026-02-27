'use client';

import { useEffect, useRef, useState } from 'react';

const sectors = [
    { name: 'Oil Refineries', icon: '🛢️' },
    { name: 'Pharmaceuticals', icon: '💊' },
    { name: 'Chemical Engineering', icon: '⚗️' },
    { name: 'Public Safety', icon: '🛡️' },
    { name: 'Water Utilities', icon: '💧' },
    { name: 'Indian Railways', icon: '🚂' },
    { name: 'Municipal Corporations', icon: '🏛️' },
];

const capabilities = [
    {
        title: 'ATEX & IECEx Certified',
        desc: 'All products meet international explosion-proof standards',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
    },
    {
        title: 'Pan-India Network',
        desc: 'Deployed across Maharashtra, Madhya Pradesh & beyond',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
        ),
    },
    {
        title: 'End-to-End Solutions',
        desc: 'From design & manufacturing to deployment & support',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.645-5.355l-.707.707M6.352 6.352l-.707.707M12 3.75V3m0 18v-.75" />
            </svg>
        ),
    },
];

const WhoWeAre = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative py-28 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden"
        >
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />
            {/* Floating Gradient Orbs */}
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-red-100/60 to-yellow-100/40 blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-yellow-100/50 to-red-100/30 blur-3xl animate-pulse-slow" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-red-100 rounded-full shadow-sm mb-6">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        <span className="text-red-600 text-sm font-semibold uppercase tracking-wider">
                            Who We Are
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                        Innovation Meets<br />
                        <span className="text-gradient-logo py-2">
                            Safety Standards
                        </span>
                    </h2>
                </div>

                {/* Main Content — Asymmetric Bento Grid */}
                <div className={`grid lg:grid-cols-12 gap-6 mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                    {/* Large Card — Company Overview */}
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500 p-10 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-red-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-red-200">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Our Story</h3>
                            </div>
                            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                <span className="font-bold text-gray-900">FourBahaus Solutions</span> specializes
                                in the design and manufacturing of high-performance communication devices. We are
                                a leading system integrator and automation partner for major organizations across
                                domains such as <span className="text-red-600 font-semibold">Ex/IS-certified wireless telephony</span> and
                                radio communication, water network automation, photometric water analysis,
                                instrumentation, and explosion-proof automation for fire and gas industries.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                As a prominent player in wireless communication and navigation systems, we have
                                successfully established robust networks for numerous industries and police
                                departments across India. We also serve as a key automation partner for
                                water utilities, Indian Railways, and municipal corporations across
                                Maharashtra and Madhya Pradesh.
                            </p>
                        </div>
                    </div>

                    {/* Right Column — Stacked Cards */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Hazardous Areas Card */}
                        <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-full opacity-5"
                                style={{
                                    background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 20px)',
                                }}
                            />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold">Hazardous Area Mobility</h3>
                                </div>
                                <p className="text-gray-300 leading-relaxed text-sm">
                                    It is essential for employers to ensure worker protection in hazardous zones
                                    where explosive atmospheres may be present. Our solutions mitigate the risk
                                    of equipment becoming an ignition source, enabling safe and reliable operations
                                    in the most demanding conditions.
                                </p>
                            </div>
                        </div>

                        {/* Capabilities */}
                        <div className="space-y-4">
                            {capabilities.map((cap) => (
                                <div
                                    key={cap.title}
                                    className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 hover:border-red-200 hover:shadow-lg transition-all duration-300 group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        {cap.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-0.5">{cap.title}</h4>
                                        <p className="text-gray-500 text-xs leading-relaxed">{cap.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sectors Strip */}
                <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="flex flex-wrap justify-center gap-3 mb-14">
                        {sectors.map((sector) => (
                            <span
                                key={sector.name}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 font-medium shadow-sm hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-md transition-all duration-300 cursor-default"
                            >
                                <span className="text-base">{sector.icon}</span>
                                {sector.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Quote Banner */}
                <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="relative bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-3xl p-[2px] shadow-2xl shadow-red-200/40">
                        <div className="bg-white rounded-3xl px-8 py-10 md:px-16 md:py-12 text-center relative overflow-hidden">
                            <div className="absolute top-4 left-8 text-red-100 text-8xl font-serif leading-none select-none">&ldquo;</div>
                            <div className="absolute bottom-4 right-8 text-red-100 text-8xl font-serif leading-none select-none">&rdquo;</div>
                            <blockquote className="relative z-10 text-xl md:text-2xl font-bold text-gray-900 leading-relaxed max-w-3xl mx-auto">
                                Safety, Performance, Reliability, and Product Documentation are our
                                basic principles of product quality.
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
};

export default WhoWeAre;
