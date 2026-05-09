import React, { useState, useEffect } from 'react';
import { Fuel, Save, History, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Fuel Price Management - Bina-ERP Finance Module
 * 
 * Fitur:
 * - Atur harga BBM per liter (Solar)
 * - Riwayat perubahan harga
 * - Kalkulasi otomatis biaya BBM
 * - Alert perubahan harga signifikan
 */

const FuelPricePage = () => {
  const [currentPrice, setCurrentPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchFuelPrice();
    fetchPriceHistory();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchFuelPrice = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/fuel/price', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentPrice(data.price_per_liter?.toString() || '');
      }
    } catch (error) {
      console.error('Error fetching fuel price:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    // Placeholder - will fetch from API
    setPriceHistory([
      { date: '2024-01-15', price: 6800, changed_by: 'Finance Staff' },
      { date: '2024-02-01', price: 6950, changed_by: 'GM' },
      { date: '2024-03-10', price: 7200, changed_by: 'Finance Staff' },
    ]);
  };

  const handleSavePrice = async () => {
    if (!newPrice || isNaN(newPrice)) {
      toast.error('Masukkan harga yang valid');
      return;
    }

    const price = parseFloat(newPrice);
    const current = parseFloat(currentPrice) || 0;
    
    // Alert if price change is significant (>10%)
    if (current > 0) {
      const changePercent = Math.abs((price - current) / current * 100);
      if (changePercent > 10) {
        if (!confirm(`Perubahan harga ${changePercent.toFixed(1)}% akan disimpan. Lanjutkan?`)) {
          return;
        }
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/fuel/price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ price_per_liter: price })
      });

      if (response.ok) {
        setCurrentPrice(newPrice);
        setNewPrice('');
        fetchPriceHistory();
        toast.success('Harga BBM berhasil diupdate');
      } else {
        toast.error('Gagal mengupdate harga BBM');
      }
    } catch (error) {
      console.error('Error saving price:', error);
      toast.error('Terjadi kesalahan saat menyimpan');
    }
  };

  // Check finance access
  const hasFinanceAccess = currentUser?.role === 'gm' || currentUser?.role === 'finance';

  if (!hasFinanceAccess && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle size={64} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
        <p className="text-gray-600">Halaman ini hanya untuk GM dan Finance Staff.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Fuel className="h-8 w-8 mr-3 text-amber-500" />
          Manajemen Harga BBM
        </h1>
        <p className="text-gray-600 mt-2">Atur harga solar per liter untuk kalkulasi biaya operasional</p>
      </div>

      {/* Current Price Card */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Harga Saat Ini</p>
            <p className="text-4xl font-bold text-gray-900">
              {currentPrice ? `Rp ${parseFloat(currentPrice).toLocaleString('id-ID')}` : 'Belum diatur'}
            </p>
            <p className="text-sm text-gray-500 mt-1">per Liter (Solar)</p>
          </div>
          <div className="p-4 bg-amber-100 rounded-full">
            <Fuel className="h-10 w-10 text-amber-600" />
          </div>
        </div>

        {/* Price Input */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Harga Baru
          </label>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Masukkan harga baru"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <button
              onClick={handleSavePrice}
              disabled={!newPrice}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>Simpan</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Perubahan harga akan mempengaruhi perhitungan biaya BBM di semua laporan
          </p>
        </div>
      </div>

      {/* Price Impact Info */}
      {currentPrice && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Dampak Biaya Operasional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500">Estimasi Biaya per 100L</p>
              <p className="text-xl font-semibold text-gray-900">
                Rp {(parseFloat(currentPrice) * 100).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500">Rata-rata Penggunaan/Hari</p>
              <p className="text-xl font-semibold text-gray-900">- Liter</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500">Biaya BBM Bulanan (Est)</p>
              <p className="text-xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>
      )}

      {/* Price History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <History className="h-5 w-5 mr-2 text-gray-500" />
          Riwayat Perubahan Harga
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga (Rp/Liter)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perubahan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diubah Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {priceHistory.map((record, idx) => {
                const prevPrice = idx < priceHistory.length - 1 ? priceHistory[idx + 1].price : record.price;
                const change = record.price - prevPrice;
                const changePercent = prevPrice ? ((change / prevPrice) * 100).toFixed(1) : 0;
                
                return (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Rp {record.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {change !== 0 ? (
                        <span className={`inline-flex items-center ${change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {change > 0 ? '↑' : '↓'} Rp {Math.abs(change).toLocaleString('id-ID')} ({changePercent}%)
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{record.changed_by}</td>
                  </tr>
                );
              })}
              {priceHistory.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    Belum ada riwayat perubahan harga
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FuelPricePage;
