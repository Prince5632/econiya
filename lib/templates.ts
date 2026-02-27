/* ═══════════════════════════════════════════════════════════════════════════
   Template Section Registry
   Defines all available landing page section types for the template builder.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface TemplateSection {
    /** Unique section identifier */
    type: string;
    /** Human-readable label */
    label: string;
    /** Emoji icon for the section picker */
    icon: string;
    /** Short description for the picker UI */
    description: string;
}

export interface TemplateSectionConfig {
    id: string;
    type: string;
}

export interface TemplateConfig {
    sections: TemplateSectionConfig[];
}

/**
 * All available section types for the template page builder.
 * Each corresponds to a React component in app/components/landing/.
 */
export const TEMPLATE_SECTIONS: TemplateSection[] = [
    {
        type: 'hero',
        label: 'Hero Banner',
        icon: '🎯',
        description: 'Full-width hero section with animated background, headline, and CTA button',
    },
    {
        type: 'stats',
        label: 'Stats Counter',
        icon: '📊',
        description: 'Animated statistics/numbers section showing key company metrics',
    },
    {
        type: 'trustedBy',
        label: 'Trusted By',
        icon: '🏢',
        description: 'Logo carousel showing partner and client brands',
    },
    {
        type: 'whoWeAre',
        label: 'Who We Are',
        icon: '👥',
        description: 'Company introduction section with image and text',
    },
    {
        type: 'productFocus',
        label: 'Product Focus',
        icon: '📦',
        description: 'Featured products showcase with tabs and imagery',
    },
    {
        type: 'industries',
        label: 'Industries',
        icon: '🏭',
        description: 'Grid of industry verticals the company serves',
    },
    {
        type: 'visionMissionValues',
        label: 'Vision, Mission & Values',
        icon: '🌟',
        description: 'Company vision, mission statement, and core values cards',
    },
    {
        type: 'getInTouch',
        label: 'Get In Touch',
        icon: '📞',
        description: 'Contact form and information section with CTA',
    },
];

/**
 * Generates a unique ID for a new section instance.
 */
export function generateSectionId(): string {
    return `section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Creates a default template config with all sections.
 */
export function getDefaultTemplate(): TemplateConfig {
    return {
        sections: TEMPLATE_SECTIONS.map((s) => ({
            id: generateSectionId(),
            type: s.type,
        })),
    };
}
