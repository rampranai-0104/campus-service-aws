import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

export const LoginPage = ({ onNavigate }) => {
  const { login, availableUsers, switchUser } = useAuth();
  const { showToast } = useNotifications();

  const [email, setEmail] = useState("sarah.chen@university.edu");
  const [password, setPassword] = useState("••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`, "success");
        onNavigate("dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (user) => {
    switchUser(user);
    showToast(`Logged in as ${user.name} (${user.roleLabel})`, "success");
    onNavigate("dashboard");
  };

  return (
    <div
      style={{
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "var(--surface-container-lowest)",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "var(--shadow-xl)",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Branding */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "var(--primary-container)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px -4px rgba(29, 78, 216, 0.3)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <path d="M12 36V18L24 10L36 18V36" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 36V24H27V36" fill="white"/>
              <circle cx="24" cy="18" r="3" fill="#93C5FD"/>
              <circle cx="36" cy="14" r="3" fill="#10B981"/>
            </svg>
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--on-surface)", margin: "4px 0 0" }}>
            CampusRoom Access
          </h2>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0 }}>
            Sign in with your university AWS Cognito account
          </p>
        </div>

        {/* Demo Personas One-Click Quick Fill */}
        <div
          style={{
            padding: "12px",
            borderRadius: "12px",
            backgroundColor: "var(--surface-container-low)",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
            Quick 1-Click Persona Login:
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {availableUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                  textAlign: "left",
                }}
                className="hover:bg-slate-50"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img
                    src={u.avatarUrl}
                    alt={u.name}
                    style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <strong>{u.name}</strong>
                </div>
                <span style={{ fontSize: "11px", color: "var(--primary-container)", fontWeight: "600" }}>
                  {u.role} →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
              University Email
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@university.edu"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
              Password
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", height: "42px", marginTop: "6px" }}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              login
            </span>
            <span>{isLoading ? "Authenticating..." : "Sign In with Cognito"}</span>
          </button>
        </form>

        {/* Footer links */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--on-surface-variant)" }}>
          <button
            onClick={() => onNavigate("register")}
            style={{ color: "var(--primary-container)", fontWeight: "600" }}
          >
            Create an Account
          </button>
          <button
            onClick={() => onNavigate("dashboard")}
            style={{ color: "var(--outline)" }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
