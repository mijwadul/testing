import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EquipmentPage from './pages/EquipmentPage';
import EmployeesPage from './pages/EmployeesPage';
import ProjectsPage from './pages/ProjectsPage';
import FuelPage from './pages/FuelPage';
import WorkLogsPage from './pages/WorkLogsPage';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Layout dengan Sidebar untuk halaman yang memerlukan autentikasi
const MainLayout = () => {
  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  );
};

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/fuel" element={<FuelPage />} />
          <Route path="/work-logs" element={<WorkLogsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;