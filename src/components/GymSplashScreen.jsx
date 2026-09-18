import { useState, useEffect } from "react";
import gymSplashImg from "../assets/images/gym-splash.jpg";
import logo from "../assets/images/logo.png";

const quotes = [
  "Consistency is the key to progress.",
  "Every workout brings you closer to your goals.",
  "Small daily habits lead to big results.",
  "Track your progress, celebrate your wins.",
  "Eat well, train hard, feel great.",
];

const GymSplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 3;
      });
    }, 40);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        handleEnter();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden transition-all duration-500 ${
        isExiting ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Gym Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={gymSplashImg}
          alt="Gym Background"
          className="w-full h-full object-cover filter grayscale contrast-125 brightness-50 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,57,53,0.15)_0%,transparent_70%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full mx-auto px-6 text-center flex flex-col items-center">
        <div className="mb-5">
          <img
            src={logo}
            alt="Fitness Tracker Logo"
            className="h-20 sm:h-24 object-contain drop-shadow-[0_0_35px_rgba(229,57,53,0.5)]"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-tech text-xs uppercase tracking-widest text-white font-bold">
            DAILY FITNESS & WORKOUT TRACKER
          </span>
        </div>

        <h1 className="font-funky text-4xl sm:text-6xl md:text-7xl font-extrabold text-white uppercase tracking-tight leading-none mb-3 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          BUILD YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-600">FITNESS</span>
        </h1>

        <div className="h-10 flex items-center justify-center mb-8">
          <p className="font-tech text-sm sm:text-base font-semibold text-gray-200 tracking-wide transition-all duration-300">
            "{quotes[quoteIndex]}"
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md bg-[#161616] h-2.5 rounded-full overflow-hidden border border-white/10 p-0.5 mb-6 shadow-[0_0_25px_rgba(0,0,0,0.8)]">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-white to-red-500 rounded-full transition-all duration-75 ease-out shadow-[0_0_15px_rgba(229,57,53,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full max-w-md text-xs font-tech text-gray-400">
          <span className="text-white font-bold">{progress}% READY</span>
          <button
            onClick={handleEnter}
            className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-gray-200 text-black font-extrabold uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            GET STARTED
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GymSplashScreen;
