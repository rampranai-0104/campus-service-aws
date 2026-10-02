import React, { useMemo } from "react";
import StatCard from "../components/common/StatCard";
import { useBooking } from "../context/BookingContext";
import {
  calculateTotalHoursBooked,
  getBookingStatusCounts,
  calculateSpaceEfficiency,
  calculateComplexUtilization,
  calculateHourlyOccupancy,
  calculatePeakOccupancy,
  getNoShowsMetrics,
} from "../services/analyticsService";

export const AnalyticsPage = () => {
  const { rooms = [], bookings = [] } = useBooking();

  // 1. Total Confirmed Booked Hours
  const totalHoursBooked = useMemo(() => calculateTotalHoursBooked(bookings), [bookings]);

  // 2-5. Booking Status Counts (Confirmed, Pending, Cancelled, Rejected)
  const statusCounts = useMemo(() => getBookingStatusCounts(bookings), [bookings]);

  // 6, 11. Overall Space Efficiency
  const spaceEfficiency = useMemo(() => calculateSpaceEfficiency(rooms, bookings), [rooms, bookings]);

  // 7. Complex / Building Utilization
  const buildingUtilization = useMemo(
    () => calculateComplexUtilization(rooms, bookings),
    [rooms, bookings]
  );

  // 8. Hourly Occupancy Distribution
  const hourlyDistribution = useMemo(
    () => calculateHourlyOccupancy(rooms, bookings),
    [rooms, bookings]
  );

  // 9. Peak Occupancy Period
  const peakData = useMemo(() => calculatePeakOccupancy(hourlyDistribution), [hourlyDistribution]);

  // 10. No-Show Telemetry (Schema check)
  const noShows = useMemo(() => getNoShowsMetrics(), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="analytics-page animate-fade-in">
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
          <span>Intelligence</span>
          <span style={{ color: "var(--outline)" }}>/</span>
          <span style={{ color: "var(--on-surface-variant)" }}>Space Telemetry &amp; Utilization</span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
          Campus Space Analytics &amp; Utilization
        </h1>
        <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
          Live space optimization telemetry derived directly from AWS AppSync and DynamoDB room reservations.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Overall Space Efficiency"
          value={spaceEfficiency.formatted}
          icon="insights"
          trend={`${totalHoursBooked} hrs / ${spaceEfficiency.totalCapacityHours}h weekly cap`}
          trendPositive={spaceEfficiency.pct > 0}
        />
        <StatCard
          title="Total Hours Booked (Week)"
          value={totalHoursBooked.toLocaleString()}
          unit="hrs"
          icon="timelapse"
          trend={`${statusCounts.confirmed} confirmed reservations`}
          trendPositive={true}
        />
        <StatCard
          title="Auto-Released No-Shows"
          value={noShows.value}
          unit={noShows.unit}
          icon="event_repeat"
          trend={noShows.trend}
          trendPositive={true}
        />
        <StatCard
          title="Peak Window Occupancy"
          value={`${peakData.peakRate}%`}
          icon="speed"
          trend={peakData.peakWindow}
          trendPositive={peakData.peakRate < 85}
        />
      </div>

      {/* Live Booking Telemetry Strip (Metrics 2, 3, 4, 5) */}
      <div
        style={{
          borderRadius: "14px",
          backgroundColor: "var(--surface-container-lowest)",
          padding: "14px 20px",
          border: "1px solid #f1f5f9",
          boxShadow: "var(--shadow-xs)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "13px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "var(--primary-container)" }}>
            tune
          </span>
          <span style={{ fontWeight: "700", color: "var(--on-surface)" }}>
            Live Booking Telemetry:
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            <span style={{ color: "var(--on-surface-variant)" }}>Confirmed:</span>
            <strong style={{ color: "var(--on-surface)" }}>{statusCounts.confirmed}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
            <span style={{ color: "var(--on-surface-variant)" }}>Pending:</span>
            <strong style={{ color: "var(--on-surface)" }}>{statusCounts.pending}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
            <span style={{ color: "var(--on-surface-variant)" }}>Cancelled:</span>
            <strong style={{ color: "var(--on-surface)" }}>{statusCounts.cancelled}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#64748b" }} />
            <span style={{ color: "var(--on-surface-variant)" }}>Rejected:</span>
            <strong style={{ color: "var(--on-surface)" }}>{statusCounts.rejected}</strong>
          </div>
          <div style={{ height: "16px", width: "1px", backgroundColor: "#e2e8f0" }} />
          <div style={{ color: "var(--outline)", fontSize: "12px" }}>
            Tracking {rooms.length} registered spaces ({rooms.filter((r) => r.status === "AVAILABLE").length} active)
          </div>
        </div>
      </div>

      {/* Utilization Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        {/* Building Utilization Progress */}
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
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0, color: "var(--on-surface)" }}>
              Complex Space Utilization
            </h3>
            <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: "2px 0 0" }}>
              Percentage of capacity reserved across buildings
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {buildingUtilization.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--outline)", fontSize: "13px" }}>
                No campus complexes found in live catalog.
              </div>
            ) : (
              buildingUtilization.map((b) => (
                <div key={b.name} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ fontWeight: "600", color: "var(--on-surface)" }}>
                      {b.name} <span style={{ fontSize: "11px", color: "var(--outline)", fontWeight: "500" }}>({b.rooms} spaces)</span>
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--primary-container)" }}>
                      {b.pct}% ({b.hours} hrs)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "8px", borderRadius: "9999px", backgroundColor: "var(--surface-container-low)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.max(b.pct, 0)}%`,
                        height: "100%",
                        backgroundColor: b.pct > 80 ? "var(--primary)" : "var(--primary-container)",
                        borderRadius: "9999px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hourly Demand Density */}
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
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0, color: "var(--on-surface)" }}>
              Hourly Occupancy Curve (Campus-Wide)
            </h3>
            <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: "2px 0 0" }}>
              Hourly reservation distribution across all {rooms.length} spaces
            </p>
          </div>

          {/* Bar Chart */}
          <div
            style={{
              height: "220px",
              display: "flex",
              alignItems: "flex-end",
              gap: "10px",
              paddingTop: "20px",
              paddingBottom: "10px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            {hourlyDistribution.map((slot) => {
              const isPeak = slot.rate > 0 && slot.rate === peakData.peakRate;
              return (
                <div
                  key={slot.hour}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                  title={`${slot.hour}: ${slot.rate}% Occupancy (${slot.occupiedRooms}/${slot.totalRooms} spaces)`}
                >
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: "700", color: isPeak ? "var(--primary)" : "var(--outline)" }}>
                    {slot.rate}%
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(slot.rate, 2)}%`,
                      borderRadius: "4px 4px 0 0",
                      backgroundColor: isPeak ? "var(--primary-container)" : slot.rate > 0 ? "var(--primary-fixed-dim)" : "var(--surface-container-high)",
                      transition: "height 0.4s ease",
                    }}
                  />
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--on-surface-variant)" }}>
                    {slot.hour.slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span>Morning: 08:00 ({hourlyDistribution[0]?.rate || 0}%)</span>
            <span style={{ fontWeight: "700", color: "var(--primary-container)" }}>
              {peakData.hasActivity ? `Peak: ${peakData.peakWindow} (${peakData.peakRate}%)` : "No peak pressure detected"}
            </span>
            <span>Evening: 19:00 ({hourlyDistribution[hourlyDistribution.length - 1]?.rate || 0}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
