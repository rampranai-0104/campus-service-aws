import React, { useState, useEffect, useMemo } from "react";
import { useBooking } from "../../context/BookingContext";

export const QuickBookingWidget = ({ prefill }) => {
  const { rooms = [], createBooking, checkAvailability, isOnline } = useBooking();

  // Dynamic buildings from live rooms
  const buildings = useMemo(() => {
    const set = new Set();
    rooms.forEach((r) => {
      if (r.building) set.add(r.building);
    });
    return Array.from(set).sort();
  }, [rooms]);

  const [building, setBuilding] = useState(() => buildings[0] || "");
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:30");
  const [purpose, setPurpose] = useState("");
  const [attendees, setAttendees] = useState(4);
  const [validationResult, setValidationResult] = useState({ isAvailable: true, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync building when buildings list loads
  useEffect(() => {
    if (!building && buildings.length > 0) {
      setBuilding(buildings[0]);
    }
  }, [buildings, building]);

  // Filter rooms for chosen building
  const availableRooms = useMemo(() => {
    return rooms.filter(
      (r) => (building === "all" || !building || r.building === building) && r.status !== "DISABLED"
    );
  }, [rooms, building]);

  // Auto-select first room in building if current room is not in it
  useEffect(() => {
    if (availableRooms.length > 0) {
      const match = availableRooms.find((r) => r.id === roomId);
      if (!match) {
        setRoomId(availableRooms[0].id);
      }
    } else {
      setRoomId("");
    }
  }, [availableRooms, roomId]);

  // Support prefill if user clicked Quick Reserve on a room
  useEffect(() => {
    if (prefill) {
      if (prefill.building) setBuilding(prefill.building);
      if (prefill.roomId) setRoomId(prefill.roomId);
      if (prefill.date) setDate(prefill.date);
      if (prefill.startTime) setStartTime(prefill.startTime);
      if (prefill.endTime) setEndTime(prefill.endTime);
      if (prefill.purpose) setPurpose(prefill.purpose);
    }
  }, [prefill]);

  // Live conflict checking whenever room, date, or time changes
  useEffect(() => {
    if (roomId && date && startTime && endTime) {
      const res = checkAvailability(roomId, date, startTime, endTime);
      setValidationResult(res);
    }
  }, [roomId, date, startTime, endTime, checkAvailability]);

  const selectedRoom = rooms.find((r) => r.id === roomId);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedRoom) return;

    setIsSubmitting(true);
    try {
      await createBooking({
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        roomCode: selectedRoom.code,
        building: selectedRoom.building,
        date,
        startTime,
        endTime,
        purpose: purpose.trim() || "Academic Study Session",
        attendeeCount: parseInt(attendees, 10) || 1,
        capacity: selectedRoom.capacity,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="quick-booking-panel"
      style={{
        borderRadius: "16px",
        backgroundColor: "var(--surface-container-lowest)",
        padding: "22px",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid #f1f5f9",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
      className="quick-booking-panel"
    >
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "22px" }}>
            bolt
          </span>
          <h2 style={{ fontSize: "17px", fontWeight: "700", color: "var(--on-surface)", margin: 0 }}>
            Quick Reservation
          </h2>
        </div>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: "6px",
            backgroundColor: "#ecfdf5",
            color: "#059669",
            fontSize: "11px",
            fontWeight: "700",
          }}
        >
          AWS AppSync Live
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Building Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
            Campus &amp; Building
          </label>
          <select
            className="form-select"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
          >
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Room Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
            Room Selection
          </label>
          <select
            className="form-select"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            disabled={availableRooms.length === 0}
          >
            {availableRooms.length === 0 ? (
              <option value="">No rooms available in this building</option>
            ) : (
              availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code}) — Cap: {r.capacity} {r.status === "MAINTENANCE" ? "[MAINT]" : ""}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
            Date
          </label>
          <input
            type="date"
            className="form-input"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Start / End Time Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
              Start Time
            </label>
            <input
              type="time"
              className="form-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
              End Time
            </label>
            <input
              type="time"
              className="form-input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Purpose */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
            Session Purpose
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Collaborative Capstone Meeting"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        </div>

        {/* Headcount */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
              Expected Attendees
            </label>
            {selectedRoom && (
              <span style={{ fontSize: "11px", color: "var(--outline)" }}>
                Max Capacity: {selectedRoom.capacity}
              </span>
            )}
          </div>
          <input
            type="number"
            min="1"
            max={selectedRoom ? selectedRoom.capacity : 100}
            className="form-input"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            required
          />
        </div>

        {/* Conflict Verification Indicator */}
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            backgroundColor: validationResult.isAvailable ? "#ecfdf5" : "#fef2f2",
            border: `1px solid ${validationResult.isAvailable ? "#a7f3d0" : "#fecaca"}`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "2px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "18px", color: validationResult.isAvailable ? "#059669" : "#dc2626" }}
          >
            {validationResult.isAvailable ? "check_circle" : "error"}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: validationResult.isAvailable ? "#065f46" : "#991b1b",
              lineHeight: "1.3",
            }}
          >
            {validationResult.message || "Zero conflict detected in live AWS AppSync schedule."}
          </span>
        </div>

        {/* Action Button */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
          <button
            type="submit"
            disabled={!validationResult.isAvailable || isSubmitting || !isOnline}
            className="btn-primary"
            style={{
              width: "100%",
              opacity: !validationResult.isAvailable || isSubmitting || !isOnline ? 0.6 : 1,
              cursor: !validationResult.isAvailable || isSubmitting || !isOnline ? "not-allowed" : "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              verified
            </span>
            <span>{isSubmitting ? "Reserving..." : "Reserve Room"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickBookingWidget;
