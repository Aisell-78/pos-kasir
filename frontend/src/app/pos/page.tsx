"use client";

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Banknote, CreditCard, Printer, Bluetooth, Utensils } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

type Product = {
  id: number;
  category_id: number;
  name: string;
  price: number;
  stock: number;
  is_menu: number;
  image: string | null;
  category: {
    id: number;
    name: string;
  };
};

type CartItem = Product & {
  quantity: number;
};

type StoreSettings = {
  store_name: string | null;
  address: string | null;
  phone: string | null;
  footer_text: string | null;
};

export default function POSPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [printerDevice, setPrinterDevice] = useState<BluetoothDevice | null>(null);
  const [printerCharacteristic, setPrinterCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);

  useEffect(() => {
    axios.get('/api/products?is_menu=1').then(res => setProducts(res.data)).catch(console.error);
    axios.get('/api/categories').then(res => setCategories(res.data)).catch(console.error);
    axios.get('/api/settings').then(res => setStoreSettings(res.data)).catch(console.error);
  }, []);

  const categoryNames = useMemo(() => {
    return categories.map(c => c.name);
  }, [categories]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const grandTotal = subtotal;

  const connectPrinter = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      setPrinterDevice(device);
      setPrinterCharacteristic(characteristic || null);
      alert('Printer terhubung!');
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungkan printer: ' + (err as Error).message);
    }
  };

  const printReceipt = async (transactionPayload: any) => {
    if (!printerCharacteristic) return;

    try {
      const ESC = '\x1b';
      const INIT = ESC + '@';
      const CENTER = ESC + 'a' + '\x01';
      const LEFT = ESC + 'a' + '\x00';
      const BOLD_ON = ESC + 'E' + '\x01';
      const BOLD_OFF = ESC + 'E' + '\x00';

      let receipt = INIT;
      const storeName = storeSettings?.store_name || user?.name?.toUpperCase() || "STRUK PEMBAYARAN";
      receipt += CENTER + BOLD_ON + storeName.toUpperCase() + "\n" + BOLD_OFF;
      if (storeSettings?.address) receipt += CENTER + storeSettings.address + "\n";
      if (storeSettings?.phone) receipt += CENTER + "Telp: " + storeSettings.phone + "\n";
      receipt += "--------------------------------\n";
      receipt += LEFT;
      
      transactionPayload.items.forEach((item: any) => {
        receipt += `${item.name}\n`;
        receipt += `${item.quantity} x Rp ${item.price} = Rp ${item.subtotal}\n`;
      });
      
      receipt += "--------------------------------\n";
      receipt += `Total     : Rp ${transactionPayload.grand_total}\n`;
      receipt += `Tunai     : Rp ${transactionPayload.payment_amount}\n`;
      receipt += `Kembali   : Rp ${transactionPayload.change_amount}\n`;
      receipt += CENTER + "\n" + (storeSettings?.footer_text || "Terima Kasih Atas Kunjungan Anda") + "\n\n\n\n";

      const encoder = new TextEncoder();
      await printerCharacteristic.writeValue(encoder.encode(receipt));
    } catch (err) {
      console.error(err);
      alert('Gagal mencetak struk');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!paymentAmount) return alert('Masukkan jumlah pembayaran');
    
    const change = Number(paymentAmount) - grandTotal;
    if (change < 0) return alert('Uang tidak cukup');

    const payload = {
      total_amount: grandTotal,
      tax: 0,
      discount: 0,
      grand_total: grandTotal,
      payment_amount: Number(paymentAmount),
      change_amount: change,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }))
    };

    try {
      await axios.post('/api/transactions', payload);
      
      if (printerCharacteristic) {
        await printReceipt(payload);
      } else {
        alert('Transaksi berhasil disimpan! (Printer belum terhubung, struk tidak dicetak)');
      }

      setCart([]);
      setPaymentAmount('');
    } catch (err) {
      console.error(err);
      alert('Gagal memproses transaksi');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full flex-1">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col gap-8 pb-10">
        <div className="flex justify-between items-center bg-white/60 p-4 rounded-2xl border border-white/60 shadow-sm">
          <div className="font-bold text-slate-700 flex items-center gap-2">
            <Printer size={20} className={printerDevice ? "text-blue-600" : "text-slate-400"} />
            Status Printer: {printerDevice ? <span className="text-blue-600">Terhubung ({printerDevice.name})</span> : <span className="text-slate-500">Terputus</span>}
          </div>
          <button 
            onClick={connectPrinter}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm"
          >
            <Bluetooth size={16} /> Hubungkan Printer
          </button>
        </div>

        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] glass-panel bg-white/40 border-dashed border-2 border-slate-300">
            <div className="bg-slate-100 p-6 rounded-full text-slate-400 mb-6">
              <Utensils size={64} />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Belum Ada Menu</h3>
            <p className="text-slate-500 mb-8 text-center max-w-sm">Silakan tambahkan menu makanan atau minuman Anda terlebih dahulu melalui halaman Kelola Menu.</p>
            <Link 
              href="/menu"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={20} /> Tambah Menu Sekarang
            </Link>
          </div>
        ) : (
          categories.map(cat => {
            const categoryProducts = products.filter(p => p.category?.id === cat.id);
            if (categoryProducts.length === 0) return null;

            return (
              <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-10">
                <h2 className="text-2xl font-extrabold mb-5 text-slate-800 drop-shadow-sm flex items-center gap-2">
                  <span className="w-2 h-8 bg-blue-600 rounded-full inline-block"></span>
                  {cat.name}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                  {categoryProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="glass-btn p-3 flex flex-col items-center justify-center text-center group relative overflow-hidden h-fit min-h-[220px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors"></div>
                      
                      {product.image ? (
                        <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 shadow-sm group-hover:scale-105 transition-transform">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4 text-blue-600 font-bold text-2xl shadow-inner group-hover:scale-110 transition-transform">
                          {product.name.charAt(0)}
                        </div>
                      )}
                      
                      <div className="font-bold text-slate-800 text-lg mb-1 leading-tight">{product.name}</div>
                      <div className="text-blue-600 font-extrabold text-sm bg-blue-50 px-3 py-1 rounded-full">Rp {Number(product.price).toLocaleString('id-ID')}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Calculator Sidebar */}
      <div className="w-full lg:w-[420px] glass-panel flex flex-col h-[calc(100vh-140px)] sticky top-4 shadow-2xl border-white/60">
        <div className="p-6 border-b border-white/40 bg-white/40 rounded-t-[1.5rem] flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-500/30">
            <ShoppingCart size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Pesanan</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 opacity-70">
              <ShoppingCart size={64} className="stroke-1" />
              <p className="font-bold">Keranjang Kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white/40 p-3 rounded-xl border border-white/40">
                <div className="flex-1">
                  <div className="font-bold text-slate-700">{item.name}</div>
                  <div className="text-sm text-slate-500 font-medium">Rp {item.price.toLocaleString('id-ID')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-red-50 text-red-600 rounded-lg"><Minus size={16} /></button>
                  <span className="font-bold text-slate-800 w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-blue-50 text-blue-600 rounded-lg"><Plus size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white/60 border-t border-white/40 rounded-b-[1.5rem] flex flex-col gap-4">
          <div className="flex justify-between items-center text-slate-500 font-bold px-2">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center text-slate-800 text-2xl font-black px-2">
            <span>Total Akhir</span>
            <span className="text-blue-600">Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-bold text-slate-600 mb-2 px-1 flex items-center gap-2">
              <Banknote size={16} /> Uang Diterima (Rp)
            </label>
            <input
              type="text"
              className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white/80 focus:outline-none focus:border-blue-500 font-black text-2xl text-slate-800 text-right transition-all"
              placeholder="0"
              value={paymentAmount ? Number(paymentAmount).toLocaleString('id-ID') : ''}
              onChange={e => {
                const rawValue = e.target.value.replace(/\./g, '');
                if (!isNaN(Number(rawValue)) || rawValue === '') {
                  setPaymentAmount(rawValue);
                }
              }}
            />
          </div>

          {paymentAmount && Number(paymentAmount) >= grandTotal && (
             <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100 animate-in fade-in zoom-in-95">
                <span className="font-bold text-green-700">Kembalian</span>
                <span className="text-2xl font-black text-green-700">Rp {(Number(paymentAmount) - grandTotal).toLocaleString('id-ID')}</span>
             </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || !paymentAmount || Number(paymentAmount) < grandTotal}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/30 transition-all flex justify-center items-center gap-3 text-xl active:scale-95"
          >
            <CreditCard size={24} /> SELESAIKAN PESANAN
          </button>
        </div>
      </div>
    </div>
  );
}
