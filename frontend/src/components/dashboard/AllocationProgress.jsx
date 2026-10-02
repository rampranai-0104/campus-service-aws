import React from "react";
import { useBooking } from "../../context/BookingContext";

export const AllocationProgress = () => {
  const { rooms } = useBooking();

  const total = rooms.length || 128;
  const availableCount = rooms.filter((r) => r.status === "AVAILABLE").length;
  const maintCount = rooms.filter((r) => r.status === "MAINTENANCE").length;
  const occupiedCount = total - availableCount - maintCount;

  const availPct = Math.round((availableCount / total) * 100);
  const occupiedPct = Math.round((occupiedCount / total) * 100);
  const maintPct = Math.round((maintCount / total) * 100);

  return (
    <div
      style={{
        borderRadius: "16px",
        backgroundColor: "var(--surface-container-lowest)",
        padding: "22px",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid #f1f5f9",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--on-surface)", margin: 0 }}>
          Campus Room Allocation
        </h3>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--on-surface-variant)" }}>
          {total} Total
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Available Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "var(--on-surface)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--emerald-500)" }} />
              Available Spaces
            </span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--on-surface-variant)" }}>
              {availableCount} rooms ({availPct}%)
            </span>
          </div>
          <div style={{ width: "100%", height: "8px", borderRadius: "9999px", backgroundColor: "var(--surface-container-low)", overflow: "hidden" }}>
            <div style={{ width: `${availPct}%`, height: "100%", backgroundColor: "var(--emerald-500)", borderRadius: "9999px", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Occupied Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "var(--on-surface)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--primary-container)" }} />
              Occupied / In-Session
            </span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--on-surface-variant)" }}>
              {occupiedCount} rooms ({occupiedPct}%)
            </span>
          </div>
          <div style={{ width: "100%", height: "8px", borderRadius: "9999px", backgroundColor: "var(--surface-container-low)", overflow: "hidden" }}>
            <div style={{ width: `${occupiedPct}%`, height: "100%", backgroundColor: "var(--primary-container)", borderRadius: "9999px", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Maintenance Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "var(--on-surface)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--amber-500)" }} />
              Maintenance / Sanitization
            </span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--on-surface-variant)" }}>
              {maintCount} rooms ({maintPct}%)
            </span>
          </div>
          <div style={{ width: "100%", height: "8px", borderRadius: "9999px", backgroundColor: "var(--surface-container-low)", overflow: "hidden" }}>
            <div style={{ width: `${maintPct}%`, height: "100%", backgroundColor: "var(--amber-500)", borderRadius: "9999px", transition: "width 0.4s ease" }} />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "var(--on-surface-variant)",
          paddingTop: "6px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <span>
          Campus IoT Gateway: <strong style={{ color: "#059669" }}>Nominal</strong>
        </span>
        <span style={{ color: "var(--primary-container)", cursor: "pointer", fontWeight: "600" }}>
          Sensor Diagnostics →
        </span>
      </div>
    </div>
  );
};

export default AllocationProgress;
