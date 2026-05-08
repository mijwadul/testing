import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Truck, Users, FolderOpen, Fuel, Droplets, Gauge } from 'lucide-react';
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
    total_hours_operated: 0,
    avg_fuel_ratio: 0,
    equipment_count: 0,
  });
  const [equipment, setEquipment] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Fetch data from API
    fetchStats();
    fetchEquipment();
    fetchEmployees();
    fetchProjects();
    fetchFuelStats();
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
      const response = await fetch(`${API_URL}/fuel/efficiency`, {
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

  // Dummy data for charts
  const fuelData = [
    { name: 'Excavator', fuel: 120 },
    { name: 'Truck', fuel: 80 },
    { name: 'Bulldozer', fuel: 100 },
  ];

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
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/fuel')}>
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Gauge className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fuel Efficiency Avg</p>
              <p className="text-2xl font-bold text-gray-900">{fuelStats.avg_fuel_ratio.toFixed(2)} <span className="text-sm font-normal text-gray-500">L/H</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Fuel Consumption by Equipment Type</h2>
          <BarChart width={400} height={300} data={fuelData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="fuel" fill="#8884d8" />
          </BarChart>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Project Status</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={projectData}
              cx={200}
              cy={150}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {projectData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
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