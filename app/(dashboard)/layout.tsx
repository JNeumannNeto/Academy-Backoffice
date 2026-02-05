import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
    <Header />
        <main className="p-6">{children}</main>
    </div>
  </div>
  );
}
