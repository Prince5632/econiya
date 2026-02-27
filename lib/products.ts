export interface Product {
    name: string;
    slug: string;
    description: string;
}

export interface ProductCategory {
    name: string;
    slug: string;
    description: string;
    items: Product[];
}

export const productCategories: ProductCategory[] = [
    {
        name: 'Mobile',
        slug: 'mobile',
        description: 'Ex/IS certified mobile devices engineered for hazardous environments, delivering reliable communication where safety is paramount.',
        items: [
            { name: 'RxlS203', slug: 'rxls203', description: 'Advanced intrinsically safe smartphone with 5G connectivity for Zone 1/21 hazardous areas.' },
            { name: 'RxlS202', slug: 'rxls202', description: 'Rugged Ex-certified mobile device with enhanced durability and industrial-grade sensors.' },
            { name: 'RxlS201', slug: 'rxls201', description: 'Compact intrinsically safe smartphone designed for Zone 2/22 environments.' },
            { name: 'RxlS101', slug: 'rxls101', description: 'Entry-level Ex-certified mobile phone with essential safety features and long battery life.' },
        ],
    },
    {
        name: 'Tablet',
        slug: 'tablet',
        description: 'Industrial-grade tablets certified for hazardous areas, combining powerful computing with explosion-proof safety.',
        items: [
            { name: 'RxAltitude', slug: 'rxaltitude', description: 'High-performance intrinsically safe tablet with 10" display for field operations in hazardous zones.' },
        ],
    },
    {
        name: 'Wireless Communication',
        slug: 'wireless-communication',
        description: 'DECT-based wireless communication systems providing crystal-clear audio in explosive atmospheres and industrial facilities.',
        items: [
            { name: 'CWD CD665', slug: 'cwd-cd665', description: 'ATEX-certified DECT handset for reliable wireless communication in Zone 1 hazardous areas.' },
            { name: 'CWD CD765', slug: 'cwd-cd765', description: 'Advanced DECT handset with integrated man-down detection and lone worker protection.' },
            { name: 'CWD CD775', slug: 'cwd-cd775', description: 'Premium DECT communication device with noise-cancelling technology for industrial environments.' },
            { name: 'CWD CD885', slug: 'cwd-cd885', description: 'Top-tier Ex-certified DECT handset with full-duplex audio and extended range capability.' },
        ],
    },
    {
        name: 'Gas Detector',
        slug: 'gas-detector',
        description: 'Portable and fixed gas detection solutions ensuring worker safety through real-time monitoring of toxic and combustible gases.',
        items: [
            { name: 'Gas-Mini', slug: 'gas-mini', description: 'Compact personal gas detector for single-gas monitoring with audible and visual alarms.' },
            { name: 'Gas-Max', slug: 'gas-max', description: 'Multi-gas detector with up to 4 simultaneous gas readings and wireless data transmission.' },
        ],
    },
    {
        name: 'Water Logger',
        slug: 'water-logger',
        description: 'Smart water monitoring and data logging solutions for utilities and industrial water management systems.',
        items: [
            { name: 'Rx-Log 1.1', slug: 'rx-log-11', description: 'Intelligent water data logger with cellular connectivity for remote monitoring and leak detection.' },
        ],
    },
];

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
    return productCategories.find((cat) => cat.slug === slug);
}

export function getAllCategorySlugs(): string[] {
    return productCategories.map((cat) => cat.slug);
}
