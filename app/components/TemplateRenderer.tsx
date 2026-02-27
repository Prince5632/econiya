import { Suspense } from 'react';
import type { TemplateConfig } from '@/lib/templates';
import Hero from '@/app/components/landing/Hero';
import Stats from '@/app/components/landing/Stats';
import TrustedBy from '@/app/components/landing/TrustedBy';
import WhoWeAre from '@/app/components/landing/WhoWeAre';
import ProductFocus from '@/app/components/landing/ProductFocus';
import Industries from '@/app/components/landing/Industries';
import VisionMissionValues from '@/app/components/landing/VisionMissionValues';
import GetInTouch from '@/app/components/landing/GetInTouch';

/* ═══════════════════════════════════════════════════════════════════════════
   Section component map — maps section types to React components.
   ═══════════════════════════════════════════════════════════════════════════ */
const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
    hero: Hero,
    stats: Stats,
    trustedBy: TrustedBy,
    whoWeAre: WhoWeAre,
    productFocus: ProductFocus,
    industries: Industries,
    visionMissionValues: VisionMissionValues,
    getInTouch: GetInTouch,
};

interface TemplateRendererProps {
    template: TemplateConfig;
}

/**
 * Server component that renders a template page by mapping
 * each section config to the corresponding landing component.
 */
export default function TemplateRenderer({ template }: TemplateRendererProps) {
    if (!template?.sections?.length) {
        return (
            <div className="flex items-center justify-center py-32 text-zinc-400">
                <p>No sections configured for this page.</p>
            </div>
        );
    }

    return (
        <>
            {template.sections.map((section) => {
                const Component = SECTION_COMPONENTS[section.type];
                if (!Component) {
                    return (
                        <div key={section.id} className="py-8 text-center text-sm text-zinc-400 bg-zinc-50 border-y border-zinc-100">
                            Unknown section type: <code>{section.type}</code>
                        </div>
                    );
                }
                return (
                    <Suspense key={section.id} fallback={
                        <div className="py-16 flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                        </div>
                    }>
                        <Component />
                    </Suspense>
                );
            })}
        </>
    );
}
