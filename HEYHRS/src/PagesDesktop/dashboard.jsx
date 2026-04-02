import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import logo from '../assets/Logo.png';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, ShoppingBag, DollarSign,
  Package, Users, Calendar, ChevronDown, BarChart2
} from 'lucide-react';
import './dashboard.css';

// ── Helpers ──────────────────────────────────────────────
const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID', { maximumFractionDigits: 0 });
const fmtShort = (n) => {
  if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(1) + 'M';
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1) + 'jt';
  if (n >= 1_000) return 'Rp ' + (n / 1_000).toFixed(0) + 'rb';
  return fmt(n);
};

const PURPLE_PALETTE = ['#8B5CF6', '#A78BFA', '#6D28D9', '#C4B5FD', '#4B2C83', '#DDD6FE'];

// ── Grouping helpers ──────────────────────────────────────
function getWeekLabel(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return `${mon.getDate()}/${mon.getMonth() + 1}`;
}

function getMonthLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', { month: 'short', year: '2-digit' });
}

function getYearLabel(dateStr) {
  return new Date(dateStr).getFullYear().toString();
}

function groupInvoices(invoices, period) {
  const map = {};
  const labelFn = period === 'week' ? getWeekLabel : period === 'month' ? getMonthLabel : getYearLabel;

  invoices.forEach((inv) => {
    const label = labelFn(inv.tanggal);
    if (!map[label]) map[label] = { label, total: 0, count: 0, items: 0 };
    map[label].total += inv.total || 0;
    map[label].count += 1;
    map[label].items += (inv.rows || []).reduce((s, r) => s + (r.qty || 0), 0);
  });

  return Object.values(map);
}

function getTopProducts(invoices) {
  const map = {};
  invoices.forEach((inv) => {
    (inv.rows || []).forEach((row) => {
      const key = row.desc || 'Unknown';
      if (!map[key]) map[key] = { name: key, qty: 0, revenue: 0 };
      map[key].qty += row.qty || 0;
      map[key].revenue += (row.qty || 0) * (row.harga || 0);
    });
  });
  return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
}

// ── Custom Tooltip ────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-row" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span>{typeof p.value === 'number' && p.name !== 'Transaksi' && p.name !== 'Unit Terjual'
            ? fmtShort(p.value)
            : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── KPI Card ──────────────────────────────────────────────
const KpiCard = ({ icon: Icon, title, value, sub, trend, color }) => (
  <div className="kpi-card">
    <div className="kpi-icon-wrap" style={{ background: color + '18' }}>
      <Icon size={20} color={color} />
    </div>
    <div className="kpi-body">
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      {sub && (
        <div className={`kpi-sub ${trend === 'up' ? 'up' : trend === 'down' ? 'down' : ''}`}>
          {trend === 'up' && <TrendingUp size={12} />}
          {trend === 'down' && <TrendingDown size={12} />}
          {sub}
        </div>
      )}
    </div>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // week | month | year

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('tanggal', { ascending: true });
      if (!error && data) setInvoices(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // ── KPI calculations ──────────────────────────────────
  const kpi = useMemo(() => {
    const totalRevenue = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const totalTransaksi = invoices.length;
    const totalItems = invoices.reduce((s, i) =>
      s + (i.rows || []).reduce((ss, r) => ss + (r.qty || 0), 0), 0);
    const uniqueClients = new Set(invoices.map((i) => i.client?.name || i.client)).size;
    const avgOrder = totalTransaksi > 0 ? totalRevenue / totalTransaksi : 0;
    return { totalRevenue, totalTransaksi, totalItems, uniqueClients, avgOrder };
  }, [invoices]);

  const chartData = useMemo(() => groupInvoices(invoices, period), [invoices, period]);
  const topProducts = useMemo(() => getTopProducts(invoices), [invoices]);

  // ── Period label ──────────────────────────────────────
  const periodLabels = { week: 'Mingguan', month: 'Bulanan', year: 'Tahunan' };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <span>Memuat data penjualan...</span>
      </div>
    );
  }

  return (
    <div className="dash-wrapper">

      {/* ── TOP BAR ── */}
      <div className="dash-topbar">
        <div className="dash-topbar-left">
          <img src={logo} alt="Logo" className="dash-logo" />
          <div>
            <div className="dash-brand">PT. Putri Jagad Raya Jaya Abadi</div>
            <div className="dash-subtitle">Sales Intelligence Dashboard</div>
          </div>
        </div>
        <div className="dash-period-toggle">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              className={`period-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-scroll">

        {/* ── KPI CARDS ── */}
        <div className="kpi-grid">
          <KpiCard icon={DollarSign} title="Total Pendapatan" value={fmtShort(kpi.totalRevenue)} color="#8B5CF6" trend="up" sub={`${kpi.totalTransaksi} faktur`} />
          <KpiCard icon={ShoppingBag} title="Total Transaksi" value={kpi.totalTransaksi.toLocaleString()} color="#7B86C8" sub="faktur tersimpan" />
          <KpiCard icon={Package} title="Unit Terjual" value={kpi.totalItems.toLocaleString()} color="#E8874A" sub="total produk" trend="up" />
          <KpiCard icon={Users} title="Klien Unik" value={kpi.uniqueClients.toLocaleString()} color="#4B2C83" sub="pelanggan berbeda" />
          <KpiCard icon={BarChart2} title="Rata-rata / Faktur" value={fmtShort(kpi.avgOrder)} color="#8B5CF6" sub="nilai rata-rata" />
        </div>

        {/* ── MAIN CHARTS ROW ── */}
        <div className="charts-row">

          {/* Revenue Area Chart */}
          <div className="chart-card chart-card--wide">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Tren Pendapatan</div>
                <div className="chart-card-sub">{periodLabels[period]}</div>
              </div>
              <Calendar size={18} color="#8B5CF6" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtShort} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="Pendapatan" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#8B5CF6', r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Transactions Bar */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Jumlah Transaksi</div>
                <div className="chart-card-sub">{periodLabels[period]}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Transaksi" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── BOTTOM CHARTS ROW ── */}
        <div className="charts-row">

          {/* Top Products Bar */}
          <div className="chart-card chart-card--wide">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Produk Terlaris</div>
                <div className="chart-card-sub">Berdasarkan pendapatan</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" horizontal={false} />
                <XAxis type="number" tickFormatter={fmtShort} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6B6080' }} width={160} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Pendapatan" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={PURPLE_PALETTE[i % PURPLE_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Units sold Line */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Unit Terjual</div>
                <div className="chart-card-sub">{periodLabels[period]}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="items" name="Unit Terjual" stroke="#E8874A" strokeWidth={2.5} dot={{ fill: '#E8874A', r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── RECENT INVOICES TABLE ── */}
        <div className="table-card">
          <div className="chart-card-header" style={{ marginBottom: 16 }}>
            <div>
              <div className="chart-card-title">Faktur Terbaru</div>
              <div className="chart-card-sub">10 faktur terakhir</div>
            </div>
          </div>
          <div className="table-scroll">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>No. Faktur</th>
                  <th>Klien</th>
                  <th>Tanggal</th>
                  <th>Jatuh Tempo</th>
                  <th>Items</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {[...invoices].reverse().slice(0, 10).map((inv, i) => {
                  const items = (inv.rows || []).reduce((s, r) => s + (r.qty || 0), 0);
                  const clientName = typeof inv.client === 'object' ? inv.client?.name : inv.client;
                  return (
                    <tr key={i}>
                      <td><span className="badge-faktur">{inv.no_faktur}</span></td>
                      <td className="client-cell">{clientName || '—'}</td>
                      <td className="date-cell">{inv.tanggal}</td>
                      <td className="date-cell">{inv.jatuh_tempo}</td>
                      <td><span className="badge-items">{items} unit</span></td>
                      <td className="text-right total-cell">{fmt(inv.total || 0)}</td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-row">Belum ada data faktur</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}