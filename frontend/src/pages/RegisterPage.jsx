import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const { showToast } = useNotifications();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [idNumber, setIdNumber] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        showToast(`Registration complete! Welcome, ${res.user.name}.`, "success");
        onNavigate("dashboard");
      }
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
            Register Campus Account
          </h2>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0 }}>
            Create your university room reservation identity
          </p>
        </div>

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
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="STUDENT">Student</option>
                <option value="STAFF">Faculty / Staff</option>
                <option value="ADMIN">Facility Administrator</option>
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
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Password</label>
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
            {isLoading ? "Registering..." : "Create Account"}
          </button>
        </form>

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
