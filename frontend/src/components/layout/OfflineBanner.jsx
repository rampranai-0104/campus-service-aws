import React from "react";
import { useBooking } from "../../context/BookingContext";

export const OfflineBanner = () => {
  const { isOnline, syncStatus, loadData } = useBooking();

  if (isOnline && syncStatus !== "OFFLINE") return null;

  return (
    <div
      className="animate-fade-in"
      style={{
        borderRadius: "14px",
        backgroundColor: "var(--amber-50)",
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "var(--amber-900)",
        boxShadow: "var(--shadow-xs)",
        border: "1px solid #fcd34d",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "rgba(245, 158, 11, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--amber-700)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            wifi_off
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "14px", fontWeight: "700" }}>
            Offline: Network Connection Unavailable
          </span>
          <span style={{ fontSize: "12px", color: "var(--amber-800)" }}>
            Live AWS AppSync mutations and subscriptions are paused. Please check your internet connection.
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          if (navigator.onLine) {
            loadData?.();
          }
        }}
        style={{
          padding: "6px 14px",
          borderRadius: "8px",
          backgroundColor: "var(--amber-700)",
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "600",
          boxShadow: "var(--shadow-xs)",
          border: "none",
          cursor: "pointer",
        }}
      >
        Retry Connection
      </button>
    </div>
  );
};

export default OfflineBanner;
