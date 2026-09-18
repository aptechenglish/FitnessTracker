import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUnreadCount } from "../services/notifications";
import logo from "../assets/images/logo.png";
import Icon from "./Icon";

const Sidebar = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await getUnreadCount();
        setUnread(res.data.unread);
      } catch (error) {}
    };
    loadUnread();
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { path: "/workouts", label: "Workouts", icon: "workouts" },
    { path: "/nutrition", label: "Nutrition", icon: "nutrition" },
    { path: "/progress", label: "Progress", icon: "progress" },
    { path: "/analytics", label: "Analytics", icon: "analytics" },
    { path: "/goals", label: "Goals", icon: "goals" },
    { path: "/reports", label: "Reports", icon: "reports" },
    { path: "/notifications", label: "Notifications", icon: "notifications", badge: unread },
    { path: "/reminders", label: "Reminders", icon: "reminders" },
    { path: "/profile", label: "Profile", icon: "profile" },
    { path: "/settings", label: "Settings", icon: "settings" },
    { path: "/support", label: "Support", icon: "support" },
  ];

  const navLink = (item) => {
    const active = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-tech text-xs uppercase tracking-wider font-bold transition-all duration-200 ${
          active
            ? "bg-red-600 text-white shadow-[0_4px_14px_rgba(229,57,53,0.35)] scale-[1.02]"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <Icon name={item.icon} className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
        {open && <span className="truncate flex-1">{item.label}</span>}
        {item.badge > 0 && (
          <span className={`text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 shrink-0 ${active ? "bg-white text-red-600" : "bg-red-600 text-white"}`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <aside
        className={`z-40 h-screen bg-white border-r border-slate-200 text-slate-800 flex flex-col transition-all duration-300 fixed left-0 top-0 overflow-y-auto no-scrollbar shadow-sm ${
          mobileOpen ? "w-72" : "hidden md:flex"
        } ${open ? "md:w-60" : "md:w-20"}`}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-3.5 border-b border-slate-100">
          <Link to="/welcome" className="flex items-center gap-2.5 min-w-0">
            <img src={logo} alt="Fitness Tracker Logo" className="h-14 object-contain shrink-0" />
            {open && (
              <span className="font-funky font-black leading-tight uppercase tracking-wider text-slate-900">
                <span className="block text-[11px]">Fitness</span>
                <span className="block text-[11px] text-red-600">Tracker</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="hidden md:flex items-center justify-center shrink-0 text-slate-400 hover:text-slate-800 transition p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <Icon name={open ? "expandLeft" : "expandRight"} className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar pt-3 px-2 space-y-1">
          {menuItems.map(navLink)}
        </nav>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-red-500/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            {open && (
              <div className="truncate flex-1">
                <p className="font-funky font-bold text-xs text-slate-900 truncate">
                  {user?.name || "Athlete"}
                </p>
                <p className="text-[11px] text-slate-500 truncate font-tech">
                  @{user?.username || "user"}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 py-2 rounded-xl text-xs font-bold transition font-tech uppercase tracking-wider"
          >
            <Icon name="logout" className="w-3.5 h-3.5" />
            {open && "Log Out"}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu overlay"
        ></div>
      )}

      <main className={`transition-all duration-300 min-w-0 relative ${open ? "md:ml-60" : "md:ml-20"} `}>
        <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition"
              aria-label="Open menu"
            >
              <Icon name="menu" className="w-6 h-6" />
            </button>
            <img src={logo} alt="Fitness Tracker Logo" className="h-9 object-contain" />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Sidebar;