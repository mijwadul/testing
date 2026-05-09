import React, { useState } from 'react';
import { X, DollarSign, Info, Building2 } from 'lucide-react';

const EquipmentDetailModal = ({ equipment, isOpen, onClose, userRole = 'user' }) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen || !equipment) return null;

  const canViewFinancial = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-gray-900">Detail Equipment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Info size={16} />
                <span>Informasi Umum</span>
              </div>
            </button>
            
            {canViewFinancial && (
              <button
                onClick={() => setActiveTab('financial')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'financial'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} />
                  <span>Informasi Finansial</span>
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Data Operasional</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nama Equipment</label>
                    <p className="text-sm text-gray-900 font-medium">{equipment.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tipe</label>
                    <p className="text-sm text-gray-900">{equipment.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Lokasi</label>
                    <p className="text-sm text-gray-900">{equipment.location || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status Operasional</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      equipment.status === 'active' ? 'bg-green-100 text-green-800' :
                      equipment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {equipment.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Informasi Tambahan</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status Kepemilikan</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (equipment.ownership_status || 'internal') === 'internal' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {(equipment.ownership_status || 'internal') === 'internal' ? 'Milik Sendiri' : 'Sewa/Rental'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ID Equipment</label>
                    <p className="text-sm text-gray-900">#{equipment.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tanggal Dibuat</label>
                    <p className="text-sm text-gray-900">
                      {new Date(equipment.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {equipment.updated_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Terakhir Diupdate</label>
                      <p className="text-sm text-gray-900">
                        {new Date(equipment.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && canViewFinancial && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <DollarSign size={20} />
                  <span>Informasi Rental</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status Kepemilikan</label>
                    <p className="text-sm text-gray-900 font-medium">
                      {(equipment.ownership_status || 'internal') === 'internal' ? 'Milik Sendiri' : 'Sewa/Rental'}
                    </p>
                  </div>
                  {(equipment.ownership_status || 'internal') === 'rental' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Tarif Rental per Jam</label>
                        <p className="text-sm text-gray-900 font-medium">
                          Rp {parseFloat(equipment.rental_rate_per_hour || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Nilai Deposit</label>
                        <p className="text-sm text-gray-900 font-medium">
                          Rp {parseFloat(equipment.deposit_amount || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Vendor ID</label>
                        <p className="text-sm text-gray-900">
                          {equipment.vendor_id ? `#${equipment.vendor_id}` : '-'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Building2 size={20} />
                  <span>Informasi Vendor</span>
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {(equipment.ownership_status || 'internal') === 'rental' ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Vendor ID:</strong> {equipment.vendor_id || 'Belum diatur'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Catatan: Fitur manajemen vendor akan tersedia pada update selanjutnya.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Equipment ini milik perusahaan, tidak ada informasi vendor yang tersedia.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailModal;
