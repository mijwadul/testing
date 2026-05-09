import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Fuel, Truck, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Calendar, Filter, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Finance Dashboard - Bina-ERP
 * 
 * Fitur:
 * - Overview pemasukan & pengeluaran
 * - Hutang sewa equipment monitoring
 * - Deposit tracking
 * - Vendor payment status
 * - Quick links ke submenu finance
 */

const FinancePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    pendingPayments: 0,
    depositHeld: 0,
    fuelCost: 0,
    rentalRevenue: 0
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchFinanceData();
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

  const fetchFinanceData = async () => {
    // Placeholder - will fetch from API
    setLoading(false);
  };

  const quickLinks = [
    { 
      title: 'Harga BBM per Liter', 
      path: '/finance/fuel-price', 
      icon: Fuel, 
      color: 'bg-amber-100 text-amber-600',
      desc: 'Atur harga solar untuk kalkulasi biaya'
    },
    { 
      title: 'Tarif Sewa Alat', 
      path: '/finance/rental-rates', 
      icon: Truck, 
      color: 'bg-blue-100 text-blue-600',
      desc: 'Kelola harga rental & deposit'
    },
    { 
      title: 'Pemasukan', 
      path: '/income', 
      icon: TrendingUp, 
      color: 'bg-green-100 text-green-600',
      desc: 'Project & Direct Selling revenue'
    },
    { 
      title: 'Vendor & Hutang', 
      path: '/finance/vendors', 
      icon: CreditCard, 
      color: 'bg-red-100 text-red-600',
      desc: 'Monitoring pembayaran vendor'
    },
    { 
      title: 'Payroll', 
      path: '/finance/payroll', 
      icon: Wallet, 
      color: 'bg-purple-100 text-purple-600',
      desc: 'Gaji karyawan & approved by GM'
    },
    { 
      title: 'Deposit Tracking', 
      path: '/finance/deposits', 
      icon: DollarSign, 
      color: 'bg-cyan-100 text-cyan-600',
      desc: 'Kelola deposit equipment rental'
    },
  ];

  // Check if user has finance access (GM or Finance)
  const hasFinanceAccess = currentUser?.role === 'gm' || currentUser?.role === 'finance' || currentUser?.is_admin;

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
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Finance Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview keuangan & manajemen finansial</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Rp -</span>
          </div>
          <p className="text-sm text-gray-600">Total Pemasukan Bulan Ini</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>vs bulan lalu</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <ArrowDownRight className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Rp -</span>
          </div>
          <p className="text-sm text-gray-600">Total Pengeluaran</p>
          <p className="text-xs text-gray-500 mt-1">BBM, Vendor, Payroll</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Rp -</span>
          </div>
          <p className="text-sm text-gray-600">Hutang Vendor</p>
          <p className="text-xs text-amber-500 mt-1">Menunggu approval GM</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Rp -</span>
          </div>
          <p className="text-sm text-gray-600">Deposit Ditahan</p>
          <p className="text-xs text-gray-500 mt-1">Dari equipment rental</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Menu Keuangan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.path}
              className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${link.color}`}>
                  <link.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Transactions Placeholder */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Transaksi Terbaru</h3>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada transaksi tercatat</p>
                  <p className="text-sm text-gray-400 mt-1">Data akan muncul setelah ada aktivitas keuangan</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="mt-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Menunggu Approval GM</h3>
            <p className="text-amber-100">Transaksi finansial yang memerlukan final approval dari General Manager</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">-</p>
            <p className="text-sm text-amber-100">Pending Items</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
