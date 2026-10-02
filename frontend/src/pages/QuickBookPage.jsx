import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import KeycardPassModal from "../components/booking/KeycardPassModal";
import RequestSubmittedModal from "../components/booking/RequestSubmittedModal";

export const QuickBookPage = ({ onNavigate }) => {
  const { rooms, createBooking, checkAvailability } = useBooking();
  const { currentUser } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || "");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:30");
  const [purpose, setPurpose] = useState("Research Group Sprint");
  const [attendees, setAttendees] = useState(4);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const availability = selectedRoom
    ? checkAvailability(selectedRoom.id, date, startTime, endTime)
    : { isAvailable: false, message: "Select a room first" };

  const handleNext = () => {
    if (step === 1 && selectedRoom) setStep(2);
    else if (step === 2 && availability.isAvailable) setStep(3);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!availability.isAvailable || !selectedRoom) return;

    const result = await createBooking({
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      roomCode: selectedRoom.code,
      building: selectedRoom.building,
      date,
      startTime,
      endTime,
      purpose,
      attendeeCount: parseInt(attendees, 10) || 1,
      capacity: selectedRoom.capacity,
    });

    if (result.success) {
      setConfirmedBooking(result.booking);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto" }} className="quick-book-page animate-fade-in">
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
          <span>Rapid Flow</span>
          <span style={{ color: "var(--outline)" }}>/</span>
          <span style={{ color: "var(--on-surface-variant)" }}>One-Click Reservation</span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
          Quick Book Wizard
        </h1>
        <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
          Reserve any campus laboratory, seminar hall, or private pod with instant keycard access PIN.
        </p>
      </div>

      {/* Stepper Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
        }}
      >
        {[
          { num: 1, title: "1. Select Room" },
          { num: 2, title: "2. Date & Schedule" },
          { num: 3, title: currentUser?.role === "Admin" ? "3. Confirm & Pass" : "3. Review & Request" },
        ].map((s) => (
          <div
            key={s.num}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              backgroundColor: step === s.num ? "var(--primary-container)" : "var(--surface-container-lowest)",
              color: step === s.num ? "#ffffff" : "var(--on-surface-variant)",
              border: `1px solid ${step === s.num ? "var(--primary-container)" : "#e2e8f0"}`,
              boxShadow: "var(--shadow-xs)",
              fontSize: "13px",
              fontWeight: "700",
              textAlign: "center",
              transition: "all 0.15s ease",
            }}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* Main Wizard Form Container */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          padding: "28px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid #f1f5f9",
        }}
      >
        {/* STEP 1: Select Room */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
              Choose Campus Space
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px", maxHeight: "420px", overflowY: "auto", paddingRight: "4px" }}>
              {rooms
                .filter((r) => r.status === "AVAILABLE")
                .map((r) => {
                  const isSelected = r.id === selectedRoomId;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoomId(r.id)}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        border: `2px solid ${isSelected ? "var(--primary-container)" : "#e2e8f0"}`,
                        backgroundColor: isSelected ? "var(--surface-container-low)" : "var(--surface-container-lowest)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <img
                        src={r.image}
                        alt={r.name}
                        style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                      />
                      <div>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--on-surface)" }}>
                          {r.name}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", display: "block" }}>
                          {r.building} • Cap: {r.capacity}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button onClick={handleNext} className="btn-primary" style={{ padding: "0 24px" }}>
                Next: Select Schedule →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Schedule & Collision Check */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
              Date &amp; Time Window
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--on-surface-variant)" }}>
                Reservation Date
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--on-surface-variant)" }}>
                  Start Time
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--on-surface-variant)" }}>
                  End Time
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Live Conflict Box */}
            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                backgroundColor: availability.isAvailable ? "#ecfdf5" : "#fee2e2",
                border: `1px solid ${availability.isAvailable ? "#a7f3d0" : "#fca5a5"}`,
                color: availability.isAvailable ? "#065f46" : "#991b1b",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                fontSize: "13px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px", color: availability.isAvailable ? "#059669" : "#dc2626" }}
              >
                {availability.isAvailable ? "check_circle" : "error"}
              </span>
              <div>
                <span style={{ fontWeight: "700" }}>
                  {availability.isAvailable ? "Schedule Validated (Zero Conflict)" : "Collision Conflict"}
                </span>
                <p style={{ margin: "2px 0 0", fontSize: "12px" }}>
                  {availability.message || "Space is ready for booking."}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
              <button onClick={() => setStep(1)} className="btn-secondary">
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={!availability.isAvailable}
                className="btn-primary"
                style={{ padding: "0 24px", opacity: availability.isAvailable ? 1 : 0.5 }}
              >
                Next: Purpose &amp; PIN →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Purpose & Confirmation */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
              Purpose &amp; Attendees
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--on-surface-variant)" }}>
                Reservation Purpose
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Capstone Research / Sprint"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--on-surface-variant)" }}>
                Expected Attendees (Max: {selectedRoom?.capacity})
              </label>
              <input
                type="number"
                className="form-input"
                min="1"
                max={selectedRoom?.capacity || 20}
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </div>

            {/* Summary Review Card */}
            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "var(--surface-container-low)",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--on-surface-variant)" }}>Selected Room:</span>
                <strong>{selectedRoom?.name} ({selectedRoom?.building})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--on-surface-variant)" }}>Date &amp; Time:</span>
                <strong>{date} ({startTime} – {endTime})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--on-surface-variant)" }}>Host:</span>
                <strong>{currentUser?.name} ({currentUser?.roleLabel})</strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
              <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                ← Back
              </button>
              <button type="submit" className="btn-primary" style={{ padding: "0 28px" }}>
                {currentUser?.role === "Admin" ? "Confirm & Generate PIN Pass" : "Submit Reservation Request"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Confirmation / Pending Pass Modal */}
      {confirmedBooking && confirmedBooking.status === "PENDING" && (
        <RequestSubmittedModal
          booking={confirmedBooking}
          isOpen={true}
          onClose={() => {
            setConfirmedBooking(null);
            onNavigate("my-bookings");
          }}
        />
      )}

      {confirmedBooking && confirmedBooking.status === "CONFIRMED" && (
        <KeycardPassModal
          booking={confirmedBooking}
          isOpen={true}
          onClose={() => {
            setConfirmedBooking(null);
            onNavigate("my-bookings");
          }}
        />
      )}
    </div>
  );
};

export default QuickBookPage;
