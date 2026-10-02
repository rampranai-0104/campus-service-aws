import React, { useState } from "react";

export const AvailabilityMatrix = ({ onSelectSlot }) => {
  const [selectedView, setSelectedView] = useState("Week");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  const hours = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // Schedule mock grid data
  const days = [
    { name: "Mon", isToday: false, slots: ["free", "limited", "busy", "booked", "free", "free", "busy", "booked", "limited", "free", "free", "free"] },
    { name: "Tue", isToday: false, slots: ["free", "busy", "booked", "booked", "free", "free", "busy", "busy", "booked", "limited", "free", "free"] },
    { name: "Wed", isToday: true,  slots: ["free", "limited", "busy", "busy", "free", "limited", "booked", "booked", "busy", "free", "free", "free"] },
    { name: "Thu", isToday: false, slots: ["free", "free", "busy", "booked", "free", "free", "busy", "booked", "maint", "free", "free", "free"] },
    { name: "Fri", isToday: false, slots: ["free", "busy", "busy", "limited", "free", "free", "free", "busy", "free", "free", "free", "free"] },
  ];

  const getSlotStyle = (status) => {
    switch (status) {
      case "free":
        return { backgroundColor: "var(--surface-container-low)", border: "1px solid #e2e8f0" };
      case "limited":
        return { backgroundColor: "var(--surface-container-high)", border: "1px solid #cbd5e1" };
      case "busy":
        return { backgroundColor: "var(--primary-container)", color: "#ffffff" };
      case "booked":
        return { backgroundColor: "var(--primary)", color: "#ffffff" };
      case "maint":
        return { backgroundColor: "var(--secondary-fixed)", color: "var(--on-secondary-fixed)" };
      default:
        return { backgroundColor: "var(--surface-container-low)" };
    }
  };

  const getSlotTooltip = (dayName, hour, status) => {
    if (status === "free") return `${dayName} ${hour} - >70% Rooms Open (Click to Reserve)`;
    if (status === "limited") return `${dayName} ${hour} - 40% Rooms Open`;
    if (status === "busy") return `${dayName} ${hour} - High Demand (Peak)`;
    if (status === "booked") return `${dayName} ${hour} - Fully Booked across selected complex`;
    if (status === "maint") return `${dayName} ${hour} - Scheduled Sanitation / Maintenance`;
    return "";
  };

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
      {/* Top Header & View Controls */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--on-surface)", margin: 0 }}>
            Campus Availability Matrix
          </h2>
          <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: "2px 0 0" }}>
            Real-time room occupancy and scheduled hourly density
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Day / Week / Month selector */}
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--surface-container-low)",
              padding: "2px",
              borderRadius: "8px",
            }}
          >
            {["Day", "Week", "Month"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedView(tab)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: selectedView === tab ? "700" : "500",
                  backgroundColor: selectedView === tab ? "var(--surface-container-lowest)" : "transparent",
                  color: selectedView === tab ? "var(--primary-container)" : "var(--on-surface-variant)",
                  boxShadow: selectedView === tab ? "var(--shadow-xs)" : "none",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Building Dropdown */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            style={{
              height: "32px",
              padding: "0 10px",
              borderRadius: "8px",
              backgroundColor: "var(--surface-container-low)",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
              color: "var(--on-surface)",
              fontWeight: "500",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Campus Buildings (14)</option>
            <option value="Science & Engineering Hall">Science & Engineering Hall</option>
            <option value="Turing Computing Complex">Turing Computing Complex</option>
            <option value="Baker Humanities Center">Baker Humanities Center</option>
            <option value="BioTech Research Center">BioTech Research Center</option>
          </select>
        </div>
      </div>

      {/* Metric Highlight Banner */}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          backgroundColor: "rgba(220, 225, 255, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "18px" }}>
            trending_up
          </span>
          <span style={{ fontSize: "13px", color: "var(--on-surface)" }}>
            Peak demand window today: <strong style={{ color: "var(--primary-container)" }}>2:00 PM – 4:30 PM</strong> (92% booked across labs)
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--primary-container)", fontWeight: "600" }}>
          38 rooms auto-released this week
        </span>
      </div>

      {/* Interactive Timetable Heatmap */}
      <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
        <div style={{ minWidth: "560px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Header Hours */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "50px repeat(12, 1fr)",
              gap: "4px",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--outline)",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            <div />
            {hours.map((hr) => (
              <div key={hr}>{hr}</div>
            ))}
          </div>

          {/* Days */}
          {days.map((day) => (
            <div
              key={day.name}
              style={{
                display: "grid",
                gridTemplateColumns: "50px repeat(12, 1fr)",
                gap: "4px",
                alignItems: "center",
                backgroundColor: day.isToday ? "rgba(229, 238, 255, 0.5)" : "transparent",
                padding: "3px 0",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: day.isToday ? "var(--primary-container)" : "var(--on-surface)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  paddingLeft: "4px",
                }}
              >
                {day.isToday && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-container)",
                    }}
                  />
                )}
                {day.name}
              </div>

              {day.slots.map((slotStatus, idx) => {
                const hour = hours[idx];
                const styleObj = getSlotStyle(slotStatus);
                return (
                  <button
                    key={idx}
                    title={getSlotTooltip(day.name, hour, slotStatus)}
                    onClick={() => {
                      if (onSelectSlot && (slotStatus === "free" || slotStatus === "limited")) {
                        onSelectSlot({
                          date: new Date().toISOString().split("T")[0],
                          startTime: hour,
                          endTime: hours[idx + 1] || "20:00",
                        });
                      }
                    }}
                    style={{
                      height: "28px",
                      borderRadius: "5px",
                      fontSize: "10px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: slotStatus === "free" || slotStatus === "limited" ? "pointer" : "default",
                      transition: "opacity 0.15s ease",
                      ...styleObj,
                    }}
                    className="hover:opacity-85"
                  >
                    {slotStatus === "busy" ? "88%" : slotStatus === "maint" ? "🔧" : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          paddingTop: "6px",
          borderTop: "1px solid #f1f5f9",
          fontSize: "11px",
          color: "var(--on-surface-variant)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--surface-container-low)", border: "1px solid #cbd5e1" }} />
          <span>Available (&gt;60% open)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--surface-container-high)" }} />
          <span>Limited (30-60%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--primary-container)" }} />
          <span>High Occupancy (&lt;30%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--primary)" }} />
          <span>Fully Booked</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--secondary-fixed)" }} />
          <span>Scheduled Maintenance</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityMatrix;
