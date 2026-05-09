import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Fuel, Eye } from 'lucide-react';
import { toast } from 'sonner';
import AlertModal from '../components/AlertModal';
import EquipmentDetailModal from '../components/EquipmentDetailModal';

const EquipmentPage = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEquipmentId, setDeleteEquipmentId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [userRole, setUserRole] = useState('user'); // Simulasi role user
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    status: 'active',
    ownership_status: 'internal',
    rental_rate_per_hour: '',
    deposit_amount: '',
    vendor_id: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/equipment', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingEquipment 
      ? `/api/v1/equipment/${editingEquipment.id}` 
      : '/api/v1/equipment';
    const method = editingEquipment ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData
        })
      });

      if (response.ok) {
        fetchEquipment();
        setShowForm(false);
        setEditingEquipment(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name,
      type: item.type,
      location: item.location || '',
      status: item.status,
      ownership_status: item.ownership_status || 'internal',
      rental_rate_per_hour: item.rental_rate_per_hour || '',
      deposit_amount: item.deposit_amount || '',
      vendor_id: item.vendor_id || ''
    });
    setShowForm(true);
  };

  const handleViewDetail = (item) => {
    setSelectedEquipment(item);
    setShowDetailModal(true);
  };

  const handleDelete = (id) => {
    setDeleteEquipmentId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteEquipmentId) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/v1/equipment/${deleteEquipmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchEquipment();
        toast.success('Equipment berhasil dihapus!');
        setShowDeleteModal(false);
        setDeleteEquipmentId(null);
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      location: '',
      status: 'active',
      ownership_status: 'internal',
      rental_rate_per_hour: '',
      deposit_amount: '',
      vendor_id: ''
    });
  };

  const openAddForm = () => {
    setEditingEquipment(null);
    resetForm();
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8">Loading...</div>
    );
  }

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Equipment Management</h1>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Role saat ini:</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                userRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {userRole === 'admin' ? 'Admin' : 'Operator'}
              </span>
              <button
                onClick={() => setUserRole(userRole === 'admin' ? 'user' : 'admin')}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Ganti Role
              </button>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/fuel')}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md"
            >
              <Fuel size={20} />
              <span>Catat Isi Solar</span>
            </button>
            <button
              onClick={openAddForm}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Equipment</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepemilikan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipment.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'active' ? 'bg-green-100 text-green-800' :
                      item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (item.ownership_status || 'internal') === 'internal' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {(item.ownership_status || 'internal') === 'internal' ? '[Milik]' : '[Rental]'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/fuel?equipment=${item.id}`)}
                        className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 p-1.5 rounded transition-colors"
                        title="Isi BBM"
                      >
                        <Fuel size={16} />
                      </button>
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={() => setShowForm(false)}>
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status Kepemilikan</label>
                    <select
                      value={formData.ownership_status}
                      onChange={(e) => setFormData({...formData, ownership_status: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="internal">Milik Sendiri</option>
                      <option value="rental">Sewa/Rental</option>
                    </select>
                  </div>
                  
                  {formData.ownership_status === 'rental' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tarif Rental (Per Jam)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.rental_rate_per_hour}
                          onChange={(e) => setFormData({...formData, rental_rate_per_hour: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nilai Deposit</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.deposit_amount}
                          onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Vendor ID</label>
                        <input
                          type="number"
                          value={formData.vendor_id}
                          onChange={(e) => setFormData({...formData, vendor_id: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="Opsional"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingEquipment ? 'Update' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      <AlertModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus equipment ini?"
        confirmText="Hapus"
        cancelText="Batal"
      />
      
      <EquipmentDetailModal
        equipment={selectedEquipment}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEquipment(null);
        }}
        userRole={userRole}
      />
    </div>
  );
};

export default EquipmentPage;