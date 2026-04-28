'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Edit2 } from 'lucide-react';

type Barang = {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  kategori?: string;
};

export default function MasterBarang() {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState<Barang | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [kategori, setKategori] = useState('');

  const fetchBarang = async () => {
    const { data, error } = await supabase
      .from('barang')
      .select('*')
      .order('nama', { ascending: true });

    if (error) console.error(error);
    else setBarang(data || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  // === ADD NEW BARANG ===
  const handleAddBarang = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from('barang').insert([{
      nama: nama.trim(),
      harga: parseInt(harga),
      stok: parseInt(stok),
      kategori: kategori.trim() || null,
    }]);

    if (!error) {
      resetForm();
      setIsAddDialogOpen(false);
      fetchBarang();
    } else {
      alert('Gagal menambahkan: ' + error.message);
    }
  };

  // === EDIT BARANG ===
  const openEditDialog = (item: Barang) => {
    setEditingBarang(item);
    setNama(item.nama);
    setHarga(item.harga.toString());
    setStok(item.stok.toString());
    setKategori(item.kategori || '');
    setIsEditDialogOpen(true);
  };

  const handleEditBarang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBarang) return;

    const { error } = await supabase
      .from('barang')
      .update({
        nama: nama.trim(),
        harga: parseInt(harga),
        stok: parseInt(stok),
        kategori: kategori.trim() || null,
      })
      .eq('id', editingBarang.id);

    if (!error) {
      resetForm();
      setIsEditDialogOpen(false);
      fetchBarang();
    } else {
      alert('Gagal mengedit: ' + error.message);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Yakin ingin menghapus "${nama}"?`)) return;

    const { error } = await supabase.from('barang').delete().eq('id', id);
    if (!error) fetchBarang();
    else alert('Gagal menghapus: ' + error.message);
  };

  const resetForm = () => {
    setNama('');
    setHarga('');
    setStok('');
    setKategori('');
    setEditingBarang(null);
  };

  if (loading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Master Barang</h1>
          <p className="text-gray-600">Kelola daftar produk warung Anda</p>
        </div>

        {/* Add Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger>
            <p className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">
              + Tambah Barang Baru
            </p>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Barang Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBarang} className="space-y-4">
              <div>
                <Label>Nama Barang *</Label>
                <Input value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Harga (Rp) *</Label>
                  <Input type="number" value={harga} onChange={(e) => setHarga(e.target.value)} required />
                </div>
                <div>
                  <Label>Stok Awal *</Label>
                  <Input type="number" value={stok} onChange={(e) => setStok(e.target.value)} required />
                </div>
              </div>
              <div>
                <Label>Kategori</Label>
                <Input value={kategori} onChange={(e) => setKategori(e.target.value)} placeholder="Makanan, Minuman..." />
              </div>
              <DialogFooter>
                <Button type="submit">Simpan Barang</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {barang.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nama}</TableCell>
                <TableCell>{item.kategori || '-'}</TableCell>
                <TableCell className="text-right">Rp {item.harga.toLocaleString('id-ID')}</TableCell>
                <TableCell className="text-right font-medium">{item.stok}</TableCell>
                <TableCell className="text-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(item)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(item.id, item.nama)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {barang.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Belum ada barang. Tambahkan barang baru.
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Barang</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditBarang} className="space-y-4">
            <div>
              <Label>Nama Barang *</Label>
              <Input value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga (Rp) *</Label>
                <Input type="number" value={harga} onChange={(e) => setHarga(e.target.value)} required />
              </div>
              <div>
                <Label>Stok *</Label>
                <Input type="number" value={stok} onChange={(e) => setStok(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label>Kategori</Label>
              <Input value={kategori} onChange={(e) => setKategori(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}