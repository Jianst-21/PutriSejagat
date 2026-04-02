import Sidebar from "../componentsDesktop/sidebar";
import './DashboardLayout.css'; // Kita akan buat/edit CSS ini

export default function DashboardLayout({ children }) {
  console.log("LAYOUT KEPAKE");
  return (
    <div className="dashboard-layout">
      {/* Sidebar akan selalu ada di kiri */}
      <Sidebar />
      
      {/* Area kanan ini yang akan diisi oleh Invoice / halaman lain */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}