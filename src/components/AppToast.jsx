import toast from "react-hot-toast";
import logo from "../assets/images/logo.png";

const AppToast = ({ title, message }) => (
  <div className="flex items-start gap-3 w-72 sm:w-80">
    <div className="relative shrink-0">
      <img src={logo} alt="Fitness Tracker" className="w-10 h-10 rounded-full object-contain" />
      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#1a1a1a]"></span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm text-white">Fitness Tracker</span>
        <span className="text-[10px] text-gray-500 shrink-0">now</span>
      </div>
      <p className="text-xs text-red-400 font-medium truncate">{title}</p>
      <p className="text-xs text-gray-300 mt-0.5 break-words">{message}</p>
    </div>
  </div>
);

export const notifySuccess = (title, message) =>
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-slide-in" : "opacity-0"
        } transition transform translate-y-0`}
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          boxShadow: "0 15px 40px rgba(0,0,0,0.7)",
          borderRadius: "12px",
          padding: "12px 16px",
        }}
        onClick={() => toast.dismiss(t.id)}
      >
        <AppToast title={title} message={message} />
      </div>
    ),
    { duration: 4500, position: "top-right" }
  );

export default AppToast;
