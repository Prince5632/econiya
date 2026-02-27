'use client';

import Image from 'next/image';

const logos = [
    { name: 'ONGC', src: '/images/logos/ONGC_logopng.png' },
    { name: 'Indian Oil Corporation', src: '/images/logos/indian-oil-corporation-vector-logo-400x400.png' },
    { name: 'Bharat Petroleum', src: '/images/logos/Bharat_Petroleum-Logo.wine.png' },
    { name: 'Hindustan Petroleum', src: '/images/logos/Hindustan_Petroleum-Logo.wine.png' },
    { name: 'Reliance Industries', src: '/images/logos/reliance-industries-logo-blk.png' },
    { name: 'Essar', src: '/images/logos/Essar_logo.png' },
    { name: 'BASF', src: '/images/logos/toppng.com-basf-logo-vector-free-download-400x400.png' },
    { name: 'ADNOC', src: '/images/logos/adnoc-logo-updated.svg' },
    { name: 'NIOC', src: '/images/logos/National_Iranian_Oil_Company_logo.svg' },
    { name: 'MCGM', src: '/images/logos/MCGM_logo.png' },
    { name: 'PCMC', src: '/images/logos/Official_Logo_of_PCMC.jpeg' },
    { name: 'PMC', src: '/images/logos/PMC-logo-1_0.png' },
];

const LogoCard = ({ logo }: { logo: { name: string; src: string } }) => (
    <div
        className="flex-shrink-0 mx-4 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-red-100 transition-shadow duration-300 overflow-hidden"
        style={{ width: '220px', height: '110px' }}
    >
        <div className="relative w-[160px] h-[70px]">
            <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                fill
                className="object-contain"
                sizes="160px"
                unoptimized
            />
        </div>
    </div>
);

/* One continuous marquee strip: renders children twice side-by-side,
   then translates the first copy out to the left at constant speed.
   Because both copies are identical the loop is seamless. */
const MarqueeRow = ({
    items,
    direction = 'left',
    duration = 40,
}: {
    items: typeof logos;
    direction?: 'left' | 'right';
    duration?: number;
}) => {
    const animClass = direction === 'left' ? 'marquee-left' : 'marquee-right';

    return (
        <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
            <div
                className={`flex ${animClass}`}
                style={
                    {
                        '--marquee-duration': `${duration}s`,
                    } as React.CSSProperties
                }
            >
                {/* First copy */}
                {items.map((logo, i) => (
                    <LogoCard key={`a-${i}`} logo={logo} />
                ))}
                {/* Duplicate for seamless loop */}
                {items.map((logo, i) => (
                    <LogoCard key={`b-${i}`} logo={logo} />
                ))}
            </div>
        </div>
    );
};

const TrustedBy = () => {
    const row1 = logos.slice(0, 6);
    const row2 = logos.slice(6);

    return (
        <section className="py-20 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-red-100 rounded-full shadow-sm mb-4">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        <span className="text-red-600 text-sm font-semibold uppercase tracking-wider">
                            Our Partners
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                        Trusted By{' '}
                        <span className="text-gradient-logo py-1">
                            Industry Leaders
                        </span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Leading organizations across oil &amp; gas, petrochemicals, utilities, and
                        municipal corporations trust Econiya for safety-critical solutions.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <MarqueeRow items={row1} direction="left" duration={35} />
                <MarqueeRow items={row2} direction="right" duration={30} />
            </div>

            <style jsx global>{`
                @keyframes marquee-scroll-left {
                    0%   { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                @keyframes marquee-scroll-right {
                    0%   { transform: translate3d(-50%, 0, 0); }
                    100% { transform: translate3d(0, 0, 0); }
                }
                .marquee-left {
                    will-change: transform;
                    animation: marquee-scroll-left var(--marquee-duration) linear infinite;
                }
                .marquee-right {
                    will-change: transform;
                    animation: marquee-scroll-right var(--marquee-duration) linear infinite;
                }
                .marquee-left:hover,
                .marquee-right:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
};

export default TrustedBy;
