import { redirect } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { getCurrentUserAction } from '@/app/actions/auth.actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener usuario actual
  const result = await getCurrentUserAction();

  if (!result.success || !result.user) {
    redirect('/login');
  }

  const { user } = result;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar user={user} />

        <div className="flex flex-1 flex-col">
          <Header user={user} />

          <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
