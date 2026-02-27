import Hero from "@/app/components/landing/Hero";
import Stats from "@/app/components/landing/Stats";
import TrustedBy from "@/app/components/landing/TrustedBy";
import WhoWeAre from "@/app/components/landing/WhoWeAre";
import ProductFocus from "@/app/components/landing/ProductFocus";
import Industries from "@/app/components/landing/Industries";
import VisionMissionValues from "@/app/components/landing/VisionMissionValues";
import GetInTouch from "@/app/components/landing/GetInTouch";
import NavbarServer from "@/app/components/NavbarServer";
import Footer from "@/app/components/Footer";

export default async function Home() {
  return (
    <>
      <NavbarServer />
      <main>
        <Hero />
        <section className="py-16 bg-gray-50/50 border-b border-gray-100">
          <Stats />
        </section>
        <TrustedBy />
        <WhoWeAre />
        <ProductFocus />
        <Industries />
        <VisionMissionValues />
        <GetInTouch />
      </main>
      <Footer />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Econiya Technologies",
            url: "https://econiya.com",
            description:
              "System Integrators & Automation Partners specializing in Ex/IS certified Wireless Telephony, Radio Communication, and Industrial Automation.",
            sameAs: ["https://linkedin.com/company/econiya"],
          }),
        }}
      />
    </>
  );
}
