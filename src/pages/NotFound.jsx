import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";
import Icon from "../components/Icon";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="max-w-lg w-full text-center relative z-10">
        <Link to="/welcome" className="inline-block mb-8">
          <img
            src={logo}
            alt="Fitness Tracker Logo"
            className="h-16 mx-auto object-contain drop-shadow-[0_0_15px_rgba(229,57,53,0.3)]"
          />
        </Link>

        <div className="relative mb-6">
          <span className="text-8xl sm:text-9xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 select-none block">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Page Not Found
            </span>
          </div>
        </div>

        <p className="text-gray-400 text-sm sm:text-base max-w-sm mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-[0_0_25px_rgba(229,57,53,0.4)] transition"
          >
            <Icon name="dashboard" className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            to="/welcome"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#1c1c1c] hover:bg-[#252525] text-gray-200 border border-white/10 transition"
          >
            Welcome Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
