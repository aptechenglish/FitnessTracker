import React from "react";
import logo from "../assets/images/logo.png";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center p-4">
          <div className="vip-card max-w-md w-full text-center p-8 rounded-2xl border border-red-500/20 bg-[#161616] shadow-[0_0_50px_rgba(229,57,53,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            <img
              src={logo}
              alt="Fitness Tracker Logo"
              className="h-16 mx-auto mb-6 object-contain"
            />
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 text-xl font-bold">
              !
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 text-sm mb-6">
              An unexpected error occurred while rendering the application.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#242424] hover:bg-[#303030] text-gray-200 border border-white/10 transition"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="vip-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-[0_0_20px_rgba(229,57,53,0.4)] transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
