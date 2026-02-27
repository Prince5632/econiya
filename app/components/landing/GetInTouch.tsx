'use client';

import Link from 'next/link';

const GetInTouch = () => {
    return (
        <section className="relative py-28 bg-gray-50 overflow-hidden">
            {/* Subtle red glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-100/40 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-red-100 rounded-full shadow-sm mb-8">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span className="text-red-600 text-sm font-semibold uppercase tracking-wider">
                        Get in Touch
                    </span>
                </div>

                {/* Heading */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gradient-logo leading-tight tracking-tight mb-6 py-2">
                    Ready to enhance<br />your operation?
                </h2>

                {/* Description */}
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Discover how our intrinsic safety solutions can streamline your workflows and save lives.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/contact"
                        className="px-10 py-4 bg-red-600 text-white rounded-full font-bold text-lg shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-red-300 hover:-translate-y-1 transition-all duration-300"
                    >
                        Contact Us
                    </Link>
                    <Link
                        href="/products"
                        className="px-10 py-4 bg-white text-gray-900 rounded-full font-bold text-lg border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        Explore Products
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default GetInTouch;
