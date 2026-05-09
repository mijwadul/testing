import React from 'react';
import { Calendar, Clock, UserCheck, Users, Filter, Download } from 'lucide-react';

/**
 * Attendance Page - Placeholder
 * 
 * Fitur yang akan diimplementasikan:
 * - Absensi karyawan dengan clock-in/clock-out
 * - Riwayat absensi per karyawan
 * - Laporan kehadiran (hadir, izin, sakit, alpha)
 * - Export data absensi
 * - Integrasi dengan sistem payroll
 */

const AttendancePage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Absensi Karyawan</h1>
        <p className="text-gray-600 mt-1">Manajemen kehadiran dan absensi karyawan</p>
      </div>

      {/* Placeholder Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-sm text-gray-600">Hadir Hari Ini</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-sm text-gray-600">Terlambat</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-sm text-gray-600">Total Karyawan</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-sm text-gray-600">Izin/Sakit Bulan Ini</p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-amber-100 rounded-full">
            <Clock className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-amber-800 mb-2">Fitur Dalam Pengembangan</h2>
        <p className="text-amber-700 mb-4 max-w-2xl mx-auto">
          Modul absensi karyawan sedang dalam tahap pengembangan. 
          Fitur ini akan mencakup:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2 flex items-center">
              <UserCheck size={16} className="mr-2 text-blue-500" />
              Clock In/Out
            </h3>
              <p className="text-sm text-gray-600">Sistem absensi masuk dan keluar dengan timestamp otomatis</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2 flex items-center">
              <Calendar size={16} className="mr-2 text-green-500" />
              Riwayat Kehadiran
            </h3>
            <p className="text-sm text-gray-600">Lihat riwayat absensi per karyawan dengan filter tanggal</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2 flex items-center">
              <Filter size={16} className="mr-2 text-purple-500" />
              Kategori Absensi
            </h3>
            <p className="text-sm text-gray-600">Kategori hadir, izin, sakit, cuti, dan alpha</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2 flex items-center">
              <Download size={16} className="mr-2 text-amber-500" />
              Export Laporan
            </h3>
            <p className="text-sm text-gray-600">Export data absensi ke Excel/PDF untuk payroll</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
