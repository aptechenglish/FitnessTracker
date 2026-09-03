import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import logo from "../assets/images/logo.png";

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [flipped, setFlipped] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [regForm, setRegForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);

  const handleLoginChange = (e) => {
    setLoginForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRegChange = (e) => {
    setRegForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const flip = () => setFlipped((f) => !f);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login({
        username: loginForm.username,
        password: loginForm.password,
      });
      toast.success("Login successful!");
      setShowLoader(true);
      setTimeout(() => {
        navigate("/welcome");
      }, 2600);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.username || !regForm.email || !regForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (regForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register({
        username: regForm.username,
        name: regForm.username,
        email: regForm.email,
        password: regForm.password,
      });
      toast.success("Account created! Please login with your new account.");
      setLoginForm((f) => ({ ...f, username: regForm.username }));
      setRegForm({ username: "", email: "", password: "" });
      flip();
      window.scrollTo(0, 0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neo-auth-scene">
      <div className="neo-disc">
        <div className={`neo-flip ${flipped ? "flipped" : ""}`}>
          {/* FRONT - LOGIN */}
          <div className="neo-face face-front">
            <div className="neo-face-inner">
              <img
                src={logo}
                alt="Fitness Tracker Logo"
                style={{ width: 212, height: "auto", objectFit: "contain", marginBottom: 12 }}
              />
              <h1 style={{ fontWeight: 800, fontSize: "1.6rem", color: "#fafafa", margin: 0 }}>
                Login
              </h1>
              <p style={{ color: "#8a8a8a", fontSize: "0.8rem", margin: "6px 0 18px" }}>
                Welcome back to your fitness space
              </p>

              <form onSubmit={handleLoginSubmit} style={{ width: "100%" }} className="neo-form">
                <div style={{ marginBottom: 14 }}>
                  <input
                    type="text"
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    placeholder="Enter username"
                    className="neo-input"
                    autoComplete="username"
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showLoginPwd ? "text" : "password"}
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      placeholder="Enter password"
                      className="neo-input"
                      autoComplete="current-password"
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPwd((v) => !v)}
                      aria-label="Toggle password visibility"
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        color: "#8a8a8a",
                        padding: 2,
                      }}
                    >
                      {showLoginPwd ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <button type="button" className="neo-toggle-btn" style={{ fontSize: "0.78rem" }}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="neo-btn" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p style={{ marginTop: 18, fontSize: "0.8rem", color: "#8a8a8a" }}>
                New here?{" "}
                <button type="button" className="neo-toggle-btn" onClick={flip}>
                  Register
                </button>
              </p>
            </div>
          </div>

          {/* BACK - REGISTER */}
          <div className="neo-face face-back">
            <div className="neo-face-inner">
              <img
                src={logo}
                alt="Fitness Tracker Logo"
                style={{ width: 212, height: "auto", objectFit: "contain", marginBottom: 12 }}
              />
              <h1 style={{ fontWeight: 800, fontSize: "1.6rem", color: "#fafafa", margin: 0 }}>
                Register
              </h1>
              <p style={{ color: "#8a8a8a", fontSize: "0.8rem", margin: "6px 0 18px" }}>
                Create your fitness account
              </p>

              <form onSubmit={handleRegisterSubmit} style={{ width: "100%" }}>
                <div style={{ marginBottom: 10 }}>
                  <input
                    type="text"
                    name="username"
                    value={regForm.username}
                    onChange={handleRegChange}
                    placeholder="Choose a username"
                    className="neo-input"
                    autoComplete="username"
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <input
                    type="email"
                    name="email"
                    value={regForm.email}
                    onChange={handleRegChange}
                    placeholder="Enter email"
                    className="neo-input"
                    autoComplete="email"
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showRegPwd ? "text" : "password"}
                      name="password"
                      value={regForm.password}
                      onChange={handleRegChange}
                      placeholder="Min 6 characters"
                      className="neo-input"
                      autoComplete="new-password"
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPwd((v) => !v)}
                      aria-label="Toggle password visibility"
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        color: "#8a8a8a",
                        padding: 2,
                      }}
                    >
                      {showRegPwd ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <button type="submit" className="neo-btn" disabled={loading}>
                    {loading ? "Creating..." : "Register"}
                  </button>
                </div>
              </form>

              <p style={{ marginTop: 12, fontSize: "0.8rem", color: "#8a8a8a" }}>
                Already have an account?{" "}
                <button type="button" className="neo-toggle-btn" onClick={flip}>
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showLoader && (
        <div className="auth-loader" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#090909", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
          <img
            src={logo}
            alt="Fitness Tracker Logo"
            className="auth-logo-pulse auth-logo-img"
          />
          <div className="auth-loader-line">
            <span></span>
          </div>
          <p style={{ color: "#8a8a8a", fontSize: "0.9rem", margin: 0 }}>Preparing your dashboard...</p>
        </div>
      )}
    </div>
  );
};

export default Login;