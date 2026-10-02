import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

export const LoginPage = ({ onNavigate }) => {
  const {
    login,
    confirmNewPassword,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    confirmPasswordReset,
  } = useAuth();
  const { showToast } = useNotifications();

  // Mode: "LOGIN" | "NEW_PASSWORD_REQUIRED" | "CONFIRM_EMAIL" | "FORGOT_PASSWORD" | "RESET_PASSWORD"
  const [authMode, setAuthMode] = useState("LOGIN");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await login(email, password);

      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`, "success");
        if (res.user.isAdmin) {
          onNavigate("admin");
        } else {
          onNavigate("dashboard");
        }
      } else if (res.requiresNewPassword) {
        setErrorMessage("");
        setNewPassword("");
        setConfirmPassword("");
        setAuthMode("NEW_PASSWORD_REQUIRED");
      } else if (res.requiresConfirmation) {
        setErrorMessage(res.error || "Email verification required.");
        setAuthMode("CONFIRM_EMAIL");
      } else {
        setErrorMessage(res.error || "Invalid university credentials.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to authenticate.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both password entries.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long (must contain uppercase, lowercase, numbers, and symbols).");
      return;
    }

    setIsLoading(true);

    try {
      const res = await confirmNewPassword(newPassword);

      if (res.success) {
        showToast(`Welcome, ${res.user.name}! Your new password has been set.`, "success");
        if (res.user.isAdmin) {
          onNavigate("admin");
        } else {
          onNavigate("dashboard");
        }
      } else if (res.requiresNewPassword) {
        setErrorMessage(res.error || "Password does not meet complexity requirements.");
      } else {
        setErrorMessage(res.error || "Failed to set new password.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to set new password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEmail = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await verifyEmail(email, verificationCode);
      if (res.success) {
        showToast("Email verified! Signing you in...", "success");
        const loginRes = await login(email, password);
        if (loginRes.success) {
          if (loginRes.user?.isAdmin) {
            onNavigate("admin");
          } else {
            onNavigate("dashboard");
          }
        } else {
          setAuthMode("LOGIN");
        }
      } else {
        setErrorMessage(res.error || "Invalid verification code.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to verify code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        showToast("Password reset code sent to your email.", "info");
        setAuthMode("RESET_PASSWORD");
      } else {
        setErrorMessage(res.error || "Failed to send reset code.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Error requesting reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await confirmPasswordReset(email, verificationCode, newPassword);
      if (res.success) {
        showToast("Password updated successfully! Please sign in.", "success");
        setPassword("");
        setAuthMode("LOGIN");
      } else {
        setErrorMessage(res.error || "Failed to reset password.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Error confirming reset password.");
    } finally {
      setIsLoading(false);
    }
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
          gap: "20px",
        }}
      >
        {/* Branding Header */}
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
              <path d="M12 36V18L24 10L36 18V36" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 36V24H27V36" fill="white" />
              <circle cx="24" cy="18" r="3" fill="#93C5FD" />
              <circle cx="36" cy="14" r="3" fill="#10B981" />
            </svg>
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--on-surface)", margin: "4px 0 0" }}>
            {authMode === "NEW_PASSWORD_REQUIRED" ? "Set Your New Password" : "CampusRoom Access"}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0, lineHeight: "1.4" }}>
            {authMode === "LOGIN" && "Sign in with your Amazon Cognito university credentials"}
            {authMode === "NEW_PASSWORD_REQUIRED" && (
              <>
                Your temporary password has been accepted.
                <br />
                For security, create a new password to continue.
              </>
            )}
            {authMode === "CONFIRM_EMAIL" && `Verify email code dispatched to ${email}`}
            {authMode === "FORGOT_PASSWORD" && "Enter your email to receive a password reset code"}
            {authMode === "RESET_PASSWORD" && "Enter verification code and choose your new password"}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              backgroundColor: "var(--error-container)",
              color: "var(--on-error-container)",
              fontSize: "12px",
              lineHeight: "1.4",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MODE 1: Standard Cognito Login Form */}
        {authMode === "LOGIN" && (
          <>
            <form onSubmit={handleSubmitLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setAuthMode("FORGOT_PASSWORD");
                    }}
                    style={{ fontSize: "11px", color: "var(--primary-container)", fontWeight: "600", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Forgot Password?
                  </button>
                </div>
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
                <span>{isLoading ? "Authenticating with Cognito..." : "Sign In with Cognito"}</span>
              </button>
            </form>
          </>
        )}

        {/* MODE 2: Set New Password (Cognito Temporary Password Challenge) */}
        {authMode === "NEW_PASSWORD_REQUIRED" && (
          <form onSubmit={handleSetNewPassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
                New Password
              </label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              <span>{isLoading ? "Setting New Password..." : "Set New Password"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMessage("");
                setAuthMode("LOGIN");
              }}
              style={{
                fontSize: "12px",
                color: "var(--outline)",
                textAlign: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                marginTop: "4px",
              }}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* MODE 3: Email Confirmation */}
        {authMode === "CONFIRM_EMAIL" && (
          <form onSubmit={handleConfirmEmail} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
                Verification Code
              </label>
              <input
                type="text"
                className="form-input"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                required
                style={{ textAlign: "center", letterSpacing: "0.2em", fontSize: "18px", fontWeight: "700" }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", height: "42px" }}
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <button
                type="button"
                onClick={async () => {
                  await resendVerificationCode(email);
                  showToast("Verification code resent.", "info");
                }}
                style={{ color: "var(--primary-container)", fontWeight: "600", background: "none", border: "none", cursor: "pointer" }}
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("LOGIN")}
                style={{ color: "var(--outline)", background: "none", border: "none", cursor: "pointer" }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* MODE 4: Forgot Password Request */}
        {authMode === "FORGOT_PASSWORD" && (
          <form onSubmit={handleRequestPasswordReset} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
                Your University Email
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

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", height: "42px" }}
              disabled={isLoading}
            >
              {isLoading ? "Sending Code..." : "Send Reset Code"}
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("LOGIN")}
              style={{ fontSize: "12px", color: "var(--outline)", textAlign: "center", background: "none", border: "none", cursor: "pointer" }}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* MODE 5: Confirm Password Reset */}
        {authMode === "RESET_PASSWORD" && (
          <form onSubmit={handleConfirmReset} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
                Verification Code
              </label>
              <input
                type="text"
                className="form-input"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
                New Password (min 8 chars, 1 uppercase, 1 symbol)
              </label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", height: "42px" }}
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Confirm New Password"}
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("LOGIN")}
              style={{ fontSize: "12px", color: "var(--outline)", textAlign: "center", background: "none", border: "none", cursor: "pointer" }}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* Bottom Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--on-surface-variant)" }}>
          <button
            onClick={() => onNavigate("register")}
            style={{ color: "var(--primary-container)", fontWeight: "600", background: "none", border: "none", cursor: "pointer" }}
          >
            Create an Account
          </button>
          <button
            onClick={() => onNavigate("dashboard")}
            style={{ color: "var(--outline)", background: "none", border: "none", cursor: "pointer" }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
