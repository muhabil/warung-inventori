'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';

export default function LaporanPage() {
  const [totalPenjualan, setTotalPenjualan] = useState(0);

  useEffect(() => {
    // For now we show dummy data. We can improve this later with real transaction history
    setTotalPenjualan(1245000);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Laporan</h1>
      <p className="text-gray-600 mb-8">Ringkasan penjualan dan inventori</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-gray-500">Total Penjualan (Hari Ini)</h3>
            <p className="text-4xl font-bold mt-4">
              Rp {totalPenjualan.toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <h3 className="text-gray-500">Transaksi Hari Ini</h3>
            <p className="text-4xl font-bold mt-4">8 kali</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 text-sm text-gray-500">
        Note: Laporan lengkap akan ditambahkan di versi berikutnya (riwayat transaksi per hari).
      </div>
    </div>
  );
}