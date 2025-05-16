
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import LoadingScreen from '../ui/LoadingScreen';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, isLoading, isAdmin, router]);

  if (isLoading || !user || !isAdmin) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Head>
        <title>{title} | Admin Portal</title>
      </Head>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
