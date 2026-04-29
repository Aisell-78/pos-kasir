"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Utensils, Plus, Trash2, Edit3, Pencil, Save, FolderPlus, ImageIcon, X } from 'lucide-react';

type Category = {
  id: number;
  name: string;
};

type MenuItem = {
  id: number;
  name: string;
  price: number;
  is_menu: number;
  category_id: number;
  image: string | null;
  category?: Category;
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newCategory, setNewCategory] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchMenuAndCategories = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        axios.get('/api/products?is_menu=1'),
        axios.get('/api/categories')
      ]);
      setItems(menuRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !categoryId) {
        setCategoryId(catRes.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMenuAndCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (isEdit) {
      setEditImageFile(file);
      setEditImagePreview(previewUrl);
    } else {
      setImageFile(file);
      setImagePreview(previewUrl);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;
    try {
      const res = await axios.post('/api/categories', { name: newCategory });
      setCategories([...categories, res.data]);
      setCategoryId(res.data.id.toString());
      setNewCategory('');
      setShowCatForm(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menambah kategori');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock', '999');
    formData.append('is_menu', '1');
    formData.append('category_id', categoryId);
    if (imageFile) formData.append('image', imageFile);

    try {
      await axios.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setName('');
      setPrice('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMenuAndCategories();
    } catch (err) {
      console.error(err);
      alert('Gagal menambah menu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus menu ini?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      fetchMenuAndCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditCategoryId(item.category_id.toString());
    setEditImageFile(null);
    setEditImagePreview(item.image || null);
  };

  const handleSaveEdit = async (id: number) => {
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('price', editPrice);
    formData.append('category_id', editCategoryId);
    formData.append('_method', 'PUT'); // Laravel method spoofing for PUT with FormData
    if (editImageFile) formData.append('image', editImageFile);

    try {
      await axios.post(`/api/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditingId(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      fetchMenuAndCategories();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perubahan');
    }
  };

  const [editingCategory, setEditingCategory] = useState<{id: number, name: string} | null>(null);

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await axios.put(`/api/categories/${editingCategory.id}`, { name: editingCategory.name });
      setEditingCategory(null);
      fetchMenuAndCategories();
    } catch (err) {
      alert('Gagal mengubah nama kategori');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Hapus kategori ini? Pastikan tidak ada menu di dalamnya.')) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchMenuAndCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus kategori');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full flex-1">
      {/* Form Area */}
      <div className="w-full lg:w-[420px] glass-panel p-6 h-fit border-white/60 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
            <Utensils size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tambah Menu Kasir</h2>
        </div>
        
        <form onSubmit={handleAdd} className="flex flex-col gap-5">
          {/* Category */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-700">Pilih Kategori</label>
              <button 
                type="button"
                onClick={() => setShowCatForm(!showCatForm)}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
              >
                <FolderPlus size={14} /> {showCatForm ? 'Batal' : 'Kelola Kategori'}
              </button>
            </div>

            {showCatForm && (
              <div className="mb-4 space-y-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100">
                {/* Always show Add Category Input */}
                {!editingCategory && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest px-1">Tambah Kategori Baru</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 p-3 rounded-xl border-2 border-blue-100 bg-white focus:outline-none font-medium text-sm"
                        placeholder="Nama kategori..."
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                      />
                      <button type="button" onClick={handleAddCategory} className="bg-blue-600 text-white px-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shrink-0">
                        Tambah
                      </button>
                    </div>
                  </div>
                )}

                {/* Show Edit Input ONLY when editing */}
                {editingCategory && (
                  <div className="flex flex-col gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100">
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest px-1">Edit Nama Kategori</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 p-3 rounded-xl border-2 border-orange-200 bg-white focus:outline-none font-medium text-sm"
                        value={editingCategory.name}
                        onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      />
                      <button type="button" onClick={handleEditCategory} className="bg-orange-500 text-white px-4 rounded-xl font-bold text-sm hover:bg-orange-600 shrink-0">
                        Ubah
                      </button>
                      <button type="button" onClick={() => setEditingCategory(null)} className="bg-white text-slate-400 p-3 rounded-xl border border-slate-200 hover:text-slate-600 shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Category List for Management */}
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">Daftar Kategori</p>
                  <div className="max-h-48 overflow-y-auto pr-1 space-y-1">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                        <div className="flex gap-1">
                          <button 
                            type="button" 
                            onClick={() => setEditingCategory({ id: cat.id, name: cat.name })}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <select
              required
              className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="" disabled>-- Pilih Kategori --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nama Menu</label>
            <input
              type="text"
              required
              className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Soto Ayam Spesial"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Harga Jual (Rp)</label>
            <input
              type="text"
              required
              inputMode="numeric"
              className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium"
              value={price ? Number(price).toLocaleString('id-ID') : ''}
              onChange={e => {
                const raw = e.target.value.replace(/\./g, '');
                if (!isNaN(Number(raw)) || raw === '') setPrice(raw);
              }}
              placeholder="0"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <ImageIcon size={16} className="text-slate-400" /> Foto Menu (Opsional)
            </label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border-2 border-slate-200" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all"
              >
                <ImageIcon size={32} className="mb-2" />
                <span className="text-sm font-medium">Pilih dari Galeri / Kamera</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleImageChange(e)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 active:scale-95"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Plus size={20} /> Simpan Menu</>}
          </button>
        </form>
      </div>

      {/* List Area */}
      <div className="flex-1 glass-panel p-6 border-white/60 shadow-xl">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 drop-shadow-sm flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-600 rounded-full inline-block"></span>
          Daftar Menu Aktif
        </h2>
        
        <div className="flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="text-center text-slate-500 my-10 font-medium bg-white/40 p-8 rounded-2xl border border-dashed border-slate-300">
              Belum ada menu. Tambah menu pertamamu sekarang!
            </div>
          ) : items.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-white/60 p-5 rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition-shadow group">
              {editingId === item.id ? (
                <div className="flex-1 flex gap-3 mr-4 flex-wrap">
                  <select className="p-2 border rounded-lg bg-white" value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)}>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <input type="text" className="p-2 border rounded-lg flex-1 bg-white" value={editName} onChange={e => setEditName(e.target.value)} />
                  <input
                    type="text"
                    inputMode="numeric"
                    className="p-2 border rounded-lg w-40 bg-white font-bold"
                    value={editPrice ? Number(editPrice).toLocaleString('id-ID') : ''}
                    onChange={e => {
                      const raw = e.target.value.replace(/\./g, '');
                      if (!isNaN(Number(raw)) || raw === '') setEditPrice(raw);
                    }}
                  />
                  {/* Edit Image Upload */}
                  <div className="w-full">
                    {editImagePreview ? (
                      <div className="relative w-32">
                        <img src={editImagePreview} alt="Preview" className="w-32 h-24 object-cover rounded-xl border" />
                        <button type="button" onClick={() => { setEditImageFile(null); setEditImagePreview(null); }} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => editFileInputRef.current?.click()} className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:underline font-medium">
                        <ImageIcon size={16} /> Ganti Foto Menu
                      </div>
                    )}
                    <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, true)} />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex gap-4 items-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-2xl flex-shrink-0">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.category?.name || '-'}</div>
                    <div className="font-extrabold text-slate-800 text-xl">{item.name}</div>
                    <div className="text-slate-500 font-medium mt-1">Harga: <span className="text-blue-600 font-bold text-lg">Rp {Number(item.price).toLocaleString('id-ID')}</span></div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
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
