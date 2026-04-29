"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Receipt, Plus, TrendingDown, Calendar, Trash2 } from 'lucide-react';

type Expense = {
  id: number;
  date: string;
  name: string;
  amount: number;
  description: string;
};

type Summary = {
  today: number;
  yesterday: number;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary>({ today: 0, yesterday: 0 });
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  });

  const fetchExpenses = () => {
    axios.get(`/api/expenses?date=${selectedDate}`).then(res => {
      setExpenses(res.data.expenses);
      setSummary(res.data.summary);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    try {
      // Dapatkan tanggal lokal sesuai zona waktu (WIB)
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const localDateStr = d.toISOString().split('T')[0];

      await axios.post('/api/expenses', {
        date: localDateStr,
        name,
        amount: Number(amount),
        description
      });
      alert('Pengeluaran berhasil dicatat!');
      setName('');
      setAmount('');
      setDescription('');
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert('Gagal mencatat pengeluaran');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus riwayat pengeluaran ini?')) return;
    try {
      await axios.delete(`/api/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus pengeluaran');
    }
  };

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
    <div className="flex flex-col md:flex-row gap-8 h-full flex-1">
      {/* Form Input */}
      <div className="w-full md:w-[400px] glass-panel p-8 h-fit border-white/60 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-600 text-white p-2 rounded-xl shadow-md">
            <Plus size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Catat Pengeluaran</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nama Pengeluaran</label>
            <input
              type="text"
              required
              className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-red-500 transition-all font-medium"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Beli Daging, Gas, dll"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Jumlah Biaya (Rp)</label>
            <input
              type="text"
              required
              className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-red-500 transition-all font-medium"
              value={amount ? Number(amount).toLocaleString('id-ID') : ''}
              onChange={e => {
                const rawValue = e.target.value.replace(/\./g, '');
                if (!isNaN(Number(rawValue)) || rawValue === '') {
                  setAmount(rawValue);
                }
              }}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Keterangan (Opsional)</label>
            <textarea
              className="w-full p-4 rounded-xl border-2 border-slate-200/50 bg-white/80 focus:outline-none focus:border-red-500 transition-all font-medium"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="..."
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 active:scale-95"
          >
            <Receipt size={20} /> Simpan Pengeluaran
          </button>
        </form>
      </div>

      {/* List & Summary */}
      <div className="flex-1 flex flex-col gap-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-panel p-6 bg-white/60 border-white/60 shadow-md flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-2xl text-red-600">
              <TrendingDown size={32} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Hari Ini</div>
              <div className="text-3xl font-black text-slate-800">
                Rp {summary.today.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 bg-white/60 border-white/60 shadow-md flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-2xl text-slate-600">
              <Calendar size={32} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Kemarin</div>
              <div className="text-3xl font-black text-slate-800">
                Rp {summary.yesterday.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="glass-panel p-8 border-white/60 shadow-xl flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800 drop-shadow-sm flex items-center gap-2">
              <span className="w-2 h-8 bg-red-600 rounded-full inline-block"></span>
              Riwayat Pengeluaran
            </h2>
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/40 shadow-sm flex-wrap">
              <button onClick={setYesterday} className="px-4 py-2 font-bold text-slate-600 hover:bg-white hover:text-red-600 rounded-xl transition-colors">
                Kemarin
              </button>
              <button onClick={setToday} className="px-4 py-2 font-bold text-slate-600 hover:bg-white hover:text-red-600 rounded-xl transition-colors">
                Hari Ini
              </button>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <Calendar size={18} className="text-red-500" />
                <input 
                  type="date" 
                  className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {expenses.length === 0 ? (
              <div className="text-center text-slate-500 my-10 font-medium bg-white/40 p-8 rounded-2xl border border-dashed border-slate-300">
                Belum ada data pengeluaran.
              </div>
            ) : expenses.map(exp => (
              <div key={exp.id} className="flex justify-between items-center bg-white/60 p-5 rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner">
                    {exp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-xl">{exp.name}</div>
                    <div className="text-slate-500 font-medium text-sm">
                      {new Date(exp.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • {exp.description || 'Tanpa keterangan'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-black text-red-600">
                    - Rp {Number(exp.amount).toLocaleString('id-ID')}
                  </div>
                  <button 
                    onClick={() => handleDelete(exp.id)} 
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100"
                    title="Hapus Pengeluaran"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
