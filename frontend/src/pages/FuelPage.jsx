import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Fuel, Plus, Calendar, Truck, MapPin, Droplets, X, Save, Edit, Trash2 } from 'lucide-react';
import { API_URL } from '../api/auth';
import { toast } from 'sonner';
import AlertModal from '../components/AlertModal';

const FuelPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedEquipmentId = searchParams.get('equipment');

  const [equipment, setEquipment] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!preselectedEquipmentId);
  const [editingLog, setEditingLog] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState(null);
  const [stats, setStats] = useState({
    total_fuel_consumed: 0,
    equipment_count: 0
  });

  const [formData, setFormData] = useState({
    equipment_id: preselectedEquipmentId || '',
    liters_filled: '',
    refuel_date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    location: '',
    photo_url: '',
    notes: ''
  });

  useEffect(() => {
    fetchEquipment();
    fetchFuelLogs();
    fetchFuelStats();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchEquipment = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/equipment`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
        // Auto-fill location if equipment selected
        if (preselectedEquipmentId) {
          const selected = data.find(e => e.id === parseInt(preselectedEquipmentId));
          if (selected) {
            setFormData(prev => ({ ...prev, location: selected.location || '' }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchFuelLogs = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/fuel/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFuelLogs(data);
      }
    } catch (error) {
      console.error('Error fetching fuel logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFuelStats = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/fuel/efficiency`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching fuel stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eqIdNum = Number.parseInt(String(formData.equipment_id), 10);
    if (!formData.equipment_id || Number.isNaN(eqIdNum)) {
      alert('Pilih unit alat terlebih dahulu');
      return;
    }

    const parsedLitersFilled = Number.parseFloat(String(formData.liters_filled).replace(',', '.'));

    if (Number.isNaN(parsedLitersFilled)) {
      alert('Jumlah liter harus berupa angka valid');
      return;
    }

    const payload = {
      equipment_id: eqIdNum,
      liters_filled: parsedLitersFilled,
      refuel_date: formData.refuel_date,
      location: formData.location || undefined,
      photo_url: formData.photo_url || undefined,
      notes: formData.notes || undefined
    };

    try {
      const token = getToken();
      const isEditing = editingLog !== null;
      const url = isEditing ? `${API_URL}/fuel/logs/${editingLog.id}` : `${API_URL}/fuel/refuel`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingLog(null);
        setFormData({
          equipment_id: '',
          liters_filled: '',
          refuel_date: new Date().toISOString().slice(0, 16),
          location: '',
          photo_url: '',
          notes: ''
        });
        fetchFuelLogs();
        fetchFuelStats();
        toast.success(isEditing ? 'Catatan BBM berhasil diupdate!' : 'Pengisian BBM berhasil dicatat!');
      } else {
        const error = await response.json();
        alert('Gagal: ' + (error.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting fuel log:', error);
      alert('Gagal menyimpan catatan BBM');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const preventWheelNumberChange = (e) => {
    // Hindari perubahan nilai tidak sengaja saat scroll di input number.
    e.currentTarget.blur();
  };

  const handleEquipmentChange = (e) => {
    const equipmentId = e.target.value;
    const selected = equipment.find(eq => eq.id === parseInt(equipmentId));
    setFormData(prev => ({
      ...prev,
      equipment_id: equipmentId,
      location: selected?.location || prev.location
    }));
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setFormData({
      equipment_id: log.equipment_id,
      liters_filled: log.liters_filled,
      refuel_date: log.refuel_date ? new Date(log.refuel_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      location: log.location || '',
      photo_url: log.photo_url || '',
      notes: log.notes || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (logId) => {
    setDeleteLogId(logId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteLogId) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/fuel/logs/${deleteLogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchFuelLogs();
        fetchFuelStats();
        toast.success('Catatan berhasil dihapus!');
        setShowDeleteModal(false);
        setDeleteLogId(null);
      } else {
        const error = await response.json();
        alert('Gagal menghapus: ' + (error.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting fuel log:', error);
      alert('Gagal menghapus catatan');
    }
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
    setShowForm(false);
    setFormData({
      equipment_id: '',
      liters_filled: '',
      refuel_date: new Date().toISOString().slice(0, 16),
      location: '',
      photo_url: '',
      notes: ''
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Fuel className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Logistik BBM</h1>
            <p className="text-gray-600">Pengisian solar dicatat di sini; jam kerja di menu Jam Kerja. Efisiensi dihitung otomatis dari keduanya.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          <span>{showForm ? 'Batal' : 'Isi Solar'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
          <p className="text-sm text-gray-600">Total BBM (30 hari)</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total_fuel_consumed.toFixed(1)} L</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Total BBM Terpakai</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total_fuel_consumed.toFixed(1)} L</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Alat Terisi</p>
          <p className="text-2xl font-bold text-gray-800">{stats.equipment_count} Unit</p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className={`${editingLog ? 'bg-blue-500' : 'bg-amber-500'} text-white px-6 py-4`}>
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Droplets size={20} />
              <span>{editingLog ? 'Edit Catatan Pengisian Solar' : 'Catat Pengisian Solar'}</span>
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pilih Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Truck className="inline h-4 w-4 mr-1" />
                  Pilih Unit
                </label>
                <select
                  name="equipment_id"
                  value={formData.equipment_id}
                  onChange={handleEquipmentChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Pilih Alat --</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal & Waktu Pengisian */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Tanggal & Waktu Pengisian
                </label>
                <input
                  type="datetime-local"
                  name="refuel_date"
                  value={formData.refuel_date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Klik untuk memilih tanggal dan waktu dari kalender
                </p>
              </div>

              {/* Jumlah Liter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Droplets className="inline h-4 w-4 mr-1" />
                  Jumlah Liter
                </label>
                <input
                  type="number"
                  name="liters_filled"
                  value={formData.liters_filled}
                  onChange={handleInputChange}
                  onWheel={preventWheelNumberChange}
                  placeholder="Contoh: 150.5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                  step="any"
                />
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Lokasi/Proyek
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Contoh: Site A, Tambang Alpha"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Catatan tambahan (opsional)"
                rows="2"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className={`flex-1 ${editingLog ? 'bg-blue-500 hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-600'} text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors`}
              >
                <Save size={20} />
                <span>{editingLog ? 'Update Catatan' : 'Simpan Catatan'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span>Riwayat Pengisian (30 hari terakhir)</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liter</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fuelLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    Belum ada data pengisian BBM
                  </td>
                </tr>
              ) : (
                fuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {log.refuel_date ? new Date(log.refuel_date).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {log.equipment_name}
                      <span className="text-xs text-gray-500 block">{log.equipment_type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-amber-600">{log.liters_filled} L</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{log.location || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.notes || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-1.5 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AlertModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus"
        message="Yakin ingin menghapus catatan pengisian BBM ini?"
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
};

export default FuelPage;
