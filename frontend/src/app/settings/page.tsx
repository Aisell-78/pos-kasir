"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, Store, Phone, MapPin, MessageSquare, CheckCircle } from 'lucide-react';

type StoreSettings = {
  store_name: string;
  address: string;
  phone: string;
  footer_text: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: '',
    address: '',
    phone: '',
    footer_text: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get('/api/settings').then(res => {
      setSettings({
        store_name: res.data.store_name || '',
        address: res.data.address || '',
        phone: res.data.phone || '',
        footer_text: res.data.footer_text || '',
      });
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await axios.put('/api/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30">
          <Settings size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pengaturan Toko</h1>
          <p className="text-slate-500 font-medium">Kustomisasi identitas yang muncul di struk pembayaran.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-8 border-white/60 shadow-xl flex flex-col gap-6">
        
        {/* Nama Toko */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Store size={16} className="text-blue-500" /> Nama Toko / Warung
          </label>
          <input
            type="text"
            className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium"
            value={settings.store_name}
            onChange={e => setSettings({ ...settings, store_name: e.target.value })}
            placeholder="Contoh: Warung Makan Berkah Jaya"
          />
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Akan tampil sebagai judul utama di bagian atas struk.</p>
        </div>

        {/* Alamat */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <MapPin size={16} className="text-blue-500" /> Alamat Lengkap
          </label>
          <textarea
            rows={3}
            className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium resize-none"
            value={settings.address}
            onChange={e => setSettings({ ...settings, address: e.target.value })}
            placeholder="Contoh: Jl. Merdeka No. 12, Kel. Sukamaju, Kec. Cimahi Utara, Bandung"
          />
        </div>

        {/* Nomor Telepon */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Phone size={16} className="text-blue-500" /> Nomor Telepon / WhatsApp
          </label>
          <input
            type="text"
            inputMode="tel"
            className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium"
            value={settings.phone}
            onChange={e => setSettings({ ...settings, phone: e.target.value })}
            placeholder="Contoh: 0812-3456-7890"
          />
        </div>

        {/* Footer / Pesan Penutup */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <MessageSquare size={16} className="text-blue-500" /> Pesan Penutup Struk
          </label>
          <input
            type="text"
            className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-blue-500 transition-all font-medium"
            value={settings.footer_text}
            onChange={e => setSettings({ ...settings, footer_text: e.target.value })}
            placeholder="Contoh: Terima kasih telah berbelanja! Selamat menikmati."
          />
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Akan tampil di bagian paling bawah struk.</p>
        </div>

        {/* Preview Struk */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Preview Struk</p>
          <div className="font-mono text-sm text-slate-700 leading-relaxed">
            <p className="font-bold text-center text-base">{settings.store_name || 'NAMA TOKO'}</p>
            {settings.address && <p className="text-center text-xs mt-1 text-slate-500">{settings.address}</p>}
            {settings.phone && <p className="text-center text-xs text-slate-500">Telp: {settings.phone}</p>}
            <p className="text-center mt-2">--------------------------------</p>
            <p className="text-slate-400 text-xs text-center mt-1">... item pesanan ...</p>
            <p className="text-center mt-2">--------------------------------</p>
            <p className="text-center text-xs mt-2 text-slate-500">{settings.footer_text || 'Terima kasih telah berbelanja!'}</p>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2 active:scale-95"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : saved ? (
            <><CheckCircle size={20} /> Tersimpan!</>
          ) : (
            <><Save size={20} /> Simpan Pengaturan</>
          )}
        </button>
      </form>
    </div>
  );
}
