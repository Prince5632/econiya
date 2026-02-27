import { getHeaderMenu, getNavCategories, getNavIndustries } from '@/lib/navigation';
import NavbarClient from './NavbarClient';

/**
 * Async server component that fetches navigation data and
 * passes it to the interactive client Navbar.
 */
export default async function NavbarServer() {
    const [headerItems, categories, industryItems] = await Promise.all([
        getHeaderMenu(),
        getNavCategories(),
        getNavIndustries(),
    ]);

    return (
        <NavbarClient
            headerItems={headerItems}
            categories={categories}
            industryItems={industryItems}
        />
    );
}
