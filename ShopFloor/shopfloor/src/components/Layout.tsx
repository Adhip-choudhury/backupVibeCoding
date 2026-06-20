import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Cpu, Users, ClipboardList, Clock, Bell, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/machines', label: 'Machines', icon: Cpu },
  { to: '/operators', label: 'Operators', icon: Users },
  { to: '/planning', label: 'Planning', icon: ClipboardList },
  { to: '/shifts', label: 'Shifts', icon: Clock },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Layout({ children, hideSidebar }: { children: React.ReactNode; hideSidebar?: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>ShopFloor</h2>
          <span className="sidebar-subtitle">Planning System</span>
        </div>
        <ul className="nav-list">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.to === '/'}>
                <span className="nav-icon"><item.icon size={18} /></span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-username">{user?.username}</span>
            <button className="btn-logout" onClick={handleLogout} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
