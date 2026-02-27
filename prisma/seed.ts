import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';

// Required for Supabase's self-signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DATABASE_URL!;
const url = new URL(connectionString);
const pool = new Pool({
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    database: url.pathname.slice(1),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // ── 1. Admin User ────────────────────────────────────────────────────────
    const email = 'admin@econiya.com';
    const password = await hashPassword('Admin@123');

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Admin User',
            password,
            role: 'admin',
        },
    });
    console.log('✅ Seeded admin user:', user.email);

    // ── 2. Header Navigation Menu ────────────────────────────────────────────
    // Delete existing header menu and its items first (cascade)
    await prisma.navigationMenu.deleteMany({ where: { name: 'header' } });

    const headerMenu = await prisma.navigationMenu.create({
        data: {
            name: 'header',
            items: {
                create: [
                    { label: 'About Us', url: '/about', order: 0 },
                    { label: 'Contact', url: '/contact', order: 1 },
                    { label: 'Careers', url: '/careers', order: 2 },
                ],
            },
        },
    });
    console.log('✅ Seeded header navigation menu with', 3, 'items');

    // ── 3. Categories & Products ─────────────────────────────────────────────
    // Clear existing products and categories
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});

    const categoriesData = [
        {
            name: 'Mobile',
            slug: 'mobile',
            description: 'Intrinsically safe mobile devices for hazardous areas',
            sortOrder: 0,
            isPublished: true,
            products: [
                { name: 'RxIS203', slug: 'rxis203', description: 'Intrinsically Safe Smartphone — Zone 1/21', sortOrder: 0, isPublished: true },
                { name: 'RxIS202', slug: 'rxis202', description: 'Rugged IS Smartphone for Zone 2/22', sortOrder: 1, isPublished: true },
                { name: 'RxIS201', slug: 'rxis201', description: 'Entry-level IS Phone for hazardous environments', sortOrder: 2, isPublished: true },
                { name: 'RxIS101', slug: 'rxis101', description: 'Compact IS Feature Phone for Zone 1', sortOrder: 3, isPublished: true },
            ],
        },
        {
            name: 'Tablet',
            slug: 'tablet',
            description: 'Rugged tablets built for industrial use',
            sortOrder: 1,
            isPublished: true,
            products: [
                { name: 'RxIS Tab 10', slug: 'rxis-tab-10', description: '10" Intrinsically Safe Tablet', sortOrder: 0, isPublished: true },
                { name: 'RxIS Tab 8', slug: 'rxis-tab-8', description: '8" Rugged IS Tablet', sortOrder: 1, isPublished: true },
            ],
        },
        {
            name: 'Wireless Communication',
            slug: 'wireless-communication',
            description: 'Wireless solutions for hazardous areas',
            sortOrder: 2,
            isPublished: true,
            products: [
                { name: 'RxIS WC100', slug: 'rxis-wc100', description: 'IS Wireless Access Point', sortOrder: 0, isPublished: true },
                { name: 'RxIS WC200', slug: 'rxis-wc200', description: 'IS Mesh Network Node', sortOrder: 1, isPublished: true },
            ],
        },
        {
            name: 'Gas Detector',
            slug: 'gas-detector',
            description: 'Portable and fixed gas detection instruments',
            sortOrder: 3,
            isPublished: true,
            products: [
                { name: 'RxIS GD100', slug: 'rxis-gd100', description: 'Portable Multi-Gas Detector', sortOrder: 0, isPublished: true },
                { name: 'RxIS GD200', slug: 'rxis-gd200', description: 'Fixed Gas Detection System', sortOrder: 1, isPublished: true },
            ],
        },
        {
            name: 'Water Logger',
            slug: 'water-logger',
            description: 'Smart water monitoring and logging devices',
            sortOrder: 4,
            isPublished: true,
            products: [
                { name: 'RxIS WL100', slug: 'rxis-wl100', description: 'Smart Water Level Logger', sortOrder: 0, isPublished: true },
                { name: 'RxIS WL200', slug: 'rxis-wl200', description: 'Advanced Water Quality Logger', sortOrder: 1, isPublished: true },
            ],
        },
    ];

    for (const cat of categoriesData) {
        const { products, ...catData } = cat;
        const category = await prisma.category.create({
            data: {
                ...catData,
                products: {
                    create: products,
                },
            },
        });
        console.log(`✅ Seeded category: ${category.name} with ${products.length} products`);
    }

    // ── 4. Site Settings ─────────────────────────────────────────────────────
    await prisma.siteSettings.upsert({
        where: { id: 'singleton' },
        update: {
            siteName: 'Econiya',
            logoUrl: '/images/logos/Econiya _2026-02-23T06-54-51.316Z.png',
            copyrightText: '© 2026 Econiya. All rights reserved.',
        },
        create: {
            id: 'singleton',
            siteName: 'Econiya',
            logoUrl: '/images/logos/Econiya _2026-02-23T06-54-51.316Z.png',
            copyrightText: '© 2026 Econiya. All rights reserved.',
        },
    });
    console.log('✅ Seeded site settings');
}

main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });
