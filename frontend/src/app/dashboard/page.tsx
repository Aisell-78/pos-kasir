"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Wallet, Activity, Calendar, ShoppingBag } from 'lucide-react';

type SoldItem = {
  name: string;
  total_quantity: string | number;
  total_sales: string | number;
};

export default function DashboardPage() {
  const [data, setData] = useState({ revenue: 0, expenses: 0, net_profit: 0, sold_items: [] as SoldItem[] });
  const [loading, setLoading] = useState(true);
  
  // Default to today in YYYY-MM-DD local time
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/dashboard?date=${selectedDate}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, [selectedDate]);

  const setYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const setToday = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="flex-1 flex flex-col p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/40">
            <Activity className="text-blue-600" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Ringkasan Keuangan</h1>
            <p className="text-slate-600 font-medium text-lg mt-1">Pantau performa keuangan warung Anda.</p>
          </div>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/40 shadow-sm flex-wrap">
          <button onClick={setYesterday} className="px-4 py-2 font-bold text-slate-600 hover:bg-white hover:text-blue-600 rounded-xl transition-colors">
            Kemarin
          </button>
          <button onClick={setToday} className="px-4 py-2 font-bold text-slate-600 hover:bg-white hover:text-blue-600 rounded-xl transition-colors">
            Hari Ini
          </button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <Calendar size={18} className="text-blue-500" />
            <input 
              type="date" 
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-medium">Memuat data dashboard...</div>
      ) : (
        <div className="flex flex-col gap-10">
          {/* Main Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel glass-card-blue p-8 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 text-blue-600 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <TrendingUp size={200} />
              </div>
              <div className="flex items-center gap-3 text-blue-700 font-bold mb-4 text-xl">
                <div className="bg-blue-600/10 p-3 rounded-xl">
                  <TrendingUp size={28} />
                </div>
                Pendapatan
              </div>
              <div className="text-5xl font-black text-slate-800 drop-shadow-sm tracking-tight">
                <span className="text-3xl text-slate-500 mr-1">Rp</span>
                {Number(data.revenue).toLocaleString('id-ID')}
              </div>
            </div>
            
            <div className="glass-panel glass-card-red p-8 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 text-red-600 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <TrendingDown size={200} />
              </div>
              <div className="flex items-center gap-3 text-red-700 font-bold mb-4 text-xl">
                <div className="bg-red-600/10 p-3 rounded-xl">
                  <TrendingDown size={28} />
                </div>
                Pengeluaran
              </div>
              <div className="text-5xl font-black text-slate-800 drop-shadow-sm tracking-tight">
                 <span className="text-3xl text-slate-500 mr-1">Rp</span>
                {Number(data.expenses).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="glass-panel glass-card-green p-8 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 text-green-600 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                <Wallet size={200} />
              </div>
              <div className="flex items-center gap-3 text-green-700 font-bold mb-4 text-xl">
                <div className="bg-green-600/10 p-3 rounded-xl">
                  <Wallet size={28} />
                </div>
                Laba Bersih
              </div>
              <div className={`text-6xl font-black drop-shadow-sm tracking-tighter ${data.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className={`text-3xl mr-1 ${data.net_profit >= 0 ? 'text-green-600/70' : 'text-red-600/70'}`}>Rp</span>
                {Number(data.net_profit).toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Sold Items Details */}
          <div className="glass-panel p-8 border-white/60 shadow-xl mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
                <ShoppingBag size={24} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Rincian Penjualan Produk</h2>
            </div>

            {data.sold_items && data.sold_items.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-white/80 shadow-sm bg-white/40">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/60 text-slate-700 font-bold border-b border-white/80">
                      <th className="p-4">Nama Produk</th>
                      <th className="p-4 text-center">Porsi Terjual</th>
                      <th className="p-4 text-right">Total Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sold_items.map((item, index) => (
                      <tr key={index} className="border-b border-white/40 hover:bg-white/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{item.name}</td>
                        <td className="p-4 text-center">
                          <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg">
                            {item.total_quantity}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-700">
                          Rp {Number(item.total_sales).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-slate-500 font-medium bg-white/30 p-8 rounded-2xl border border-dashed border-slate-300">
                Belum ada produk yang terjual pada tanggal ini.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
