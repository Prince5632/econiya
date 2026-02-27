'use client';

import { useEffect, useState, useRef } from 'react';

interface StatItem {
    id: number;
    value: number;
    suffix: string;
    label: string;
}

const stats: StatItem[] = [
    { id: 1, value: 10, suffix: '+', label: 'YEARS OF INNOVATION' },
    { id: 2, value: 500, suffix: '+', label: 'PROJECTS DELIVERED' },
    { id: 3, value: 50, suffix: '+', label: 'INDUSTRY PARTNERS' },
    { id: 4, value: 100, suffix: '%', label: 'SAFETY STANDARDS' },
];

const Stats = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const Counter = ({ end, duration }: { end: number, duration: number }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            if (!isVisible) return;

            let startTime: number | null = null;
            const animate = (currentTime: number) => {
                if (!startTime) startTime = currentTime;
                const progress = currentTime - startTime;
                const percentage = Math.min(progress / duration, 1);

                setCount(Math.floor(end * percentage));

                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    setCount(end);
                }
            };

            requestAnimationFrame(animate);
        }, [isVisible, end, duration]);

        return <span>{count}</span>;
    };

    return (
        <div ref={sectionRef} className="w-full relative py-10 animate-fade-in-up animation-delay-700">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-red-50/50 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-200/60">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.id}
                            className={`flex flex-col items-center justify-center w-full md:w-1/4 group ${index !== 0 ? 'pt-8 md:pt-0' : ''}`}
                        >
                            <div className="relative">
                                {/* Decorative dot */}
                                <div className="absolute -top-4 -right-6 w-2 h-2 rounded-full bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-600 mb-3 tracking-tighter group-hover:scale-110 transition-transform duration-500 drop-shadow-sm">
                                    <Counter end={stat.value} duration={2000} />
                                    <span className="text-red-600 ml-1">{stat.suffix}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-[2px] bg-red-600 rounded-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                <div className="text-sm md:text-base font-bold text-gray-500 tracking-[0.2em] uppercase group-hover:text-gray-900 transition-colors duration-300">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Stats;
