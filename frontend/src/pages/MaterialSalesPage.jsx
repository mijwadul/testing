import React from 'react';
import { ShoppingCart, DollarSign, Package, TrendingUp, Truck, FileText, BarChart3 } from 'lucide-react';

/**
 * Material Sales Page - Placeholder
 * 
 * Fitur yang akan diimplementasikan:
 * - Pencatatan penjualan material tambang (pasir, batu, dll)
 * - Manajemen customer/pembeli
 * - Harga material per kubik/ton
 * - Surat jalan/delivery order
 * - Laporan penjualan harian/bulanan
 * - Piutang dan pembayaran
 */

const MaterialSalesPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Penjualan Material Tambang</h1>
        <p className="text-gray-600 mt-1">Manajemen penjualan material tambang dan surat jalan</p>
      </div>

      {/* Placeholder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-sm text-gray-600">Penjualan Hari Ini</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-sm text-gray-600">Material Terjual (m³)</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-sm text-gray-600">Total Pendapatan</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-sm text-gray-600">Surat Jalan Aktif</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Types */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-500" />
            Jenis Material
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Pasir Sungai', unit: 'm³', price: '-' },
              { name: 'Pasir Hitam', unit: 'm³', price: '-' },
              { name: 'Batu Split 1-2', unit: 'm³', price: '-' },
              { name: 'Batu Split 2-3', unit: 'm³', price: '-' },
              { name: 'Base Course A', unit: 'm³', price: '-' },
              { name: 'Base Course B', unit: 'm³', price: '-' },
            ].map((material, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{material.name}</p>
                  <p className="text-sm text-gray-500">per {material.unit}</p>
                </div>
                <span className="text-lg font-semibold text-gray-400">{material.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Fitur yang Akan Datang
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Manajemen Surat Jalan</p>
                <p className="text-sm text-gray-600">Cetak dan tracking surat jalan pengiriman material</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <FileText className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Database Customer</p>
                <p className="text-sm text-gray-600">Kelola data pembeli dan riwayat pembelian</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Laporan Penjualan</p>
                <p className="text-sm text-gray-600">Analisis penjualan harian, bulanan, dan tahunan</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Manajemen Piutang</p>
                <p className="text-sm text-gray-600">Tracking pembayaran dan piutang customer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="mt-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Modul Penjualan Segera Hadir!</h3>
            <p className="text-amber-100">Fitur lengkap untuk manajemen penjualan material tambang akan segera tersedia.</p>
          </div>
          <ShoppingCart className="h-16 w-16 text-white opacity-50" />
        </div>
      </div>
    </div>
  );
};

export default MaterialSalesPage;
