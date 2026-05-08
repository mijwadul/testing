import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogOut, Truck, Users, FolderOpen } from 'lucide-react';
import AlertModal from './AlertModal';

const Navbar = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    setShowLogoutModal(false);
  };

  return (
    <>
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">PT. Kusuma Samudera Berkah</h1>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/equipment" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
              <Truck size={20} />
              <span>Equipment</span>
            </Link>
            <Link to="/employees" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
              <Users size={20} />
              <span>Employees</span>
            </Link>
            <Link to="/projects" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
              <FolderOpen size={20} />
              <span>Projects</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:text-blue-200 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
      <AlertModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin logout?"
        confirmText="Logout"
        cancelText="Batal"
      />
    </>
  );
};

export default Navbar;