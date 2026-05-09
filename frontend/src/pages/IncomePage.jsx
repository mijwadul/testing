import React from 'react';
import { DollarSign, TrendingUp, FolderOpen, ShoppingCart, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';

/**
 * Income/Revenue Page - Placeholder
 * 
 * Fitur yang akan diimplementasikan:
 * - Dashboard pemasukan dari Project (kontrak/project based)
 * - Dashboard pemasukan dari Direct Selling (penjualan material langsung)
 * - Ringkasan total pendapatan
 * - Grafik trend pemasukan
 * - Laporan AR (Accounts Receivable) / Piutang
 */

const IncomePage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Pemasukan & Pendapatan</h1>
        <p className="text-gray-600 mt-1">Ringkasan pemasukan dari Project dan Direct Selling</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-sm text-gray-600">Total Pemasukan Bulan Ini</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-sm text-gray-600">Dari Project</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-sm text-gray-600">Dari Direct Selling</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              -
            </div>
          </div>
          <p className="text-sm text-gray-600">Growth dari Bulan Lalu</p>
        </div>
      </div>

      {/* Income Sources Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Project Income */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-blue-500" />
              Pemasukan Project
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Lihat Detail →
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Project Aktif</p>
              <p className="text-xs text-blue-600">
                Pemasukan dari kontrak project yang sedang berjalan dan telah selesai
              </p>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Fitur yang akan datang:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Ringkasan pendapatan per project</li>
                <li>• Status pembayaran dari client</li>
                <li>• Piutang project yang belum dibayar</li>
                <li>• Termin pembayaran dan invoice</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Direct Selling Income */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-amber-500" />
              Direct Selling (Material)
            </h3>
            <button className="text-sm text-amber-600 hover:text-amber-800">
              Lihat Detail →
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800 font-medium mb-2">Penjualan Langsung</p>
              <p className="text-xs text-amber-600">
                Pemasukan dari penjualan material tambang langsung ke customer
              </p>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Fitur yang akan datang:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Ringkasan penjualan per material</li>
                <li>• Piutang dari customer</li>
                <li>• Statistik penjualan harian/bulanan</li>
                <li>• Top customers dan trends</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-purple-500" />
          Trend Pemasukan
        </h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Grafik trend pemasukan akan ditampilkan di sini</p>
            <p className="text-sm mt-1">Perbandingan Project vs Direct Selling</p>
          </div>
        </div>
      </div>

      {/* AR / Receivables Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Piutang & Accounts Receivable</h3>
            <p className="text-blue-100">Track pembayaran yang masih tertunggak dari Project dan Direct Selling</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Total Piutang</p>
            <p className="text-3xl font-bold">-</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomePage;
