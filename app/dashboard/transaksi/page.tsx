'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type Barang = {
  id: string;
  nama: string;
  harga: number;
  stok: number;
};

type CartItem = {
  barang_id: string;
  nama: string;
  harga: number;
  qty: number;
};

export default function TransaksiPage() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBarang = async () => {
    const { data, error } = await supabase
      .from('barang')
      .select('id, nama, harga, stok')
      .order('nama', { ascending: true });

    if (error) console.error(error);
    else setBarangList(data || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  const addToCart = (barang: Barang) => {
    if (barang.stok <= 0) {
      alert(`${barang.nama} stok habis!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find(item => item.barang_id === barang.id);
      
      if (existing) {
        if (existing.qty + 1 > barang.stok) {
          alert(`Stok ${barang.nama} tidak cukup!`);
          return prev;
        }
        return prev.map(item =>
          item.barang_id === barang.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prev, { barang_id: barang.id, nama: barang.nama, harga: barang.harga, qty: 1 }];
      }
    });
  };

  const updateQty = (barang_id: string, newQty: number) => {
    if (newQty < 1) return;

    const barang = barangList.find(b => b.id === barang_id);
    if (barang && newQty > barang.stok) {
      alert(`Stok tidak cukup! Maksimal ${barang.stok}`);
      return;
    }

    setCart(prev =>
      prev.map(item => item.barang_id === barang_id ? { ...item, qty: newQty } : item)
    );
  };

  const removeFromCart = (barang_id: string) => {
    setCart(prev => prev.filter(item => item.barang_id !== barang_id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      for (const item of cart) {
        // Simple and safe way: calculate new stock in frontend then update
        const newStok = barangList.find(b => b.id === item.barang_id)?.stok || 0;
        
        const { error } = await supabase
          .from('barang')
          .update({ stok: newStok - item.qty })
          .eq('id', item.barang_id);

        if (error) throw error;
      }

      alert(`✅ Transaksi Berhasil!\n\nTotal: Rp ${totalAmount.toLocaleString('id-ID')}\nStok telah dikurangi.`);

      setCart([]);        // Clear cart
      fetchBarang();      // Refresh product list with new stock
    } catch (error: any) {
      console.error(error);
      alert('Gagal memproses transaksi: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredBarang = barangList.filter(item =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8">Memuat data barang...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Transaksi Penjualan (Kasir)</h1>
      <p className="text-gray-600 mb-8">Pilih barang → Tambah ke keranjang → Proses transaksi</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product List */}
        <div>
          <Input
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-6"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-auto">
            {filteredBarang.map((barang) => (
              <Card key={barang.id} className="cursor-pointer hover:shadow-md transition" 
                    onClick={() => addToCart(barang)}>
                <CardContent className="p-4">
                  <h3 className="font-medium">{barang.nama}</h3>
                  <p className="text-lg font-bold mt-1">
                    Rp {barang.harga.toLocaleString('id-ID')}
                  </p>
                  <p className={`text-sm mt-1 ${barang.stok < 10 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    Stok: {barang.stok}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div>
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Keranjang ({cart.length})</h2>

              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  Keranjang kosong<br />Klik barang di sebelah kiri untuk menambah
                </div>
              ) : (
                <div className="space-y-5 max-h-[55vh] overflow-auto pb-4">
                  {cart.map((item) => (
                    <div key={item.barang_id} className="flex justify-between items-center border-b pb-4 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.nama}</p>
                        <p className="text-sm text-gray-500">
                          Rp {item.harga.toLocaleString('id-ID')} × {item.qty}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => updateQty(item.barang_id, item.qty - 1)}>-</Button>
                        <span className="w-10 text-center font-medium">{item.qty}</span>
                        <Button variant="outline" size="sm" onClick={() => updateQty(item.barang_id, item.qty + 1)}>+</Button>
                        <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.barang_id)}>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-2xl font-bold mb-6">
                  <span>Total</span>
                  <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>

                <Button 
                  onClick={handleCheckout}
                  className="w-full py-7 text-lg font-semibold"
                  disabled={cart.length === 0}
                >
                  ✅ Proses Transaksi & Kurangi Stok
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}