import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, LogOut, Truck, Users, FolderOpen, Menu, X, ChevronLeft, ChevronRight, Fuel, Clock } from 'lucide-react';

const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
        setMobileMenuOpen(false);
      } else {
        setIsOpen(true);
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/equipment', icon: Truck, label: 'Equipment' },
    { path: '/work-logs', icon: Clock, label: 'Log Jam Kerja' },
    { path: '/fuel', icon: Fuel, label: 'Logistik BBM', isFuel: true },
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/projects', icon: FolderOpen, label: 'Projects' },
  ];

  const isActive = (path) => location.pathname === path;

  // Mobile hamburger menu
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Mobile Header */}
        <div className="bg-green-800 text-white p-4 flex items-center justify-between shadow-md fixed top-0 left-0 right-0 z-50">
          <h1 className="text-lg font-bold">PT. Kusuma Samudera</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-green-700 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="absolute top-16 left-0 right-0 bg-green-800 text-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const isFuelItem = item.isFuel;
                  const isItemActive = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isItemActive
                          ? isFuelItem
                            ? 'bg-amber-600 text-white'
                            : 'bg-green-600 text-white'
                          : isFuelItem
                            ? 'hover:bg-amber-700 text-amber-100'
                            : 'hover:bg-green-700 text-green-100'
                      }`}
                    >
                      <item.icon size={20} className={isFuelItem && !isItemActive ? 'text-amber-300' : ''} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 text-red-100 transition-colors w-full"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <div className="pt-16 p-4">
          {children}
        </div>
      </div>
    );
  }

  // Desktop Sidebar
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-green-800 text-white transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-green-700">
          {isOpen ? (
            <h1 className="text-lg font-bold">PT. Kusuma Samudera</h1>
          ) : (
            <span className="text-xl font-bold">KS</span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-green-700 rounded-lg transition-colors"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isFuelItem = item.isFuel;
            const isItemActive = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isItemActive
                    ? isFuelItem
                      ? 'bg-amber-600 text-white'
                      : 'bg-green-600 text-white'
                    : isFuelItem
                      ? 'hover:bg-amber-700 text-amber-100'
                      : 'hover:bg-green-700 text-green-100'
                } ${!isOpen && 'justify-center'}`}
                title={!isOpen ? item.label : ''}
              >
                <item.icon size={20} className={isFuelItem && !isItemActive ? 'text-amber-300' : ''} />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-green-700">
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 text-red-100 transition-colors w-full ${
              !isOpen && 'justify-center'
            }`}
            title={!isOpen ? 'Logout' : ''}
          >
            <LogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
