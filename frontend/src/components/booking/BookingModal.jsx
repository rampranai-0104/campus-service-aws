import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";
import KeycardPassModal from "./KeycardPassModal";
import RequestSubmittedModal from "./RequestSubmittedModal";

export const BookingModal = ({ room, isOpen, onClose }) => {
  const { createBooking, checkAvailability } = useBooking();
  const { currentUser } = useAuth();

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:30");
  const [purpose, setPurpose] = useState("");
  const [attendees, setAttendees] = useState(4);
  const [validation, setValidation] = useState({ isAvailable: true, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (room && date && startTime && endTime) {
      const res = checkAvailability(room.id, date, startTime, endTime);
      setValidation(res);
    }
  }, [room, date, startTime, endTime]);

  if (!room) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validation.isAvailable) return;

    setIsSubmitting(true);
    try {
      const result = await createBooking({
        roomId: room.id,
        roomName: room.name,
        roomCode: room.code,
        building: room.building,
        date,
        startTime,
        endTime,
        purpose: purpose || "Academic Collaboration",
        attendeeCount: parseInt(attendees, 10) || 1,
        capacity: room.capacity,
      });

      if (result.success) {
        setConfirmedBooking(result.booking);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen && !confirmedBooking} onClose={onClose} title={`Reserve ${room.name}`} maxWidth="520px">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Room Summary Header */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              backgroundColor: "var(--surface-container-low)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <img
              src={room.image}
              alt={room.name}
              style={{ width: "54px", height: "54px", borderRadius: "8px", objectFit: "cover" }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--on-surface)" }}>
                {room.name}
              </span>
              <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
                {room.building} • {room.floor}
              </span>
              <span style={{ fontSize: "11px", color: "var(--primary-container)", fontWeight: "600" }}>
                Max Capacity: {room.capacity} Persons
              </span>
            </div>
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
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Times */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
              placeholder="e.g. Senior Project Demo / Office Hours"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </div>

          {/* Attendees */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
                Expected Attendees
              </label>
              <span style={{ fontSize: "11px", color: "var(--outline)", fontFamily: "var(--font-mono)" }}>
                Max: {room.capacity}
              </span>
            </div>
            <input
              type="number"
              className="form-input"
              min="1"
              max={room.capacity}
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
            />
          </div>

          {/* Conflict status banner */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: validation.isAvailable ? "#ecfdf5" : "#fee2e2",
              border: `1px solid ${validation.isAvailable ? "#a7f3d0" : "#fca5a5"}`,
              color: validation.isAvailable ? "#065f46" : "#991b1b",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              fontSize: "12px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px", color: validation.isAvailable ? "#059669" : "#dc2626", flexShrink: 0, marginTop: "1px" }}
            >
              {validation.isAvailable ? "check_circle" : "error"}
            </span>
            <div>
              <span style={{ fontWeight: "700" }}>
                {validation.isAvailable ? "Slot Free & Ready" : "Collision Warning"}
              </span>
              <div style={{ fontSize: "11px", marginTop: "2px" }}>
                {validation.message || "No conflicting reservations found."}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!validation.isAvailable || isSubmitting}
              className="btn-primary"
              style={{
                flex: 1.5,
                opacity: !validation.isAvailable ? 0.6 : 1,
                cursor: !validation.isAvailable ? "not-allowed" : "pointer",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                {currentUser?.role === "Admin" ? "verified" : "send"}
              </span>
              <span>
                {room.status === "MAINTENANCE"
                  ? "Room Under Maintenance"
                  : isSubmitting
                  ? (currentUser?.role === "Admin" ? "Booking..." : "Submitting...")
                  : (currentUser?.role === "Admin" ? "Confirm Booking" : "Submit Reservation Request")}
              </span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation / Pending Modal */}
      {confirmedBooking && confirmedBooking.status === "PENDING" && (
        <RequestSubmittedModal
          booking={confirmedBooking}
          isOpen={true}
          onClose={() => {
            setConfirmedBooking(null);
            onClose();
          }}
        />
      )}

      {confirmedBooking && confirmedBooking.status === "CONFIRMED" && (
        <KeycardPassModal
          booking={confirmedBooking}
          isOpen={true}
          onClose={() => {
            setConfirmedBooking(null);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default BookingModal;
