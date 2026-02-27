import { cache } from 'react';
import { db } from '@/lib/db';

/* ═══════════════════════════════════════════════════════════════════════════
   Server-side helpers — cached per request via React.cache()
   ═══════════════════════════════════════════════════════════════════════════ */

export interface NavItem {
    id: string;
    label: string;
    url: string;
    order: number;
    target: string;
    parentId: string | null;
    children?: NavItem[];
}

export interface NavCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    products: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
    }[];
}

/**
 * Fetch the "header" NavigationMenu with nested items.
 * Returns top-level items only (children nested).
 */
export const getHeaderMenu = cache(async (): Promise<NavItem[]> => {
    try {
        const menu = await db.navigationMenu.findUnique({
            where: { name: 'header' },
            include: {
                items: {
                    where: { parentId: null },
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            orderBy: { order: 'asc' },
                            include: {
                                children: {
                                    orderBy: { order: 'asc' },
                                },
                            },
                        },
                    },
                },
            },
        });
        return (menu?.items ?? []) as NavItem[];
    } catch {
        return [];
    }
});

/**
 * Fetch published categories with their published products.
 * Used for the Products mega-menu.
 */
export const getNavCategories = cache(async (): Promise<NavCategory[]> => {
    try {
        const categories = await db.category.findMany({
            where: { isPublished: true },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                image: true,
                products: {
                    where: { isPublished: true },
                    orderBy: { sortOrder: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                    },
                },
            },
        });
        return categories;
    } catch {
        return [];
    }
});

/**
 * Fetch the "industries" NavigationMenu with items.
 * Each item represents an industry link.
 */
export const getNavIndustries = cache(async (): Promise<NavItem[]> => {
    try {
        const menu = await db.navigationMenu.findUnique({
            where: { name: 'industries' },
            include: {
                items: {
                    where: { parentId: null },
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        return (menu?.items ?? []) as NavItem[];
    } catch {
        return [];
    }
});
