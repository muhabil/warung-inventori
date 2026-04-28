'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';

type Stats = {
  totalBarang: number;
  totalStok: number;
  lowStock: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalBarang: 0,
    totalStok: 0,
    lowStock: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    // Get total barang and total stok
    const { data: barangData } = await supabase
      .from('barang')
      .select('id, stok');

    if (barangData) {
      const totalBarang = barangData.length;
      const totalStok = barangData.reduce((sum, item) => sum + (item.stok || 0), 0);
      
      // Count low stock (stok < 10)
      const lowStockCount = barangData.filter(item => (item.stok || 0) < 10).length;

      setStats({
        totalBarang,
        totalStok,
        lowStock: lowStockCount,
      });

      // Get actual low stock items
      const lowItems = barangData
        .filter(item => (item.stok || 0) < 10)
        .slice(0, 5); // show max 5

      setLowStockItems(lowItems);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8">Memuat dashboard...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Ringkasan Inventori Warung Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Barang</p>
                <p className="text-4xl font-bold mt-2">{stats.totalBarang}</p>
              </div>
              <Package className="w-10 h-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Stok</p>
                <p className="text-4xl font-bold mt-2">{stats.totalStok}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.lowStock > 0 ? "border-orange-500" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Stok Rendah</p>
                <p className={`text-4xl font-bold mt-2 ${stats.lowStock > 0 ? 'text-orange-600' : ''}`}>
                  {stats.lowStock}
                </p>
              </div>
              <AlertTriangle className={`w-10 h-10 ${stats.lowStock > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Warning */}
      {stats.lowStock > 0 && (
        <Card className="border-orange-500 mb-10">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-orange-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Peringatan Stok Rendah
            </h2>
            
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
                    <span className="font-medium">{item.nama || 'Barang'}</span>
                    <span className="text-orange-600 font-medium">Stok tersisa: {item.stok}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Tidak ada detail stok rendah saat ini.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-gray-500 text-sm">
        Sistem Inventori Warung • Built as Portfolio Project
      </div>
    </div>
  );
}