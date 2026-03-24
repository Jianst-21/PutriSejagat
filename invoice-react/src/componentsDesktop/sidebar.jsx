import {
    LayoutDashboard,
    FileText,
    User,
    Settings,
    LogOut,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './sidebar.css';

export default function Sidebar() {
    const location = useLocation();

    const menu = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={22} /> },
        { name: 'Faktur', path: '/invoice', icon: <FileText size={22} /> },
        { name: 'User', path: '/user', icon: <User size={22} /> },
    ];

    return (
        <div className="sidebar no-print">

            {/* PROFILE */}
            <div className="sidebar-top">
                <div className="profile">
                    <img
                        src="https://i.pravatar.cc/100"
                        alt="profile"
                        className="profile-img"
                    />
                    <div>
                        <div className="profile-name">Juliana Silva</div>
                        <div className="profile-username">@reallygreatsite</div>
                    </div>
                </div>
            </div>

            {/* MENU */}
            <div className="menu">
                {menu.map((item) => (
                    <Link
                        to={item.path}
                        key={item.name}
                        className={`menu-item ${location.pathname === item.path ? 'active' : ''
                            }`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </Link>
                ))}
            </div>

            {/* BOTTOM */}
            <div className="sidebar-bottom">
                <div className="bottom-item">
                    <Settings size={18} />
                    <span>Setting</span>
                </div>
                <div className="bottom-item">
                    <LogOut size={18} />
                    <span>Log Out</span>
                </div>
            </div>
        </div>
    );
}