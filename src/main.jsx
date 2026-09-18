import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-right"
          gutter={12}
          containerStyle={{ top: 20 }}
          toastOptions={{
            duration: 4500,
            style: {
              background: "#1a1a1a",
              color: "#fafafa",
              border: "1px solid #2a2a2a",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#e53935", secondary: "#ffffff" },
            },
            error: {
              iconTheme: { primary: "#e53935", secondary: "#ffffff" },
            },
          }}
        />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);