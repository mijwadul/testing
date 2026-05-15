import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  Truck, Users, FolderOpen, Fuel, Gauge,
  FileText, Clock, CheckCircle, DollarSign,
  AlertTriangle, ChevronRight, RefreshCw, Loader2,
  TrendingUp, Wallet,
} from "lucide-react";
import { API_URL } from "../api/auth";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatIDR = (v) =>
  Number(v ?? 0).toLocaleString("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  });

const formatDate = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

// ─── Mini stat card ───────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, onClick, badge }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 
      ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all" : ""}`}
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500 font-medium truncate">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {badge && (
      <span className="shrink-0 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();

  // ── state ──
  const [currentUser, setCurrentUser]           = useState(null);
  const [stats, setStats]                       = useState({ equipment_count: 0, employee_count: 0, project_count: 0 });
  const [payrollSummary, setPayrollSummary]     = useState(null);
  const [fuelStats, setFuelStats]               = useState({ total_fuel_consumed: 0, equipment_count: 0 });
  const [fuelEquipmentReport, setFuelEquipmentReport] = useState([]);
  const [equipment, setEquipment]               = useState([]);
  const [employees, setEmployees]               = useState([]);
  const [projects, setProjects]                 = useState([]);
  const [loadingPayroll, setLoadingPayroll]     = useState(true);
  const [approvingId, setApprovingId]           = useState(null);

  const getToken = () => localStorage.getItem("token");

  const authFetch = useCallback(async (url) => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.status === 401) { localStorage.removeItem("token"); navigate("/login"); }
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, [navigate]);

  // ── fetch current user ──
  useEffect(() => {
    authFetch(`${API_URL}/auth/me`)
      .then(data => setCurrentUser(data.user ?? data))
      .catch(() => {});
  }, [authFetch]);

  // ── fetch all dashboard data ──
  const fetchAll = useCallback(async () => {
    setLoadingPayroll(true);
    try {
      const [s, pe, fe, fr, eq, emp, proj] = await Promise.allSettled([
        authFetch(`${API_URL}/dashboard/stats`),
        authFetch(`${API_URL}/dashboard/payroll-summary`),
        authFetch(`${API_URL}/fuel/efficiency?days=30`),
        authFetch(`${API_URL}/fuel/equipment-report?days=30`),
        authFetch(`${API_URL}/dashboard/equipment`),
        authFetch(`${API_URL}/dashboard/employees`),
        authFetch(`${API_URL}/dashboard/projects`),
      ]);
      if (s.status  === "fulfilled") setStats(s.value);
      if (pe.status === "fulfilled") setPayrollSummary(pe.value);
      if (fe.status === "fulfilled") setFuelStats(fe.value);
      if (fr.status === "fulfilled") setFuelEquipmentReport(fr.value);
      if (eq.status === "fulfilled") setEquipment(eq.value);
      if (emp.status=== "fulfilled") setEmployees(emp.value);
      if (proj.status==="fulfilled") setProjects(proj.value);
    } finally {
      setLoadingPayroll(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── role ──
  const role   = currentUser?.role ?? "";
  const isGM   = role === "gm" || role === "direktur" || currentUser?.is_admin || currentUser?.is_superuser;
  const canSeePayroll = ["gm", "finance", "admin", "checker", "direktur"].includes(role)
    || currentUser?.is_admin || currentUser?.is_superuser;

  // ── approve payroll ──
  const handleApprove = async (payrollId) => {
    if (!window.confirm("Approve slip gaji ini?")) return;
    setApprovingId(payrollId);
    try {
      await fetch(`${API_URL}/employees/payroll/${payrollId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      await fetchAll();
    } catch {
      alert("Gagal approve payroll");
    } finally {
      setApprovingId(null);
    }
  };

  // ── chart data ──
  const fuelChartData = useMemo(() =>
    fuelEquipmentReport
      .slice()
      .sort((a, b) => b.total_liters - a.total_liters)
      .slice(0, 14)
      .map(r => ({
        name: r.equipment_name.length > 14 ? `${r.equipment_name.slice(0, 13)}…` : r.equipment_name,
        liters: r.total_liters,
        fullName: r.equipment_name,
      })),
  [fuelEquipmentReport]);

  const projectData = useMemo(() => {
    const counts = { ongoing: 0, completed: 0, paused: 0 };
    projects.forEach(p => {
      const s = (p.status || "ongoing").toLowerCase();
      if (s in counts) counts[s]++; else counts.ongoing++;
    });
    return [
      { name: "Ongoing",   value: counts.ongoing,   color: "#3b82f6" },
      { name: "Completed", value: counts.completed, color: "#10b981" },
      { name: "Paused",    value: counts.paused,    color: "#f59e0b" },
    ];
  }, [projects]);

  const ps = payrollSummary;

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">PT. Kusuma Samudera Berkah – Ringkasan Operasional</p>
        </div>
        <button
          onClick={fetchAll}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Core Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Truck}  label="Total Equipment"
          value={stats.equipment_count}
          color="bg-blue-500"
          onClick={() => navigate("/equipment")}
        />
        <StatCard
          icon={Users}  label="Karyawan Aktif"
          value={stats.employee_count}
          color="bg-emerald-500"
          onClick={() => navigate("/employees")}
        />
        <StatCard
          icon={FolderOpen} label="Total Proyek"
          value={stats.project_count}
          color="bg-purple-500"
        />
        <StatCard
          icon={Gauge} label="BBM 30 Hari"
          value={`${fuelStats.total_fuel_consumed.toFixed(1)} L`}
          sub={`${fuelStats.equipment_count} unit`}
          color="bg-amber-500"
          onClick={() => navigate("/fuel")}
        />
      </div>

      {/* ── Payroll Overview (role-gated) ─────────────────────────────────── */}
      {canSeePayroll && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Payroll Overview
            </h2>
            <button
              onClick={() => navigate("/payroll")}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loadingPayroll ? (
            <div className="flex items-center gap-2 text-gray-400 py-4">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat data payroll…
            </div>
          ) : (
            <>
              {/* Payroll stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  icon={Clock}
                  label="Menunggu Approval"
                  value={ps?.pending_count ?? 0}
                  sub={`Nilai: ${formatIDR(ps?.pending_total ?? 0)}`}
                  color="bg-amber-500"
                  badge={ps?.pending_count > 0 ? ps.pending_count : undefined}
                  onClick={() => navigate("/payroll")}
                />
                <StatCard
                  icon={CheckCircle}
                  label={`Approved (${ps?.month_label ?? "Bulan Ini"})`}
                  value={ps?.approved_count ?? 0}
                  sub={`Total: ${formatIDR(ps?.approved_total ?? 0)}`}
                  color="bg-green-500"
                  onClick={() => navigate("/payroll")}
                />
                <StatCard
                  icon={Wallet}
                  label={`Dibayar (${ps?.month_label ?? "Bulan Ini"})`}
                  value={ps?.paid_count ?? 0}
                  sub={`Total: ${formatIDR(ps?.paid_total ?? 0)}`}
                  color="bg-blue-600"
                  onClick={() => navigate("/payroll")}
                />
              </div>

              {/* Pending approval quick-action list (GM only) */}
              {isGM && ps?.recent_pending?.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-b border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">
                      {ps.pending_count} Slip Gaji Menunggu Approval GM
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {ps.recent_pending.map(rec => (
                      <div key={rec.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{rec.employee_name}</p>
                          <p className="text-xs text-gray-400">
                            {formatDate(rec.period_start)} – {formatDate(rec.period_end)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-700">
                            {formatIDR(rec.net_salary)}
                          </span>
                          <button
                            onClick={() => handleApprove(rec.id)}
                            disabled={approvingId === rec.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-60"
                          >
                            {approvingId === rec.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <CheckCircle className="w-3.5 h-3.5" />
                            }
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {ps.pending_count > 5 && (
                    <div className="px-5 py-2 bg-gray-50 border-t border-gray-100">
                      <button
                        onClick={() => navigate("/payroll")}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + {ps.pending_count - 5} lainnya → Lihat semua di Payroll
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* No pending – show success banner */}
              {isGM && ps?.pending_count === 0 && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <p className="text-sm text-green-800 font-medium">
                    Semua slip gaji sudah diapprove. Tidak ada yang menunggu.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              Penggunaan BBM per Alat (30 hari)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Total liter BBM yang diisi per unit</p>
          </div>
          {fuelChartData.length === 0 ? (
            <p className="text-gray-400 text-sm py-10 text-center">
              Belum ada data BBM dalam 30 hari terakhir.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fuelChartData} margin={{ top: 8, right: 8, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" angle={-28} textAnchor="end" height={60} interval={0} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(1)} L`, "Total BBM"]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                />
                <Bar dataKey="liters" name="Liter" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Project status pie */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-800">Status Proyek</h2>
            <p className="text-xs text-gray-400 mt-0.5">Distribusi status proyek aktif</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={projectData} cx="50%" cy="50%"
                outerRadius={100} fill="#8884d8" dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {projectData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── BBM Table ─────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Fuel className="h-5 w-5 text-amber-600" />
          <div>
            <h2 className="text-base font-semibold text-gray-800">Ringkasan BBM (30 hari)</h2>
            <p className="text-xs text-gray-400">Per unit yang punya pengisian BBM</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2 font-medium text-gray-600 text-xs uppercase">Alat</th>
                <th className="px-4 py-2 font-medium text-gray-600 text-xs uppercase">Tipe</th>
                <th className="px-4 py-2 font-medium text-gray-600 text-xs uppercase text-right">Total BBM (L)</th>
                <th className="px-4 py-2 font-medium text-gray-600 text-xs uppercase text-right">Kali Isi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fuelEquipmentReport.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    Belum ada aktivitas BBM dalam periode ini.
                  </td>
                </tr>
              ) : (
                fuelEquipmentReport.map(row => (
                  <tr key={row.equipment_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-medium text-gray-900">{row.equipment_name}</td>
                    <td className="px-4 py-2 text-gray-500">{row.equipment_type}</td>
                    <td className="px-4 py-2 text-right font-semibold text-amber-700 tabular-nums">
                      {row.total_liters.toFixed(1)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600 tabular-nums">{row.refuel_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Equipment + Employee tables ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500" /> Equipment
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {equipment.slice(0, 8).map(eq => (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-800">{eq.name}</td>
                    <td className="px-3 py-2 text-gray-500">{eq.type}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        eq.status === "active" ? "bg-green-100 text-green-700"
                        : eq.status === "maintenance" ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                      }`}>{eq.status}</span>
                    </td>
                  </tr>
                ))}
                {equipment.length === 0 && (
                  <tr><td colSpan={3} className="px-3 py-6 text-center text-gray-400">Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {equipment.length > 8 && (
            <p className="text-xs text-gray-400 mt-2 text-right">+ {equipment.length - 8} lainnya</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" /> Karyawan
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jabatan</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.slice(0, 8).map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-800">{emp.name}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{emp.position}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        emp.status === "active" ? "bg-green-100 text-green-700"
                        : emp.status === "on_leave" ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }`}>{emp.status ?? "-"}</span>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr><td colSpan={3} className="px-3 py-6 text-center text-gray-400">Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {employees.length > 8 && (
            <p className="text-xs text-gray-400 mt-2 text-right">+ {employees.length - 8} lainnya</p>
          )}
        </div>
      </div>
    </div>
  );
}
