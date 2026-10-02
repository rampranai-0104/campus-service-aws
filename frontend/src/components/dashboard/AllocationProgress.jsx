import React, { useMemo } from "react";
import { useBooking } from "../../context/BookingContext";
import { parseTimeToMinutes } from "../../services/analyticsService";

export const AllocationProgress = () => {
  const { rooms = [], bookings = [], syncStatus } = useBooking();

  const total = rooms.length;
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find confirmed bookings currently in session right now
  const activeNowBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.status !== "CONFIRMED") return false;
      if (b.date !== todayStr) return false;
      const startMin = parseTimeToMinutes(b.startTime);
      const endMin = parseTimeToMinutes(b.endTime);
      return startMin <= currentMinutes && endMin > currentMinutes;
    });
  }, [bookings, todayStr, currentMinutes]);

  const occupiedRoomIds = useMemo(
    () => new Set(activeNowBookings.map((b) => b.roomId)),
    [activeNowBookings]
  );

  const maintCount = useMemo(
    () => rooms.filter((r) => r.status === "MAINTENANCE").length,
    [rooms]
  );

  const occupiedCount = useMemo(
    () => rooms.filter((r) => r.status !== "MAINTENANCE" && occupiedRoomIds.has(r.id)).length,
    [rooms, occupiedRoomIds]
  );

  const availableCount = useMemo(
    () => Math.max(0, total - occupiedCount - maintCount),
    [total, occupiedCount, maintCount]
  );

  const availPct = total > 0 ? Math.round((availableCount / total) * 100) : 0;
  const occupiedPct = total > 0 ? Math.round((occupiedCount / total) * 100) : 0;
  const maintPct = total > 0 ? Math.round((maintCount / total) * 100) : 0;

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
          Campus Space Allocation (Live)
        </h3>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--on-surface-variant)" }}>
          {total} Total Rooms
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Available Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "var(--on-surface)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--emerald-500)" }} />
              Available for Reservation
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
              Occupied / In-Session Now
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
              Under Maintenance
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
          AppSync Telemetry: <strong style={{ color: "#059669" }}>{syncStatus}</strong>
        </span>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--outline)" }}>
          {activeNowBookings.length} session{activeNowBookings.length === 1 ? "" : "s"} active right now
        </span>
      </div>
    </div>
  );
};

export default AllocationProgress;
