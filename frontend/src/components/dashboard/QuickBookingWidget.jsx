import React, { useState, useEffect } from "react";
import { useBooking } from "../../context/BookingContext";

export const QuickBookingWidget = ({ prefill }) => {
  const { rooms, createBooking, checkAvailability, isOfflineSim } = useBooking();

  const [building, setBuilding] = useState("Turing Computing Complex");
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:30");
  const [purpose, setPurpose] = useState("Senior Thesis Working Group");
  const [attendees, setAttendees] = useState(6);
  const [validationResult, setValidationResult] = useState({ isAvailable: true, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available buildings
  const buildings = [
    "Turing Computing Complex",
    "Science & Engineering Hall",
    "Central Library",
    "Baker Humanities Center",
    "BioTech Research Center",
    "Environmental Sciences",
  ];

  // Filter rooms for chosen building
  const availableRooms = rooms.filter(
    (r) => r.building === building && r.status !== "DISABLED"
  );

  // Auto-select first room in building if current room is not in it
  useEffect(() => {
    if (availableRooms.length > 0) {
      const match = availableRooms.find((r) => r.id === roomId);
      if (!match) {
        setRoomId(availableRooms[0].id);
      }
    }
  }, [building, availableRooms, roomId]);

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
  }, [roomId, date, startTime, endTime]);

  const selectedRoom = rooms.find((r) => r.id === roomId);

  const handleSubmit = async (e, forceOffline = false) => {
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
        purpose: purpose || "Academic Meeting",
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
            backgroundColor: "var(--surface-container-high)",
            color: "var(--primary-container)",
            fontSize: "11px",
            fontWeight: "700",
          }}
        >
          DataStore Sync
        </span>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Building Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
            Campus & Building
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
          >
            {availableRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (Cap: {r.capacity})
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
            Reservation Date
          </label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Time Window Split */}
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
            Reservation Purpose
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Senior Thesis Working Group"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        </div>

        {/* Attendees */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
              Expected Attendees
            </label>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--outline)" }}>
              Max: {selectedRoom?.capacity || 20}
            </span>
          </div>
          <input
            type="number"
            className="form-input"
            min="1"
            max={selectedRoom?.capacity || 100}
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />
        </div>

        {/* Dynamic Collision / Validation Pill */}
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            backgroundColor: validationResult.isAvailable ? "#ecfdf5" : "#fee2e2",
            border: `1px solid ${validationResult.isAvailable ? "#a7f3d0" : "#fca5a5"}`,
            color: validationResult.isAvailable ? "#065f46" : "#991b1b",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            fontSize: "12px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "18px",
              color: validationResult.isAvailable ? "#059669" : "#dc2626",
              marginTop: "1px",
              flexShrink: 0,
            }}
          >
            {validationResult.isAvailable ? "check_circle" : "error"}
          </span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: "700" }}>
              {validationResult.isAvailable ? "Slot Available" : "Collision Warning"}
            </span>
            <span style={{ fontSize: "11px", lineHeight: "1.3", opacity: 0.9 }}>
              {validationResult.message ||
                "No conflict detected in local IndexedDB or AWS Cloud index."}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
          <button
            type="submit"
            disabled={!validationResult.isAvailable || isSubmitting}
            className="btn-primary"
            style={{
              width: "100%",
              opacity: !validationResult.isAvailable ? 0.6 : 1,
              cursor: !validationResult.isAvailable ? "not-allowed" : "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              verified
            </span>
            <span>{isSubmitting ? "Reserving..." : "Instant Reserve Room"}</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            style={{
              width: "100%",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "var(--surface-container-low)",
              color: "var(--on-surface-variant)",
              fontSize: "12px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              border: "1px solid #e2e8f0",
            }}
            className="hover:bg-slate-100 hover:text-slate-900"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              save_as
            </span>
            <span>Save to Offline Queue</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickBookingWidget;
