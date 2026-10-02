import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

export const RegisterPage = ({ onNavigate }) => {
  const { register, verifyEmail, resendVerificationCode } = useAuth();
  const { showToast } = useNotifications();

  // Registration form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [idNumber, setIdNumber] = useState("");
  const [role, setRole] = useState("STUDENT"); // Strictly STUDENT or STAFF/FACULTY
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Verification step state
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await register({
        name,
        email,
        department,
        idNumber,
        role,
        password,
      });

      if (res.success) {
        if (res.isComplete) {
          showToast(`Registration complete! Welcome, ${name}.`, "success");
          onNavigate("login");
        } else {
          // Cognito requires email verification code
          showToast("Verification code sent to your email.", "info");
          setVerificationStep(true);
        }
      } else {
        setErrorMessage(res.error || "Failed to create account.");
      }
    } catch (err) {
      setErrorMessage(err.message || "An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsVerifying(true);

    try {
      const res = await verifyEmail(email, verificationCode);
      if (res.success) {
        showToast("Email verified successfully! You can now sign in.", "success");
        onNavigate("login");
      } else {
        setErrorMessage(res.error || "Invalid verification code.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to verify code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown) return;
    setErrorMessage("");
    const res = await resendVerificationCode(email);
    if (res.success) {
      showToast("A new verification code has been dispatched to your email.", "info");
      setResendCooldown(true);
      setTimeout(() => setResendCooldown(false), 30000);
    } else {
      setErrorMessage(res.error || "Failed to resend code.");
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
          maxWidth: "480px",
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--on-surface)", margin: 0 }}>
            {verificationStep ? "Verify University Email" : "Register Campus Account"}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0 }}>
            {verificationStep
              ? `Enter the 6-digit confirmation code dispatched to ${email}`
              : "Create your university room reservation identity (Cognito Secured)"}
          </p>
        </div>

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

        {verificationStep ? (
          /* Email Verification Step */
          <form onSubmit={handleVerifyCode} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Verification Code
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                style={{ textAlign: "center", letterSpacing: "0.2em", fontSize: "18px", fontWeight: "700" }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", height: "42px", marginTop: "6px" }}
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Confirm & Complete Registration"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown}
                style={{ color: resendCooldown ? "var(--outline)" : "var(--primary-container)", fontWeight: "600" }}
              >
                {resendCooldown ? "Wait 30s to resend" : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => setVerificationStep(false)}
                style={{ color: "var(--outline)" }}
              >
                ← Back to registration
              </button>
            </div>
          </form>
        ) : (
          /* Initial Registration Form */
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Jordan Hayes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>University Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="username@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                  Role (Self-Signup)
                </label>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="STUDENT">Student</option>
                  <option value="STAFF">Faculty / Researcher</option>
                  {/* NOTE: Admin role cannot be self-selected per security rule */}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Department</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Student / Staff ID Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. STU-20948"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Password (min 8 chars, 1 uppercase, 1 number, 1 symbol)
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", height: "42px", marginTop: "8px" }}
              disabled={isLoading}
            >
              {isLoading ? "Registering on AWS Cognito..." : "Create Account"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", fontSize: "12px", color: "var(--on-surface-variant)" }}>
          Already have an account?{" "}
          <button
            onClick={() => onNavigate("login")}
            style={{ color: "var(--primary-container)", fontWeight: "700" }}
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
