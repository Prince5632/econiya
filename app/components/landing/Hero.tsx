'use client';

import CreativeBackground from './CreativeBackground';
import Image from 'next/image';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

const Hero = ({
  title = "Engineering Safety & Reliability",
  subtitle = "System Integrators & Automation Partners",
  ctaText = "Explore Implementations",
  ctaLink = "/products"
}: HeroProps) => {
  return (
    <div className="relative h-screen min-h-[700px] bg-white overflow-hidden flex flex-col justify-end pt-24 lg:pt-32">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full bg-white">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-red-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      {/* Dynamic Creative Background */}
      <CreativeBackground />

      {/* Content */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-transparent flex flex-col justify-end pb-0">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-24 items-end h-full">

          {/* Left Column: Innovative Image Display */}
          <div className="relative w-full h-[50vh] lg:h-full flex flex-col justify-end animate-fade-in-up animation-delay-500">
            {/* Background Glow Orbs for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-red-100/40 via-transparent to-yellow-100/40 rounded-full blur-[100px] animate-pulse-slow"></div>

            <div className="relative w-full h-full min-h-[350px] lg:min-h-[500px]">
              <Image
                src="/images/logos/Econiya_hero_Png.png"
                alt="Econiya Innovation"
                fill
                className="object-contain object-bottom drop-shadow-2xl"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Decorative accent elements */}
            <div className="absolute -left-10 top-1/4 w-20 h-20 border border-red-200/50 rounded-full animate-[spin_10s_linear_infinite] opacity-50 pointer-events-none"></div>
            <div className="absolute -right-5 bottom-1/4 w-12 h-12 border border-yellow-200/50 rounded-full animate-[spin_7s_linear_infinite_reverse] opacity-50 pointer-events-none"></div>
          </div>

          {/* Right Column: Text & CTA */}
          <div className="text-left pb-10 lg:pb-32 flex flex-col justify-center h-full">
            <div className="inline-flex items-center gap-2 self-start px-5 py-2 bg-white border border-red-100 rounded-full shadow-sm mb-4 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span className="text-red-600 text-sm font-semibold uppercase tracking-wider">
                {subtitle}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-gradient-logo mb-6 leading-tight animate-fade-in-up animation-delay-300">
              <span dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br/>') }} />
            </h1>

            <p className="mt-4 max-w-2xl text-xl text-gray-600 mb-10 animate-fade-in-up animation-delay-500">
              We specialize in <span className="text-gray-900 font-medium">Ex/IS certified Wireless Telephony</span>,
              Radio Communication, and Industrial Automation for the world&apos;s most demanding environments.
            </p>

            <div className="flex flex-col sm:flex-row justify-start gap-4 animate-fade-in-up animation-delay-700">
              <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-red-500/50 transform hover:-translate-y-1 transition-all duration-300">
                {ctaText}
              </button>
              <button className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-full font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-sm">
                Contact Us
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
          }
          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animation-delay-300 { animation-delay: 0.3s; }
          .animation-delay-500 { animation-delay: 0.5s; }
          .animation-delay-700 { animation-delay: 0.7s; }
        `}</style>
    </div >
  );
};

export default Hero;
