'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Package, Home, BarChart3 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/');
      } else {
        setUser(session.user);
      }
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Warung Inventori</h1>
          <p className="text-sm text-gray-500 mt-1">Manajemen Stok</p>
        </div>

        <div className="flex-1 p-4 space-y-2">
          <a 
            href="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
          >
            <Home size={20} />
            <span>Dashboard</span>
          </a>
          
          <a 
            href="/dashboard/barang" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
          >
            <Package size={20} />
            <span>Master Barang</span>
          </a>
          
          <a 
            href="/dashboard/transaksi" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
          >
            <BarChart3 size={20} />
            <span>Transaksi Penjualan</span>
          </a>

          <a 
            href="/dashboard/laporan" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
          >
            <BarChart3 size={20} />
            <span>Laporan</span>
          </a>
        </div>

        <div className="p-4 border-t">
          <div className="text-sm text-gray-600 mb-2">
            {user?.email}
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full flex items-center gap-2"
          >
            <LogOut size={18} />
            Keluar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}