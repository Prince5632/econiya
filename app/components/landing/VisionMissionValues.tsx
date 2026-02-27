'use client';

import { useEffect, useRef, useState } from 'react';

const items = [
    {
        number: '01',
        label: 'Our Vision',
        text: 'To create innovative solutions & be a leader in integrated communication for the connected world.',
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        gradientBg: 'from-red-50 to-white',
    },
    {
        number: '02',
        label: 'Our Mission',
        text: 'We are committed to leading the IS industry by bringing fresh perspectives in design and engineering.',
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
        ),
        gradientBg: 'from-gray-50 to-white',
    },
    {
        number: '03',
        label: 'Our Values',
        text: 'Transparency | Diverse Perspectives | Respect. We believe in valuing people, and in turn, people valuing our mission.',
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
        ),
        gradientBg: 'from-red-50/50 to-white',
    },
];

const VisionMissionValues = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [rowProgress, setRowProgress] = useState<number[]>([0, 0, 0]);

    useEffect(() => {
        const handleScroll = () => {
            const windowH = window.innerHeight;
            const newProgress = rowRefs.current.map((el) => {
                if (!el) return 0;
                const rect = el.getBoundingClientRect();
                return Math.max(0, Math.min(1, (windowH - rect.top) / (windowH + rect.height)));
            });
            setRowProgress(newProgress);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative py-28 bg-white overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-red-100 rounded-full shadow-sm mb-6">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        <span className="text-red-600 text-sm font-semibold uppercase tracking-wider">
                            What Drives Us
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gradient-logo tracking-tight leading-tight py-2">
                        Vision, Mission & Values
                    </h2>
                </div>

                {/* Rows */}
                <div className="space-y-0">
                    {items.map((item, index) => {
                        const progress = rowProgress[index] || 0;
                        const isEven = index % 2 === 0;

                        // Parallax motion
                        const textX = (1 - Math.min(1, progress * 2)) * (isEven ? -60 : 60);
                        const textOpacity = Math.min(1, progress * 2.5);
                        const numberY = (progress - 0.5) * -40;
                        const lineWidth = Math.min(100, progress * 200);

                        return (
                            <div
                                key={index}
                                ref={(el) => { rowRefs.current[index] = el; }}
                                className="relative"
                            >
                                {/* Connecting line */}
                                <div className="relative h-[2px] w-full">
                                    <div className="absolute inset-0 bg-gray-100" />
                                    <div
                                        className="absolute top-0 h-full bg-gradient-to-r from-red-500 to-red-400"
                                        style={{
                                            width: `${lineWidth}%`,
                                            left: isEven ? '0' : 'auto',
                                            right: isEven ? 'auto' : '0',
                                            transition: 'width 0.05s linear',
                                        }}
                                    />
                                </div>

                                {/* Content panel */}
                                <div className={`relative py-14 md:py-20 flex ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                                    {/* Content card */}
                                    <div
                                        className={`relative z-10 w-full md:w-3/5 ${isEven ? 'md:pr-8' : 'md:pl-8'}`}
                                        style={{
                                            transform: `translateX(${textX}px)`,
                                            opacity: textOpacity,
                                            transition: 'transform 0.05s linear, opacity 0.05s linear',
                                        }}
                                    >
                                        <div className={`bg-gradient-to-br ${item.gradientBg} rounded-3xl p-8 md:p-10 border border-gray-100/80 shadow-sm`}>
                                            <div className={`flex items-start gap-6 ${isEven ? '' : 'md:flex-row-reverse md:text-right'}`}>
                                                {/* Icon */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200">
                                                        {item.icon}
                                                    </div>
                                                </div>

                                                <div className="max-w-xl">
                                                    <span className="text-red-600 text-xs font-bold uppercase tracking-[0.2em] block mb-3">
                                                        {item.label}
                                                    </span>
                                                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
                                                        {item.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Final line */}
                    <div className="h-[2px] w-full bg-gray-100" />
                </div>
            </div>
        </section>
    );
};

export default VisionMissionValues;
