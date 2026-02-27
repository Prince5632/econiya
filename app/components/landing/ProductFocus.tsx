'use client';

import { useEffect, useRef, useState } from 'react';

const products = [
    {
        title: 'Mobile & Tablets',
        description: 'Enhancing safety with real-time communication while digitizing paperwork to streamline maintenance workflows.',
        cta: 'Learn More',
        icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
        ),
        color: 'bg-gray-900',
        textColor: 'text-white',
    },
    {
        title: 'Gas Detectors',
        description: 'A comprehensive range of gas detection products for industrial facilities & hazardous areas.',
        cta: 'Learn More',
        icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
        ),
        color: 'bg-red-700',
        textColor: 'text-white',
    },
    {
        title: 'Radios (DMR/PoC)',
        description: 'Keeping every personnel connected even in tough conditions. Featuring the new CD765 & CD775 Series.',
        cta: 'Learn More',
        icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.5 9.5 0 0113.436 0M3.515 8.485a13.5 13.5 0 0116.97 0" />
            </svg>
        ),
        color: 'bg-gray-800',
        textColor: 'text-white',
    },
    {
        title: 'New Launches',
        description: 'Explore our latest innovations, featuring next-generation industrial gadgets.',
        cta: 'Learn More',
        icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
        ),
        color: 'bg-red-600',
        textColor: 'text-white',
    }
];

const ProductFocus = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeMobileCard, setActiveMobileCard] = useState(0);
    const mobileContainerRef = useRef<HTMLDivElement>(null);
    const [isDesktop, setIsDesktop] = useState(true);

    const handleMobileScroll = () => {
        if (mobileContainerRef.current) {
            const scrollLeft = mobileContainerRef.current.scrollLeft;
            const width = mobileContainerRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setActiveMobileCard(index);
        }
    };

    const scrollToMobileCard = (index: number) => {
        if (mobileContainerRef.current) {
            const width = mobileContainerRef.current.offsetWidth;
            mobileContainerRef.current.scrollTo({
                left: index * width,
                behavior: 'smooth'
            });
            setActiveMobileCard(index);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            const windowHeight = window.innerHeight;
            const scrollableDistance = sectionHeight - windowHeight;
            const progress = Math.max(0, Math.min(1, (-sectionTop) / scrollableDistance));
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const cardCount = products.length;
    const progressPerCard = 1 / cardCount;

    return (
        <section
            id="solutions"
            ref={sectionRef}
            className="relative bg-white pt-24 lg:pt-0"
            style={{ height: isDesktop ? `${(cardCount * 100) + 50}vh` : 'auto' }}
        >
            <div className="relative lg:sticky lg:top-0 h-auto lg:h-screen w-full overflow-hidden">

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-8 lg:px-24 h-full flex items-center py-12 lg:py-0">
                    <div className="flex flex-col lg:flex-row w-full items-start lg:items-center justify-between gap-12">

                        {/* Left Static Side */}
                        <div className="w-full lg:w-2/5 flex flex-col justify-center relative z-10">
                            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-red-100 rounded-full shadow-sm mb-6 self-start">
                                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                <span className="text-red-600 text-sm font-semibold uppercase tracking-wider">
                                    Our Solutions
                                </span>
                            </div>
                            <h2 className="text-5xl lg:text-6xl font-extrabold text-gradient-logo leading-[0.95] mb-8 tracking-tight py-2">
                                Product<br />Focus
                            </h2>

                            {/* Progress Indicator - Desktop Only */}
                            <div className="hidden lg:flex gap-3">
                                {products.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full transition-all duration-500 ${scrollProgress >= i * progressPerCard ? 'bg-red-600 scale-125' : 'bg-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right Cards Container */}
                        <div className="w-full lg:w-3/5 relative flex lg:justify-center lg:items-center lg:h-[500px]">
                            {/* Mobile: Horizontal Scroll Snap | Desktop: Stack */}
                            <div
                                ref={mobileContainerRef}
                                onScroll={handleMobileScroll}
                                className="relative w-[calc(100%+4rem)] -mx-8 lg:mx-0 lg:w-[380px] lg:h-full flex flex-row lg:block gap-4 lg:gap-0 overflow-x-auto lg:overflow-visible snap-x snap-mandatory px-8 lg:px-0 pb-12 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                            >
                                {products.map((product, index) => {
                                    const cardThreshold = index * progressPerCard;

                                    // Smooth entry calculation
                                    let cardProgress = 0;
                                    if (index === 0) {
                                        cardProgress = 1;
                                    } else if (scrollProgress >= cardThreshold) {
                                        cardProgress = Math.min(1, (scrollProgress - cardThreshold) / (progressPerCard * 0.7));
                                    }

                                    // Covered progress (when next card comes in)
                                    let coveredProgress = 0;
                                    if (index < cardCount - 1) {
                                        const nextThreshold = (index + 1) * progressPerCard;
                                        if (scrollProgress >= nextThreshold) {
                                            coveredProgress = Math.min(1, (scrollProgress - nextThreshold) / (progressPerCard * 0.7));
                                        }
                                    }

                                    // Stacking logic: cards slide in from right, resting position shifts RIGHT for each card
                                    const restingX = isDesktop ? index * 30 : 0;
                                    const entryTranslate = (1 - cardProgress) * 120;
                                    const scale = 1 - (coveredProgress * 0.05);
                                    const rotate = -coveredProgress * 2;
                                    const brightness = 1 - (coveredProgress * 0.1);
                                    const opacity = cardProgress;
                                    const zIndex = index * 10;

                                    return (
                                        <div
                                            key={index}
                                            className={`
                                                flex-shrink-0 w-[85vw] md:w-[450px] lg:w-full min-h-[400px] lg:min-h-0 snap-center
                                                relative lg:absolute lg:top-0 lg:right-0 lg:h-full ${product.color} ${product.textColor}
                                                rounded-[40px] p-8 lg:p-10 flex flex-col justify-between
                                                shadow-xl lg:shadow-2xl
                                                lg:origin-left
                                            `}
                                            style={
                                                isDesktop ? {
                                                    zIndex: zIndex,
                                                    transform: `translateX(calc(${entryTranslate}% + ${restingX}px)) scale(${scale}) rotate(${rotate}deg)`,
                                                    filter: `brightness(${brightness})`,
                                                    opacity: opacity,
                                                    transition: 'transform 0.1s linear, opacity 0.1s linear, filter 0.1s linear',
                                                    willChange: 'transform, opacity'
                                                } : {}
                                            }
                                        >
                                            <div>
                                                <div className="bg-white/20 w-16 h-16 lg:w-20 lg:h-20 rounded-3xl flex items-center justify-center backdrop-blur-sm mb-6 lg:mb-8">
                                                    {product.icon}
                                                </div>
                                                <h4 className="text-3xl lg:text-4xl font-extrabold leading-none mb-4 lg:mb-6 tracking-tight">
                                                    {product.title}
                                                </h4>
                                            </div>

                                            <div className="space-y-4 lg:space-y-6">
                                                <p className="font-medium text-base lg:text-lg opacity-90 leading-relaxed">
                                                    {product.description}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-75 cursor-pointer hover:opacity-100 transition-opacity">
                                                    {product.cta}
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mobile Pagination Dots */}
                            <div className="flex lg:hidden justify-center gap-2 mt-4 absolute -bottom-6 left-0 right-0">
                                {products.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => scrollToMobileCard(i)}
                                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeMobileCard === i ? 'w-8 bg-red-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                                        aria-label={`Go to slide ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductFocus;
