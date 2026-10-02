import React from "react";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { awsConfig } from "../aws/amplifyConfig";

export const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { isOfflineSim, toggleOfflineSim, resetAllData } = useBooking();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto" }} className="settings-page animate-fade-in">
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
          <span>System</span>
          <span style={{ color: "var(--outline)" }}>/</span>
          <span style={{ color: "var(--on-surface-variant)" }}>Configuration &amp; Cloud</span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
          Settings &amp; AWS Infrastructure
        </h1>
        <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
          Manage your campus profile credentials and inspect the connected AWS Amplify backend architecture.
        </p>
      </div>

      {/* User Profile Card */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          padding: "24px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0 }}>
          User Profile &amp; Campus Credentials
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img
            src={currentUser?.avatarUrl}
            alt={currentUser?.name}
            style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--on-surface)" }}>
              {currentUser?.name}
            </span>
            <span style={{ fontSize: "13px", color: "var(--primary-container)", fontWeight: "600" }}>
              {currentUser?.roleLabel} • {currentUser?.department}
            </span>
            <span style={{ fontSize: "12px", color: "var(--outline)", fontFamily: "var(--font-mono)" }}>
              Campus ID: {currentUser?.studentOrStaffId || "STAFF-88421"}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Email Address</label>
            <input type="text" className="form-input" value={currentUser?.email || ""} readOnly />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Access Role</label>
            <input type="text" className="form-input" value={currentUser?.role || "STAFF"} readOnly />
          </div>
        </div>
      </div>

      {/* AWS Amplify Backend Inspector */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          padding: "24px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "22px" }}>
              cloud
            </span>
            <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0 }}>
              AWS Amplify Hosted Backend Architecture
            </h3>
          </div>
          <span style={{ padding: "3px 10px", borderRadius: "9999px", backgroundColor: "#ecfdf5", color: "#059669", fontSize: "11px", fontWeight: "700" }}>
            Ready for Mobile App (Phase 2)
          </span>
        </div>

        <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0 }}>
          This full-stack web application is wired to AWS cloud services via Amazon Cognito, AWS AppSync GraphQL, DynamoDB tables, and Amazon S3. The data model is explicitly designed with offline sync readiness for the upcoming React Native mobile application.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "AWS Region", value: awsConfig.aws_project_region, icon: "public" },
            { label: "Amazon Cognito User Pool", value: awsConfig.aws_user_pools_id, icon: "lock" },
            { label: "AppSync GraphQL Endpoint", value: awsConfig.aws_appsync_graphqlEndpoint, icon: "hub" },
            { label: "Amazon DynamoDB Sync", value: "Table: Room-Table, Booking-Table (Conflict Detection Enabled)", icon: "database" },
            { label: "Amazon S3 Storage Bucket", value: awsConfig.aws_user_files_s3_bucket, icon: "photo_library" },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "var(--surface-container-low)",
                fontSize: "12px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "var(--on-surface)" }}>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "16px" }}>{item.icon}</span>
                {item.label}:
              </span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--on-surface-variant)", wordBreak: "break-all" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Mode & Cache Reset */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          padding: "24px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0 }}>
          Testing &amp; Simulation Controls
        </h3>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--on-surface)" }}>
              DataStore Offline Simulation
            </div>
            <div style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
              Simulates losing internet connection and queueing mutations into local IndexedDB storage.
            </div>
          </div>

          <button
            onClick={toggleOfflineSim}
            className={isOfflineSim ? "btn-primary" : "btn-secondary"}
            style={{ height: "36px" }}
          >
            {isOfflineSim ? "Offline Sim Active (Click to Reconnect)" : "Enable Offline Simulation"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--on-surface)" }}>
              Reset Demo Seed Data
            </div>
            <div style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
              Purges local storage and restores default test rooms, bookings, and notifications.
            </div>
          </div>

          <button
            onClick={resetAllData}
            className="btn-destructive"
            style={{ height: "36px" }}
          >
            Reset All Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
