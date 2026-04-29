"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PackageSearch, Plus, Trash2, Edit3, Save } from 'lucide-react';

type StockItem = {
  id: number;
  name: string;
  stock: number;
  price: number | null;
  is_menu: number;
};

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [name, setName] = useState('');
  const [stock, setStock] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editStock, setEditStock] = useState('');

  const fetchStock = () => {
    // is_menu=0 fetches non-menu items (raw materials)
    axios.get('/api/products?is_menu=0').then(res => setItems(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !stock) return;

    try {
      await axios.post('/api/products', {
        name,
        stock: Number(stock),
        price: null,
        is_menu: false,
        category_id: null
      });
      alert('Stok berhasil ditambahkan!');
      setName('');
      setStock('');
      fetchStock();
    } catch (err) {
      console.error(err);
      alert('Gagal menambah stok');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus item ini?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      fetchStock();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item: StockItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditStock(item.stock.toString());
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await axios.put(`/api/products/${id}`, {
        name: editName,
        stock: Number(editStock)
      });
      setEditingId(null);
      fetchStock();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full flex-1">
      {/* Form Area */}
      <div className="w-full lg:w-[400px] glass-panel p-6 h-fit border-white/60 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
            <PackageSearch size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Input Bahan Mentah</h2>
        </div>
        
        <form onSubmit={handleAdd} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nama Bahan (Daging, Beras, dll)</label>
            <input
              type="text"
              required
              className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Daging Sapi"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Jumlah Stok Tersedia</label>
            <input
              type="text"
              required
              className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium"
              value={stock ? Number(stock).toLocaleString('id-ID') : ''}
              onChange={e => {
                const rawValue = e.target.value.replace(/\./g, '');
                if (!isNaN(Number(rawValue)) || rawValue === '') {
                  setStock(rawValue);
                }
              }}
              placeholder="0"
            />
          </div>
          
          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Tambah Stok
          </button>
        </form>
      </div>

      {/* List Area */}
      <div className="flex-1 glass-panel p-6 border-white/60 shadow-xl">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 drop-shadow-sm flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-600 rounded-full inline-block"></span>
          Daftar Stok Bahan Baku
        </h2>
        
        <div className="flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="text-center text-slate-500 my-10 font-medium bg-white/40 p-8 rounded-2xl border border-dashed border-slate-300">
              Belum ada stok bahan baku yang terdaftar.
            </div>
          ) : items.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-white/60 p-5 rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition-shadow group">
              {editingId === item.id ? (
                 <div className="flex-1 flex gap-3 mr-4">
                    <input type="text" className="p-2 border rounded-lg w-full bg-white" value={editName} onChange={e => setEditName(e.target.value)} />
                    <input
                      type="text"
                      className="p-2 border rounded-lg w-32 bg-white font-bold"
                      value={editStock ? Number(editStock).toLocaleString('id-ID') : ''}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/\./g, '');
                        if (!isNaN(Number(rawValue)) || rawValue === '') {
                          setEditStock(rawValue);
                        }
                      }}
                    />
                 </div>
              ) : (
                <div className="flex-1">
                  <div className="font-extrabold text-slate-800 text-xl">{item.name}</div>
                  <div className="text-slate-500 font-medium mt-1">Sisa Stok: <span className="text-blue-600 font-bold text-lg">{item.stock}</span></div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {editingId === item.id ? (
                  <button onClick={() => handleSaveEdit(item.id)} className="p-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors">
                    <Save size={20} />
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleEdit(item)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100">
                      <Edit3 size={20} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
