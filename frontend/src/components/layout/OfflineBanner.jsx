import React from "react";
import { useBooking } from "../../context/BookingContext";

export const OfflineBanner = () => {
  const { isOfflineSim, toggleOfflineSim, offlineQueue } = useBooking();

  if (!isOfflineSim) return null;

  return (
    <div
      className="animate-fade-in"
      style={{
        borderRadius: "14px",
        backgroundColor: "var(--secondary-container)",
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "var(--on-secondary-fixed)",
        boxShadow: "var(--shadow-xs)",
        border: "1px solid #cbd5e1",
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
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary-container)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            cloud_off
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "14px", fontWeight: "700" }}>
            Amplify DataStore: Offline Simulation Mode Active
          </span>
          <span style={{ fontSize: "12px", color: "var(--on-secondary-container)" }}>
            All mutations cached locally in IndexedDB. Instant optimistic UI commits ready to synchronize upon reconnect.
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "9999px",
            backgroundColor: "var(--surface-container-lowest)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: "700",
            color: "var(--primary-container)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          Queue: {offlineQueue.length} pending write{offlineQueue.length === 1 ? "" : "s"}
        </span>
        <button
          onClick={toggleOfflineSim}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            backgroundColor: "var(--primary-container)",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "600",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          Restore Online Sync
        </button>
      </div>
    </div>
  );
};

export default OfflineBanner;
