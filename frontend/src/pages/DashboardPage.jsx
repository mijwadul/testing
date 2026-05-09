import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Truck, Users, FolderOpen, Fuel, Gauge } from 'lucide-react';
import { API_URL } from '../api/auth';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    equipment_count: 0,
    employee_count: 0,
    project_count: 0,
  });
  const [fuelStats, setFuelStats] = useState({
    total_fuel_consumed: 0,
    equipment_count: 0,
  });
  const [fuelEquipmentReport, setFuelEquipmentReport] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchEquipment();
    fetchEmployees();
    fetchProjects();
    fetchFuelStats();
    fetchFuelEquipmentReport();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchStats = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dashboard/equipment`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dashboard/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dashboard/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchFuelStats = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/fuel/efficiency?days=30`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFuelStats(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching fuel stats:', error);
    }
  };

  const fetchFuelEquipmentReport = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/fuel/equipment-report?days=30`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFuelEquipmentReport(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching fuel equipment report:', error);
    }
  };

  const fuelChartData = useMemo(() => {
    return fuelEquipmentReport
      .slice()
      .sort((a, b) => b.total_liters - a.total_liters)
      .slice(0, 14)
      .map((r) => ({
        name: r.equipment_name.length > 14 ? `${r.equipment_name.slice(0, 13)}…` : r.equipment_name,
        liters: r.total_liters,
        fullName: r.equipment_name,
      }));
  }, [fuelEquipmentReport]);

  const projectData = [
    { name: 'Ongoing', value: 60, color: '#0088FE' },
    { name: 'Completed', value: 30, color: '#00C49F' },
    { name: 'Paused', value: 10, color: '#FFBB28' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard PT. Kusuma Samudera Berkah</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{stats.equipment_count}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.employee_count}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.project_count}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/fuel')} title="Detail BBM dan riwayat isi tangki">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Gauge className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total BBM (30 hari)</p>
              <p className="text-2xl font-bold text-gray-900">{fuelStats.total_fuel_consumed.toFixed(1)} <span className="text-sm font-normal text-gray-500">Liter</span></p>
              <p className="text-xs text-gray-500 mt-0.5">Total pengisian BBM tercatat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
            <div>
              <h2 className="text-xl font-semibold">Total Penggunaan BBM (per alat)</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">
                Total liter BBM yang diisi per unit dalam 30 hari terakhir.
                Data diambil dari menu{' '}
                <button type="button" className="text-amber-700 underline font-medium hover:text-amber-900" onClick={() => navigate('/fuel')}>
                  Logistik BBM
                </button>.
              </p>
            </div>
          </div>
          {fuelChartData.length === 0 ? (
            <p className="text-gray-500 text-sm py-8">Belum ada data pengisian BBM dalam 30 hari terakhir.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={fuelChartData} margin={{ top: 8, right: 16, bottom: 40, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-28} textAnchor="end" height={60} interval={0} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(value, _n, props) => [`${Number(value).toFixed(1)} L`, 'Total BBM']} labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label} />
                <Legend />
                <Bar dataKey="liters" name="Total Liter BBM" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Project Status</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={projectData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {projectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pemantauan BBM vs jam kerja */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Fuel className="h-7 w-7 text-amber-600 shrink-0" />
          <div>
            <h2 className="text-xl font-semibold">Ringkasan BBM & jam kerja (30 hari)</h2>
            <p className="text-sm text-gray-500">Per unit yang punya pengisian BBM dan/atau jam kerja di periode ini; unit tanpa data tidak dicantumkan.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2 font-medium text-gray-600">Alat</th>
                <th className="px-4 py-2 font-medium text-gray-600">Tipe</th>
                <th className="px-4 py-2 font-medium text-gray-600 text-right">Total BBM (L)</th>
                <th className="px-4 py-2 font-medium text-gray-600 text-right">Kali isi</th>
              </tr>
            </thead>
            <tbody>
              {fuelEquipmentReport.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Belum ada aktivitas BBM dalam periode ini.
                  </td>
                </tr>
              ) : (
                fuelEquipmentReport.map((row) => {
                  const needsWorkHours = row.total_liters > 0 && row.total_work_hours <= 0;
                  return (
                    <tr
                      key={row.equipment_id}
                      className={`border-t ${needsWorkHours ? 'bg-amber-50' : ''}`}
                    >
                      <td className="px-4 py-2 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {row.equipment_name}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-600">{row.equipment_type}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-medium text-amber-800">{row.total_liters.toFixed(1)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{row.refuel_count}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Total armada (periode): {fuelStats.total_fuel_consumed.toFixed(1)} L solar · {fuelStats.equipment_count} unit tercatat pengisian BBM.
        </p>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Equipment List</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((eq) => (
                  <tr key={eq.id} className="border-t">
                    <td className="px-4 py-2">{eq.name}</td>
                    <td className="px-4 py-2">{eq.type}</td>
                    <td className="px-4 py-2">{eq.location}</td>
                    <td className="px-4 py-2">{eq.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Employee List</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Position</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-t">
                    <td className="px-4 py-2">{emp.name}</td>
                    <td className="px-4 py-2">{emp.position}</td>
                    <td className="px-4 py-2">{emp.department}</td>
                    <td className="px-4 py-2">{emp.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Projects Placeholder */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Projects (Placeholder)</h2>
        <p className="text-gray-600">Monitoring proyek akan ditambahkan nanti.</p>
        <ul className="list-disc list-inside mt-2">
          {projects.map((proj) => (
            <li key={proj.id}>{proj.name} - {proj.status} ({proj.progress}%)</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
