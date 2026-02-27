'use client';

import { useState, useEffect, useRef } from 'react';

const industries = [
    {
        title: 'IoT & IIoT Services',
        subtitle: 'Rugged Connectivity',
        description: 'ATEX-certified smartphones and feature phones designed for hazardous environments. Enabling seamless data flow where safety is paramount.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
        ),
        color: 'from-red-600 to-orange-600',
    },
    {
        title: 'Wireless Communication',
        subtitle: 'Mission Critical',
        description: 'Advanced digital radios and communication systems for mission-critical operations. Keeping teams connected in the toughest terrains.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.5 9.5 0 0113.436 0M3.515 8.485a13.5 13.5 0 0116.97 0" />
            </svg>
        ),
        color: 'from-blue-600 to-indigo-600',
    },
    {
        title: 'Gas Detection',
        subtitle: 'Hazardous Monitoring',
        description: 'Portable and reliable gas detection solutions for Zone 0, 1, 20 and 21 environments. Real-time alerts for invisible threats.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
        ),
        color: 'from-yellow-500 to-orange-500',
    },
    {
        title: 'Water & Gas Pipeline',
        subtitle: 'Network Management',
        description: 'Real-time water network monitoring and resource optimization solutions. Precision engineering for infrastructure management.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.645-5.355l-.707.707M6.352 6.352l-.707.707M12 3.75V3m0 18v-.75" />
            </svg>
        ),
        color: 'from-cyan-600 to-blue-600',
    },
];

const Industries = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-gray-50/50 overflow-hidden relative"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white hidden lg:block" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className={`mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-red-100 rounded-full shadow-sm mb-4">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        <span className="text-red-600 text-sm font-semibold uppercase tracking-wider">
                            Industries
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gradient-logo tracking-tight py-2 leading-tight">
                        Core Sectors & Expertise
                    </h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side: List */}
                    <div className="space-y-4">
                        {industries.map((industry, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`group cursor-pointer p-6 rounded-2xl transition-all duration-500 border ${activeIndex === index
                                    ? 'bg-white border-red-100 shadow-xl shadow-red-500/5 translate-x-4'
                                    : 'bg-transparent border-transparent grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                                    }`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${activeIndex === index ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        <span className="text-lg font-bold">{index + 1}</span>
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold transition-colors duration-500 ${activeIndex === index ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                            {industry.title}
                                        </h3>
                                        <p className={`text-sm font-medium transition-colors duration-500 ${activeIndex === index ? 'text-red-600' : 'text-gray-400'
                                            }`}>
                                            {industry.subtitle}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Side: Spotlight Card */}
                    <div className="relative h-[450px] w-full mt-10 lg:mt-0">
                        {industries.map((industry, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-all duration-700 ease-in-out ${activeIndex === index
                                    ? 'opacity-100 translate-x-0 scale-100 z-10'
                                    : 'opacity-0 translate-x-20 scale-95 z-0'
                                    }`}
                            >
                                <div className="h-full w-full rounded-[40px] bg-white border border-gray-100 shadow-2xl p-10 md:p-14 flex flex-col justify-center relative overflow-hidden group">
                                    {/* Visual Accent */}
                                    <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${industry.color} opacity-10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150`} />

                                    <div className="relative z-10">
                                        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${industry.color} text-white flex items-center justify-center mb-8 shadow-xl shadow-gray-200`}>
                                            {industry.icon}
                                        </div>
                                        <h4 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-4">
                                            {industry.subtitle}
                                        </h4>
                                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                                            {industry.title}
                                        </h3>
                                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                            {industry.description}
                                        </p>
                                        <button className={`inline-flex items-center gap-2 text-gray-900 font-bold group/btn`}>
                                            Explore Solutions
                                            <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Abstract Grid Pattern */}
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-[0.03] pointer-events-none"
                                        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Message */}
                <div className={`mt-20 text-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <p className="text-gray-400 font-medium">
                        Trusted partners in safety and innovation across India's core industrial sectors.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Industries;
