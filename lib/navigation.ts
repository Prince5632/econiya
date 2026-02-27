import { db } from '@/lib/db';
import { cache } from 'react';

export interface NavItem {
    id: string;
    label: string;
    url: string;
    order: number;
    target: string;
    parentId: string | null;
    children?: NavItem[];
}

export interface NavMenu {
    id: string;
    name: string;
    items: NavItem[];
}

/**
 * Fetch a navigation menu by name (e.g. "header", "footer").
 * Uses React cache() to deduplicate across generateMetadata + page render.
 */
export const getNavMenu = cache(async (name: string): Promise<NavMenu | null> => {
    try {
        const menu = await db.navigationMenu.findUnique({
            where: { name },
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
        return menu as NavMenu | null;
    } catch {
        return null;
    }
});

/**
 * Fetch all navigation menus.
 */
export const getAllNavMenus = cache(async (): Promise<NavMenu[]> => {
    try {
        const menus = await db.navigationMenu.findMany({
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
        return menus as NavMenu[];
    } catch {
        return [];
    }
});
