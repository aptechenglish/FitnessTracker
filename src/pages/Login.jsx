import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import logo from "../assets/images/logo.png";
import gymSplashImg from "../assets/images/gym-splash.jpg";
import GymSplashScreen from "../components/GymSplashScreen";

const Login = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = location.pathname === "/register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState(initialMode);
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash on fresh visit, but don't show if user already seen in this session
    return !sessionStorage.getItem("splash_viewed");
  });

  // Forms
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  // Registration Multi-step: 1 = Personal Info, 2 = Weight & Height, 3 = Fitness & Lifestyle
  const [regStep, setRegStep] = useState(1);
  const [regForm, setRegForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dateOfBirth: "",
    weight: "",
    height: "",
    targetWeight: "",
    activityLevel: "moderate",
    fitnessGoal: "lose_weight",
    workoutFrequency: "4-5",
    dietaryPreference: "standard",
  });

  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.pathname === "/register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [location.pathname]);

  const handleSplashComplete = () => {
    sessionStorage.setItem("splash_viewed", "true");
    setShowSplash(false);
  };

  const handleLoginChange = (e) => {
    setLoginForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRegChange = (e) => {
    setRegForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validateStep1 = () => {
    if (!regForm.username.trim()) {
      toast.error("Please choose a username");
      return false;
    }
    if (!regForm.email.trim() || !regForm.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!regForm.password || regForm.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    if (regForm.confirmPassword && regForm.password !== regForm.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!regForm.gender) {
      toast.error("Please select your gender");
      return false;
    }
    if (!regForm.dateOfBirth) {
      toast.error("Please enter your date of birth");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const w = Number(regForm.weight);
    const h = Number(regForm.height);
    if (!w || w <= 20 || w >= 400) {
      toast.error("Please enter a valid current weight (20 - 400 kg)");
      return false;
    }
    if (!h || h <= 80 || h >= 260) {
      toast.error("Please enter a valid height (80 - 260 cm)");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (regStep === 1) {
      if (validateStep1()) setRegStep(2);
    } else if (regStep === 2) {
      if (validateStep2()) setRegStep(3);
    }
  };

  const handlePrevStep = () => {
    if (regStep > 1) setRegStep((s) => s - 1);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast.error("Please enter your username and password");
      return;
    }
    setLoading(true);
    try {
      await login({
        username: loginForm.username.trim(),
        password: loginForm.password,
      });
      toast.success("Welcome back! Logging you in...");
      setShowLoader(true);
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 800);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid username or password");
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

    setLoading(true);
    try {
      await register({
        username: regForm.username.trim(),
        name: regForm.name.trim() || regForm.username.trim(),
        email: regForm.email.trim(),
        password: regForm.password,
        gender: regForm.gender,
        dateOfBirth: regForm.dateOfBirth,
        weight: Number(regForm.weight),
        height: Number(regForm.height),
        targetWeight: regForm.targetWeight ? Number(regForm.targetWeight) : Number(regForm.weight),
        activityLevel: regForm.activityLevel,
        fitnessGoal: regForm.fitnessGoal,
        workoutFrequency: regForm.workoutFrequency,
        dietaryPreference: regForm.dietaryPreference,
      });
      toast.success("Account created successfully! Welcome to Fitness Tracker!");
      setShowLoader(true);
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 800);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Try a different username.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center relative overflow-hidden font-body selection:bg-red-500 selection:text-white">
      {/* Gym Splash Screen */}
      {showSplash && <GymSplashScreen onComplete={handleSplashComplete} />}

      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src={gymSplashImg}
          alt="Gym Background"
          className="w-full h-full object-cover filter grayscale contrast-125 brightness-20 opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/85 to-[#050505]/95" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto p-4 sm:p-6 my-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <img
            src={logo}
            alt="Fitness Tracker Logo"
            className="h-16 sm:h-20 mx-auto mb-3 object-contain drop-shadow-[0_0_25px_rgba(229,57,53,0.5)]"
          />
          <h1 className="font-funky text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            FITNESS <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">TRACKER</span>
          </h1>
          <p className="font-tech text-xs uppercase tracking-wider text-gray-400 mt-1">
            Track Workouts • Log Meals • Reach Goals
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-white/10 bg-[#0e0e0e]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />

          {/* High-Contrast Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#171717] border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`py-2.5 rounded-xl font-funky text-xs uppercase tracking-wider font-extrabold transition-all duration-200 ${
                activeTab === "login"
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-[1.02]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`py-2.5 rounded-xl font-funky text-xs uppercase tracking-wider font-extrabold transition-all duration-200 ${
                activeTab === "register"
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-[1.02]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* LOG IN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1.5">
                  Username or Email
                </label>
                <input
                  type="text"
                  name="username"
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  placeholder="Enter your username or email"
                  className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition font-body"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-tech text-xs uppercase tracking-wider text-gray-300 font-bold">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPwd ? "text" : "password"}
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition font-body"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPwd(!showLoginPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-tech font-bold uppercase transition"
                  >
                    {showLoginPwd ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-funky font-extrabold text-sm uppercase tracking-wider bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-500 text-white shadow-[0_0_25px_rgba(229,57,53,0.45)] hover:shadow-[0_0_35px_rgba(229,57,53,0.6)] transform active:scale-95 transition-all duration-200 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Log In"
                )}
              </button>
            </form>
          )}

          {/* SIGN UP FORM - CATEGORY WISE 3-STEP WIZARD */}
          {activeTab === "register" && (
            <div>
              {/* Category Stepper Bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-[11px] font-tech font-bold uppercase tracking-wider mb-2">
                  <span className={regStep >= 1 ? "text-red-500 font-extrabold" : "text-gray-500"}>
                    1. Personal Info
                  </span>
                  <span className={regStep >= 2 ? "text-red-500 font-extrabold" : "text-gray-500"}>
                    2. Body Metrics
                  </span>
                  <span className={regStep >= 3 ? "text-red-500 font-extrabold" : "text-gray-500"}>
                    3. Fitness & Goals
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-red-600 to-red-500 h-full transition-all duration-300"
                    style={{ width: `${(regStep / 3) * 100}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* CATEGORY 1: PERSONAL INFO */}
                {regStep === 1 && (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-1">
                      <p className="font-tech text-xs text-red-400 font-bold uppercase tracking-wider">
                        Category 1 of 3: Personal Information
                      </p>
                      <p className="text-[11px] text-gray-400 font-body">
                        Set up your login credentials and basic identity.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={regForm.name}
                          onChange={handleRegChange}
                          placeholder="e.g. John Doe"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition font-body"
                        />
                      </div>
                      <div>
                        <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                          Username *
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={regForm.username}
                          onChange={handleRegChange}
                          placeholder="e.g. johndoe"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition font-body"
                          autoComplete="username"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={regForm.email}
                        onChange={handleRegChange}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition font-body"
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={regForm.gender}
                          onChange={handleRegChange}
                          required
                          className="w-full px-3 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 transition font-body"
                        >
                          <option value="" disabled>Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={regForm.dateOfBirth}
                          onChange={handleRegChange}
                          required
                          max={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 transition font-body [color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                        Password (Min 6 characters) *
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPwd ? "text" : "password"}
                          name="password"
                          value={regForm.password}
                          onChange={handleRegChange}
                          placeholder="Enter password"
                          className="w-full px-3.5 py-2.5 pr-12 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition font-body"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPwd(!showRegPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-tech font-bold uppercase transition"
                        >
                          {showRegPwd ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type={showRegPwd ? "text" : "password"}
                        name="confirmPassword"
                        value={regForm.confirmPassword}
                        onChange={handleRegChange}
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition font-body"
                        autoComplete="new-password"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full py-3.5 px-4 rounded-xl font-funky font-extrabold text-sm uppercase tracking-wider bg-white hover:bg-gray-200 text-black shadow-[0_0_20px_rgba(255,255,255,0.25)] transform active:scale-95 transition-all duration-200 mt-2 flex items-center justify-center gap-2"
                    >
                      Next: Weight & Height Info →
                    </button>
                  </div>
                )}

                {/* CATEGORY 2: WEIGHT & HEIGHT INFO */}
                {regStep === 2 && (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-1">
                      <p className="font-tech text-xs text-red-400 font-bold uppercase tracking-wider">
                        Category 2 of 3: Body Metrics
                      </p>
                      <p className="text-[11px] text-gray-400 font-body">
                        Provide your current and target physical parameters for calibration.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                          Current Weight (kg) *
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={regForm.weight}
                          onChange={handleRegChange}
                          placeholder="e.g. 78"
                          min="20"
                          max="400"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition font-body"
                        />
                      </div>

                      <div>
                        <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                          Height (cm) *
                        </label>
                        <input
                          type="number"
                          name="height"
                          value={regForm.height}
                          onChange={handleRegChange}
                          placeholder="e.g. 178"
                          min="80"
                          max="260"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition font-body"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                        Target Goal Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="targetWeight"
                        value={regForm.targetWeight}
                        onChange={handleRegChange}
                        placeholder="e.g. 72"
                        min="20"
                        max="400"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition font-body"
                      />
                      <p className="text-[10px] font-tech text-gray-400 mt-1">
                        Optional: Leave empty to maintain current weight.
                      </p>
                    </div>

                    {/* Live BMI & Goal Delta Preview Card */}
                    {regForm.weight && regForm.height && (
                      <div className="p-3 rounded-xl bg-[#181818] border border-white/10 text-xs font-tech flex items-center justify-between">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase">Initial BMI Estimate</span>
                          <span className="font-bold text-white text-sm">
                            {(Number(regForm.weight) / ((Number(regForm.height) / 100) ** 2)).toFixed(1)} kg/m²
                          </span>
                        </div>
                        {regForm.targetWeight && (
                          <div className="text-right">
                            <span className="text-gray-400 block text-[10px] uppercase">Weight Delta</span>
                            <span className={`font-bold text-xs ${
                              Number(regForm.targetWeight) < Number(regForm.weight)
                                ? "text-emerald-400"
                                : Number(regForm.targetWeight) > Number(regForm.weight)
                                ? "text-blue-400"
                                : "text-gray-300"
                            }`}>
                              {Number(regForm.targetWeight) < Number(regForm.weight)
                                ? `Lose ${(Number(regForm.weight) - Number(regForm.targetWeight)).toFixed(1)} kg`
                                : Number(regForm.targetWeight) > Number(regForm.weight)
                                ? `Gain ${(Number(regForm.targetWeight) - Number(regForm.weight)).toFixed(1)} kg`
                                : "Maintain Weight"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="py-3 px-4 rounded-xl font-funky font-bold text-xs uppercase tracking-wider bg-[#222] hover:bg-[#2c2c2c] text-white border border-white/10 transition"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="py-3 px-4 rounded-xl font-funky font-extrabold text-xs uppercase tracking-wider bg-white hover:bg-gray-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.25)] transition"
                      >
                        Next: Fitness Info →
                      </button>
                    </div>
                  </div>
                )}

                {/* CATEGORY 3: FITNESS & LIFESTYLE INFO */}
                {regStep === 3 && (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-1">
                      <p className="font-tech text-xs text-red-400 font-bold uppercase tracking-wider">
                        Category 3 of 3: Fitness & Lifestyle Profile
                      </p>
                      <p className="text-[11px] text-gray-400 font-body">
                        Customize workout recommendations and nutrition calculations.
                      </p>
                    </div>

                    <div>
                      <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                        Primary Fitness Goal
                      </label>
                      <select
                        name="fitnessGoal"
                        value={regForm.fitnessGoal}
                        onChange={handleRegChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 transition font-body"
                      >
                        <option value="lose_weight">🔥 Weight Loss & Fat Burning</option>
                        <option value="build_muscle">💪 Muscle Growth & Hypertrophy</option>
                        <option value="maintain">⚖️ General Health & Tone</option>
                        <option value="endurance">🏃 Cardio & Stamina</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                          Activity Level
                        </label>
                        <select
                          name="activityLevel"
                          value={regForm.activityLevel}
                          onChange={handleRegChange}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white text-xs focus:outline-none focus:border-red-500 transition font-body"
                        >
                          <option value="sedentary">Sedentary (Office/Desk)</option>
                          <option value="light">Lightly Active (1-2 days)</option>
                          <option value="moderate">Moderately Active (3-5 days)</option>
                          <option value="very_active">Very Active (6-7 days)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                          Weekly Training
                        </label>
                        <select
                          name="workoutFrequency"
                          value={regForm.workoutFrequency}
                          onChange={handleRegChange}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white text-xs focus:outline-none focus:border-red-500 transition font-body"
                        >
                          <option value="2-3">2 - 3 Days / Week</option>
                          <option value="4-5">4 - 5 Days / Week</option>
                          <option value="6+">6+ Days / Week</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-tech text-xs uppercase tracking-wider text-gray-300 font-bold mb-1">
                        Dietary Preference
                      </label>
                      <select
                        name="dietaryPreference"
                        value={regForm.dietaryPreference}
                        onChange={handleRegChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 transition font-body"
                      >
                        <option value="standard">Standard / Balanced</option>
                        <option value="high_protein">High Protein (Athletic)</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan / Plant-Based</option>
                        <option value="keto">Keto / Low-Carb</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="py-3 px-4 rounded-xl font-funky font-bold text-xs uppercase tracking-wider bg-[#222] hover:bg-[#2c2c2c] text-white border border-white/10 transition"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="py-3.5 px-4 rounded-xl font-funky font-extrabold text-xs uppercase tracking-wider bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-500 text-white shadow-[0_0_25px_rgba(229,57,53,0.5)] transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Create Athlete Account ✓"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="font-tech text-xs text-gray-500">
            Simple • Fast • Free Fitness Tracking
          </p>
        </div>
      </div>

      {/* Loading Overlay */}
      {showLoader && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6 p-4">
          <img
            src={logo}
            alt="Fitness Tracker Logo"
            className="h-20 animate-bounce drop-shadow-[0_0_35px_rgba(229,57,53,0.8)]"
          />
          <div className="w-48 h-1 bg-[#1c1c1c] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 via-white to-red-600 animate-pulse rounded-full" />
          </div>
          <p className="font-tech text-xs uppercase tracking-widest text-gray-300 font-bold">
            Loading your dashboard...
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;