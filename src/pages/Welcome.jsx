import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import logo from "../assets/images/logo.png";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";

const Welcome = () => {
  const { user } = useAuth();

  return (
    <Sidebar>
      <main className="min-h-[calc(100vh-3.5rem)] md:min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[#080808]">
        {/* Ambient Glow */}
        <div className="absolute w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none -top-40 -right-40" />
        <div className="absolute w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none -bottom-40 -left-40" />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          <img
            src={logo}
            alt="Fitness Tracker Logo"
            className="w-48 sm:w-64 h-auto object-contain mb-6 drop-shadow-[0_0_35px_rgba(229,57,53,0.4)]"
          />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-tech text-xs uppercase tracking-widest text-gray-300 font-bold">
              Account Active
            </span>
          </div>

          <h1 className="font-funky text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">{user?.name || "Friend"}</span>!
          </h1>

          <p className="font-tech text-sm sm:text-base text-gray-300 max-w-md mb-8">
            Track your daily workouts, log your meals, and watch your fitness progress grow.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white text-black font-funky text-xs font-extrabold uppercase tracking-wider hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <Icon name="dashboard" className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/workouts"
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-funky text-xs font-extrabold uppercase tracking-wider hover:from-red-500 hover:to-red-600 transition shadow-[0_0_20px_rgba(229,57,53,0.4)]"
            >
              <Icon name="workouts" className="w-4 h-4" />
              Workouts
            </Link>
            <Link
              to="/nutrition"
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#171717] border border-white/10 text-white font-funky text-xs font-extrabold uppercase tracking-wider hover:bg-[#222222] transition"
            >
              <Icon name="nutrition" className="w-4 h-4" />
              Meals
            </Link>
          </div>
        </div>
      </main>
    </Sidebar>
  );
};

export default Welcome;