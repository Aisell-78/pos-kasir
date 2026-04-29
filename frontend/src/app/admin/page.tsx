"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Users, TrendingUp, Phone, MapPin, Clock, Store, RefreshCw } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

type Client = {
  id: number;
  name: string;
  email: string;
  store_name: string;
  address: string | null;
  phone: string | null;
  transactions_count: number;
  total_revenue: number;
  last_active: string | null;
  created_at: string;
};

type AdminData = {
  total_clients: number;
  clients: Client[];
};

export default function AdminPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/admin/clients');
      setData(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Akses Ditolak. Halaman ini hanya untuk Developer.');
      } else {
        setError('Gagal memuat data. Pastikan Anda login sebagai Developer.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (val: number) =>
    'Rp ' + val.toLocaleString('id-ID');

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-3 rounded-2xl shadow-lg shadow-violet-500/30">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Developer Panel</h1>
            <p className="text-slate-500 font-medium">Login sebagai: <span className="text-violet-600 font-bold">{user?.email}</span></p>
          </div>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 bg-white/80 border border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="glass-panel p-12 text-center border-red-200 bg-red-50/50">
          <ShieldCheck size={64} className="text-red-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">{error}</h2>
          <p className="text-red-500 font-medium">Akun yang login harus memiliki role <code className="bg-red-100 px-2 py-0.5 rounded font-mono">admin</code></p>
        </div>
      ) : (
        <>
          {/* Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-panel p-6 border-white/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-violet-100 p-2 rounded-xl"><Users size={20} className="text-violet-600" /></div>
                <span className="font-bold text-slate-600">Total Klien</span>
              </div>
              <p className="text-4xl font-black text-slate-800">{data?.total_clients}</p>
              <p className="text-sm text-slate-400 font-medium mt-1">Akun terdaftar</p>
            </div>
            <div className="glass-panel p-6 border-white/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-xl"><TrendingUp size={20} className="text-blue-600" /></div>
                <span className="font-bold text-slate-600">Total Transaksi</span>
              </div>
              <p className="text-4xl font-black text-slate-800">
                {data?.clients.reduce((sum, c) => sum + c.transactions_count, 0).toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-slate-400 font-medium mt-1">Semua klien</p>
            </div>
            <div className="glass-panel p-6 border-white/60 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 p-2 rounded-xl"><TrendingUp size={20} className="text-green-600" /></div>
                <span className="font-bold text-slate-600">Total Omzet</span>
              </div>
              <p className="text-2xl font-black text-green-600">
                {formatCurrency(data?.clients.reduce((sum, c) => sum + c.total_revenue, 0) || 0)}
              </p>
              <p className="text-sm text-slate-400 font-medium mt-1">Seluruh platform</p>
            </div>
          </div>

          {/* Client Table */}
          <div className="glass-panel p-6 border-white/60 shadow-xl">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-7 bg-violet-600 rounded-full inline-block"></span>
              Daftar Akun Klien
            </h2>

            <div className="flex flex-col gap-4">
              {data?.clients.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-medium">Belum ada klien yang terdaftar.</div>
              ) : data?.clients.map(client => (
                <div key={client.id} className="bg-white/60 border border-white/80 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="bg-violet-100 p-1.5 rounded-lg"><Store size={16} className="text-violet-600" /></div>
                        <span className="font-extrabold text-slate-800 text-lg">{client.store_name}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium ml-9">{client.email}</p>
                      {client.address && (
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 ml-9">
                          <MapPin size={12} /> {client.address}
                        </p>
                      )}
                      {client.phone && (
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 ml-9">
                          <Phone size={12} /> {client.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex sm:flex-col gap-4 sm:gap-2 sm:items-end sm:text-right flex-wrap">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Omzet</p>
                        <p className="font-extrabold text-green-600 text-lg">{formatCurrency(client.total_revenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Transaksi</p>
                        <p className="font-bold text-slate-700">{client.transactions_count.toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 sm:justify-end"><Clock size={10} /> Terakhir Aktif</p>
                        <p className="font-bold text-slate-500 text-sm">{formatDate(client.last_active)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Daftar: {formatDate(client.created_at)}</span>
                    <span className="text-slate-200">•</span>
                    <span className="text-xs font-bold text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">ID #{client.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
