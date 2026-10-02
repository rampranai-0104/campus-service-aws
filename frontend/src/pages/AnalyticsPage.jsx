import React from "react";
import StatCard from "../components/common/StatCard";

export const AnalyticsPage = () => {
  const buildingUtilization = [
    { name: "Turing Computing Complex", pct: 88, rooms: 24, hours: 412 },
    { name: "Science & Engineering Hall", pct: 92, rooms: 32, hours: 560 },
    { name: "Central Library Pods", pct: 96, rooms: 18, hours: 380 },
    { name: "BioTech Research Center", pct: 74, rooms: 14, hours: 220 },
    { name: "Baker Humanities Center", pct: 68, rooms: 22, hours: 290 },
    { name: "Environmental Sciences", pct: 62, rooms: 18, hours: 180 },
  ];

  const hourlyDistribution = [
    { hour: "08:00", rate: 35 },
    { hour: "09:00", rate: 58 },
    { hour: "10:00", rate: 82 },
    { hour: "11:00", rate: 89 },
    { hour: "12:00", rate: 64 },
    { hour: "13:00", rate: 76 },
    { hour: "14:00", rate: 94 },
    { hour: "15:00", rate: 96 },
    { hour: "16:00", rate: 88 },
    { hour: "17:00", rate: 71 },
    { hour: "18:00", rate: 52 },
    { hour: "19:00", rate: 38 },
  ];

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
          Comprehensive space optimization metrics, peak schedule pressure hours, and departmental space allocations.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Overall Space Efficiency"
          value="84.6%"
          icon="insights"
          trend="+5.2% vs last term"
          trendPositive={true}
        />
        <StatCard
          title="Total Hours Booked (Week)"
          value="2,042"
          unit="hrs"
          icon="timelapse"
          trend="89% check-in rate"
          trendPositive={true}
        />
        <StatCard
          title="Auto-Released No-Shows"
          value="38"
          unit="slots"
          icon="event_repeat"
          trend="Reclaimed ~57 hours"
          trendPositive={true}
        />
        <StatCard
          title="Peak Window Occupancy"
          value="96%"
          icon="speed"
          trend="2:00 PM – 4:30 PM"
          trendPositive={false}
        />
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
            {buildingUtilization.map((b) => (
              <div key={b.name} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ fontWeight: "600", color: "var(--on-surface)" }}>{b.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--primary-container)" }}>
                    {b.pct}% ({b.hours} hrs)
                  </span>
                </div>
                <div style={{ width: "100%", height: "8px", borderRadius: "9999px", backgroundColor: "var(--surface-container-low)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${b.pct}%`,
                      height: "100%",
                      backgroundColor: b.pct > 90 ? "var(--primary)" : "var(--primary-container)",
                      borderRadius: "9999px",
                    }}
                  />
                </div>
              </div>
            ))}
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
              Hourly reservation distribution across all 128 spaces
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
              const isPeak = slot.rate >= 90;
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
                  title={`${slot.hour}: ${slot.rate}% Occupancy`}
                >
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: "700", color: isPeak ? "var(--primary)" : "var(--outline)" }}>
                    {slot.rate}%
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: `${slot.rate}%`,
                      borderRadius: "4px 4px 0 0",
                      backgroundColor: isPeak ? "var(--primary-container)" : "var(--surface-container-high)",
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
            <span>Morning Low: 08:00 (35%)</span>
            <span style={{ fontWeight: "700", color: "var(--primary-container)" }}>Peak: 14:00 - 16:00 (96%)</span>
            <span>Evening: 19:00 (38%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
