import { auth } from '@/auth';
import DashboardShell from './components/DashboardShell';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <DashboardShell userName={session?.user?.name || 'Admin'}>
            {children}
        </DashboardShell>
    );
}
