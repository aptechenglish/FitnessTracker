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
    { path: "/search", label: "Search", icon: "search" },
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
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
          active
            ? "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/40 shadow-[0_0_10px_rgba(229,57,53,0.25)]"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <Icon name={item.icon} className="w-5 h-5 shrink-0" />
        {open && <span className="truncate flex-1">{item.label}</span>}
        {item.badge > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 shrink-0">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <aside
        className={`z-40 h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 fixed left-0 top-0 overflow-y-auto no-scrollbar ${
          mobileOpen ? "w-72" : "hidden md:flex"
        } ${open ? "md:w-64" : "md:w-20"}`}
      >
        <div className="flex items-center justify-between px-4 h-20">
          <img src={logo} alt="Fitness Tracker Logo" className="h-16 object-contain" />
          <button
            onClick={() => setOpen(!open)}
            className="hidden md:flex text-2xl hover:text-indigo-400 transition"
            aria-label="Toggle menu"
          >
            <Icon name={open ? "expandLeft" : "expandRight"} className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar pt-2 px-2 space-y-0.5">
          {menuItems.map(navLink)}
        </nav>

        <div className="p-3">
          <div className="flex items-center gap-3 mb-2">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white/20 shadow-[0_0_10px_rgba(0,0,0,0.4)]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a] ring-1 ring-white/25 flex items-center justify-center text-sm font-bold text-white/90 shrink-0 shadow-[0_0_12px_rgba(229,57,53,0.25)]">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-xs font-medium transition"
          >
            <span className="w-4 h-4 shrink-0">
              <Icon name="logout" className="w-4 h-4" />
            </span>{" "}
            Logout
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu overlay"
        ></div>
      )}

      <main className={`transition-all duration-300 min-w-0 relative ${open ? "md:ml-64" : "md:ml-20"} `}>
        <div
          className="pointer-events-none fixed right-6 bottom-6 opacity-[0.05]"
          aria-hidden="true"
        >
          <img src={logo} alt="" className="w-48 h-48 object-contain" />
        </div>
        <div className="md:hidden sticky top-0 z-40 bg-gray-900 text-white px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-2xl hover:text-indigo-400 transition"
            aria-label="Open menu"
          >
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <img src={logo} alt="Fitness Tracker Logo" className="h-10 object-contain" />
        </div>
        {children}
      </main>
    </div>
  );
};

export default Sidebar;