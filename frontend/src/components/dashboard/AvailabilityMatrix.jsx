import React, { useState, useMemo } from "react";
import { useBooking } from "../../context/BookingContext";
import { parseTimeToMinutes } from "../../services/analyticsService";

export const AvailabilityMatrix = ({ onSelectSlot }) => {
  const { rooms = [], bookings = [] } = useBooking();
  const [selectedView, setSelectedView] = useState("Week"); // "Day" | "Week" | "Month"
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  const hours = useMemo(
    () => [
      "08:00", "09:00", "10:00", "11:00", "12:00",
      "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
    ],
    []
  );

  // Dynamic unique list of buildings from live rooms
  const buildings = useMemo(() => {
    const set = new Set();
    rooms.forEach((r) => {
      if (r.building) set.add(r.building);
    });
    return Array.from(set).sort();
  }, [rooms]);

  // Filter rooms by selected building
  const filteredRooms = useMemo(() => {
    if (selectedBuilding === "all") return rooms;
    return rooms.filter((r) => r.building === selectedBuilding);
  }, [rooms, selectedBuilding]);

  // Eligible rooms (non-maintenance) vs maintenance rooms
  const eligibleRooms = useMemo(
    () => filteredRooms.filter((r) => r.status !== "MAINTENANCE"),
    [filteredRooms]
  );
  const maintenanceRooms = useMemo(
    () => filteredRooms.filter((r) => r.status === "MAINTENANCE"),
    [filteredRooms]
  );

  // Active confirmed bookings only (excluding CANCELLED and REJECTED, PENDING not confirmed)
  const confirmedBookings = useMemo(() => {
    const roomIds = new Set(filteredRooms.map((r) => r.id));
    return bookings.filter(
      (b) => b.status === "CONFIRMED" && roomIds.has(b.roomId)
    );
  }, [bookings, filteredRooms]);

  // Check if a booking interval overlaps with a slot [slotStart, slotEnd]
  const isOverlapping = (b, slotStart, slotEnd) => {
    const bStart = parseTimeToMinutes(b.startTime);
    const bEnd = parseTimeToMinutes(b.endTime);
    const sStart = parseTimeToMinutes(slotStart);
    const sEnd = parseTimeToMinutes(slotEnd);
    return bStart < sEnd && bEnd > sStart;
  };

  // Helper: format YYYY-MM-DD
  const formatDateISO = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Current date anchor
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateISO(today), [today]);

  // Calculate Monday through Friday of the current week
  const weekDays = useMemo(() => {
    const d = new Date(today);
    const dayOfWeek = d.getDay(); // 0 is Sun, 1 is Mon, etc.
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);

    const names = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    return names.map((name, i) => {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      const iso = formatDateISO(cur);
      return {
        name,
        date: iso,
        label: `${name} ${cur.getDate()}`,
        isToday: iso === todayStr,
      };
    });
  }, [today, todayStr]);

  // Calculate live occupancy for a specific date and hour slot
  const calculateSlotData = (dateStr, hour) => {
    const hourNum = parseInt(hour.split(":")[0], 10);
    const nextHour = `${String(hourNum + 1).padStart(2, "0")}:00`;

    if (eligibleRooms.length === 0) {
      if (filteredRooms.length > 0 && maintenanceRooms.length === filteredRooms.length) {
        return {
          status: "maint",
          percentage: 0,
          occupiedCount: 0,
          eligibleCount: 0,
          tooltip: `${dateStr} ${hour} – All rooms in this area under scheduled maintenance`,
        };
      }
      return {
        status: "free",
        percentage: 0,
        occupiedCount: 0,
        eligibleCount: 0,
        tooltip: `${dateStr} ${hour} – No rooms configured in this complex`,
      };
    }

    // Find confirmed bookings active on this date & hour
    const activeInSlot = confirmedBookings.filter(
      (b) => b.date === dateStr && isOverlapping(b, hour, nextHour)
    );

    const occupiedRoomIds = new Set(activeInSlot.map((b) => b.roomId));
    const occupiedCount = eligibleRooms.filter((r) => occupiedRoomIds.has(r.id)).length;
    const eligibleCount = eligibleRooms.length;
    const rate = Math.round((occupiedCount / eligibleCount) * 100);

    let status = "free";
    if (occupiedCount === eligibleCount && eligibleCount > 0) {
      status = "booked";
    } else if (rate >= 70) {
      status = "busy";
    } else if (rate >= 30) {
      status = "limited";
    }

    const freeCount = eligibleCount - occupiedCount;
    const tooltip = `${dateStr} ${hour} – ${rate}% Occupied (${freeCount} of ${eligibleCount} spaces open)`;

    return {
      status,
      percentage: rate,
      occupiedCount,
      eligibleCount,
      tooltip,
    };
  };

  // Peak window calculation for today based on live confirmed bookings
  const peakStats = useMemo(() => {
    let maxRate = 0;
    let peakHour = null;

    hours.forEach((h) => {
      const data = calculateSlotData(todayStr, h);
      if (data.percentage > maxRate) {
        maxRate = data.percentage;
        peakHour = h;
      }
    });

    if (maxRate === 0 || !peakHour) {
      return {
        hasPeak: false,
        text: "Spaces operating normally with 100% capacity available across campus.",
        activeStat: `${eligibleRooms.length} rooms ready for instant booking`,
      };
    }

    const startH = parseInt(peakHour.split(":")[0], 10);
    const endH = startH + 1;
    const formatHour = (hr) => {
      const ampm = hr >= 12 ? "PM" : "AM";
      const h12 = hr % 12 || 12;
      return `${h12}:00 ${ampm}`;
    };

    return {
      hasPeak: true,
      text: `Peak demand window today: ${formatHour(startH)} – ${formatHour(endH)} (${maxRate}% booked)`,
      activeStat: `${confirmedBookings.filter((b) => b.date === todayStr).length} confirmed sessions today`,
    };
  }, [hours, todayStr, eligibleRooms.length, confirmedBookings]);

  // Slot styling based on live status
  const getSlotStyle = (status) => {
    switch (status) {
      case "free":
        return { backgroundColor: "var(--surface-container-low)", border: "1px solid #e2e8f0", color: "var(--on-surface-variant)" };
      case "limited":
        return { backgroundColor: "#bae6fd", border: "1px solid #7dd3fc", color: "#0369a1" };
      case "busy":
        return { backgroundColor: "var(--primary-container)", color: "#ffffff", border: "1px solid transparent" };
      case "booked":
        return { backgroundColor: "#1e3a8a", color: "#ffffff", border: "1px solid transparent" };
      case "maint":
        return { backgroundColor: "#fef3c7", border: "1px solid #fde68a", color: "#b45309" };
      default:
        return { backgroundColor: "var(--surface-container-low)" };
    }
  };

  // Days of current month for Month View
  const monthDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const curDate = new Date(year, month, day);
      const iso = formatDateISO(curDate);
      const dayBookings = confirmedBookings.filter((b) => b.date === iso);
      const isPast = iso < todayStr;
      const isToday = iso === todayStr;

      // Peak rate across hours for this day
      let dayPeak = 0;
      if (eligibleRooms.length > 0) {
        hours.forEach((h) => {
          const s = calculateSlotData(iso, h);
          if (s.percentage > dayPeak) dayPeak = s.percentage;
        });
      }

      list.push({
        dayNumber: day,
        date: iso,
        weekday: curDate.toLocaleDateString("en-US", { weekday: "short" }),
        isToday,
        isPast,
        bookingsCount: dayBookings.length,
        peakRate: dayPeak,
      });
    }
    return list;
  }, [today, todayStr, confirmedBookings, eligibleRooms.length, hours]);

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
      className="availability-matrix-container"
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--on-surface)", margin: 0 }}>
              Campus Availability Matrix
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                padding: "1px 8px",
                borderRadius: "9999px",
                backgroundColor: "#ecfdf5",
                color: "#059669",
              }}
            >
              LIVE AWS
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: "2px 0 0" }}>
            Real-time space density dynamically calculated from {filteredRooms.length} room records &amp; {confirmedBookings.length} confirmed bookings
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
                  transition: "all 0.15s ease",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Building Dropdown — Derived strictly from live rooms */}
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
            <option value="all">All Campus Buildings ({buildings.length})</option>
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Metric Highlight Banner */}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          backgroundColor: "rgba(220, 225, 255, 0.45)",
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
            {peakStats.text}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--primary-container)",
            fontWeight: "600",
          }}
        >
          {peakStats.activeStat}
        </span>
      </div>

      {/* VIEW: WEEK VIEW (Default) */}
      {selectedView === "Week" && (
        <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
          <div style={{ minWidth: "580px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Header Hours */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "70px repeat(12, 1fr)",
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

            {/* Week Days */}
            {weekDays.map((day) => (
              <div
                key={day.date}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px repeat(12, 1fr)",
                  gap: "4px",
                  alignItems: "center",
                  backgroundColor: day.isToday ? "rgba(229, 238, 255, 0.55)" : "transparent",
                  padding: "4px 0",
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
                    gap: "5px",
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
                  <span>{day.label}</span>
                </div>

                {hours.map((hour, idx) => {
                  const slot = calculateSlotData(day.date, hour);
                  const styleObj = getSlotStyle(slot.status);
                  const nextHour = hours[idx + 1] || "20:00";

                  return (
                    <button
                      key={hour}
                      title={slot.tooltip}
                      onClick={() => {
                        if (onSelectSlot && (slot.status === "free" || slot.status === "limited")) {
                          onSelectSlot({
                            date: day.date,
                            startTime: hour,
                            endTime: nextHour,
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
                        cursor: slot.status === "free" || slot.status === "limited" ? "pointer" : "default",
                        transition: "all 0.15s ease",
                        ...styleObj,
                      }}
                      className="hover:opacity-85"
                    >
                      {slot.status === "maint"
                        ? "🔧"
                        : slot.percentage > 0
                        ? `${slot.percentage}%`
                        : ""}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: DAY VIEW (Today's detailed hourly breakdown) */}
      {selectedView === "Day" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--on-surface)" }}>
              Today's Schedule ({todayStr})
            </span>
            <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
              {filteredRooms.length} spaces evaluated across 12 operational slots
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "10px",
            }}
          >
            {hours.map((hour, idx) => {
              const slot = calculateSlotData(todayStr, hour);
              const nextHour = hours[idx + 1] || "20:00";
              const isPast = today.getHours() > parseInt(hour.split(":")[0], 10);

              return (
                <div
                  key={hour}
                  onClick={() => {
                    if (onSelectSlot && (slot.status === "free" || slot.status === "limited")) {
                      onSelectSlot({
                        date: todayStr,
                        startTime: hour,
                        endTime: nextHour,
                      });
                    }
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    backgroundColor: isPast ? "var(--surface-container-low)" : "var(--surface-container-lowest)",
                    border: `1px solid ${slot.status === "busy" ? "var(--primary-container)" : "#e2e8f0"}`,
                    boxShadow: "var(--shadow-xs)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    cursor: slot.status === "free" || slot.status === "limited" ? "pointer" : "default",
                    opacity: isPast ? 0.7 : 1,
                  }}
                  className="hover:shadow-sm"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "700", color: "var(--on-surface)" }}>
                      {hour}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        ...getSlotStyle(slot.status),
                      }}
                    >
                      {slot.status === "maint" ? "MAINT" : `${slot.percentage}%`}
                    </span>
                  </div>

                  <div style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                    {slot.status === "maint"
                      ? "Maintenance"
                      : `${slot.eligibleCount - slot.occupiedCount} of ${slot.eligibleCount} rooms free`}
                  </div>

                  <div style={{ width: "100%", height: "4px", backgroundColor: "var(--surface-container-high)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${slot.percentage}%`,
                        height: "100%",
                        backgroundColor: slot.percentage >= 70 ? "var(--primary-container)" : "#0284c7",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: MONTH VIEW (Current month confirmed density) */}
      {selectedView === "Month" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--on-surface)" }}>
              {today.toLocaleString("default", { month: "long", year: "numeric" })} Occupancy Overview
            </span>
            <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
              Calculated from confirmed DynamoDB reservations
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "8px",
            }}
          >
            {monthDays.map((d) => {
              const hasActivity = d.bookingsCount > 0;
              return (
                <div
                  key={d.date}
                  onClick={() => {
                    if (onSelectSlot && !d.isPast) {
                      onSelectSlot({
                        date: d.date,
                        startTime: "09:00",
                        endTime: "10:00",
                      });
                    }
                  }}
                  style={{
                    padding: "8px 6px",
                    borderRadius: "8px",
                    backgroundColor: d.isToday
                      ? "rgba(229, 238, 255, 0.7)"
                      : hasActivity
                      ? "rgba(240, 249, 255, 0.9)"
                      : "var(--surface-container-low)",
                    border: d.isToday ? "2px solid var(--primary-container)" : "1px solid #f1f5f9",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    cursor: !d.isPast ? "pointer" : "default",
                    opacity: d.isPast ? 0.6 : 1,
                  }}
                >
                  <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase" }}>
                    {d.weekday}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: d.isToday ? "var(--primary-container)" : "var(--on-surface)" }}>
                    {d.dayNumber}
                  </span>
                  {hasActivity ? (
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: "700",
                        padding: "1px 4px",
                        borderRadius: "4px",
                        backgroundColor: "var(--primary-container)",
                        color: "#ffffff",
                        marginTop: "2px",
                      }}
                    >
                      {d.bookingsCount} booked
                    </span>
                  ) : (
                    <span style={{ fontSize: "9px", color: "var(--outline)", marginTop: "2px" }}>
                      Open
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          paddingTop: "8px",
          borderTop: "1px solid #f1f5f9",
          fontSize: "11px",
          color: "var(--on-surface-variant)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--surface-container-low)", border: "1px solid #cbd5e1" }} />
          <span>Available (&gt;70% open)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#bae6fd", border: "1px solid #7dd3fc" }} />
          <span>Limited (30–70% open)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--primary-container)" }} />
          <span>High Demand (&lt;30% open)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#1e3a8a" }} />
          <span>Fully Booked</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#fef3c7", border: "1px solid #fde68a" }} />
          <span>Scheduled Maintenance</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityMatrix;
