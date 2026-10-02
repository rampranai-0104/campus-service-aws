import React, { useState, useEffect } from "react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/common/StatusBadge";
import KeycardPassModal from "../components/booking/KeycardPassModal";

export const RoomDetailsPage = ({ room, onBack, onNavigate }) => {
  const { bookings, createBooking, checkAvailability } = useBooking();
  const { currentUser } = useAuth();

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:30");
  const [purpose, setPurpose] = useState("Senior Thesis Working Group");
  const [attendees, setAttendees] = useState(6);
  const [validation, setValidation] = useState({ isAvailable: true, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (room && date && startTime && endTime) {
      const res = checkAvailability(room.id, date, startTime, endTime);
      setValidation(res);
    }
  }, [room, date, startTime, endTime]);

  if (!room) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>No room selected</h3>
        <button onClick={onBack} className="btn-primary" style={{ marginTop: "12px" }}>
          Back to Rooms
        </button>
      </div>
    );
  }

  // Today's bookings for this specific room
  const roomBookingsToday = bookings.filter(
    (b) => b.roomId === room.id && b.date === date && b.status !== "CANCELLED"
  );

  // Time slots for visual schedule timeline (08:00 to 20:00)
  const timelineHours = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  const isSlotBooked = (hour) => {
    return roomBookingsToday.some((b) => {
      return b.startTime <= hour && b.endTime > hour;
    });
  };

  const getSlotBooking = (hour) => {
    return roomBookingsToday.find((b) => b.startTime <= hour && b.endTime > hour);
  };

  const handleBookSubmit = async (e) => {
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
        purpose,
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="room-details-page animate-fade-in">
      {/* Top Breadcrumb & Back */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: "600",
            color: "var(--primary-container)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            arrow_back
          </span>
          <span>Back to Rooms Catalog</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StatusBadge status={room.status} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            ID: {room.code}
          </span>
        </div>
      </div>

      {/* Main Details Grid: Left Specs & Schedule (65%) | Right Booking Panel (35%) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "24px",
          alignItems: "start",
        }}
        className="room-details-grid"
      >
        {/* Left Column (8 cols) */}
        <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", gap: "24px" }} className="room-details-left">
          {/* Large Hero Image & Header */}
          <div
            style={{
              borderRadius: "16px",
              backgroundColor: "var(--surface-container-lowest)",
              boxShadow: "var(--shadow-sm)",
              border: "1px solid #f1f5f9",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "relative", height: "300px", width: "100%", backgroundColor: "var(--surface-container)" }}>
              <img
                src={room.image}
                alt={room.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(11, 28, 48, 0.8) 0%, rgba(11, 28, 48, 0.2) 60%, transparent 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "24px",
                  right: "24px",
                  color: "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", opacity: 0.9 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    domain
                  </span>
                  <span>{room.building}</span>
                  <span>•</span>
                  <span>{room.floor}</span>
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#ffffff", margin: "4px 0 0" }}>
                  {room.name}
                </h1>
              </div>
            </div>

            {/* Room Parameters & Description */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", lineHeight: "1.6", margin: 0 }}>
                {room.description ||
                  "A contemporary academic facility engineered for active research, high-bandwidth compute sessions, and group collaborative seminars."}
              </p>

              {/* Quick Specs Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "12px",
                }}
              >
                <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)" }}>
                  <span style={{ fontSize: "11px", color: "var(--outline)", textTransform: "uppercase", fontWeight: "700" }}>Capacity</span>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--on-surface)", marginTop: "2px" }}>
                    {room.capacity} Persons
                  </div>
                </div>

                <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)" }}>
                  <span style={{ fontSize: "11px", color: "var(--outline)", textTransform: "uppercase", fontWeight: "700" }}>Room Type</span>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--on-surface)", marginTop: "2px" }}>
                    {room.typeLabel || "Academic Space"}
                  </div>
                </div>

                <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)" }}>
                  <span style={{ fontSize: "11px", color: "var(--outline)", textTransform: "uppercase", fontWeight: "700" }}>Campus Sector</span>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--on-surface)", marginTop: "2px" }}>
                    {room.campusSector || "Main Campus"}
                  </div>
                </div>

                <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)" }}>
                  <span style={{ fontSize: "11px", color: "var(--outline)", textTransform: "uppercase", fontWeight: "700" }}>Custodian</span>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--on-surface)", marginTop: "2px" }}>
                    {room.custodian || "Facilities Team"}
                  </div>
                </div>
              </div>

              {/* Facilities & Equipment Section */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--on-surface)", margin: 0 }}>
                  Facilities &amp; AV Equipment
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                  {(room.facilities || [
                    "Projector",
                    "High-Speed Wi-Fi 6E",
                    "Air Conditioning",
                    "Whiteboard",
                    "Power Outlets",
                  ]).map((facility, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        backgroundColor: "var(--surface-container-lowest)",
                        border: "1px solid #e2e8f0",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "var(--on-surface)",
                      }}
                    >
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: "18px" }}>
                        verified
                      </span>
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule - Visual Timeline */}
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
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--on-surface)", margin: 0 }}>
                  Today's Schedule &amp; Timetable
                </h3>
                <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: "2px 0 0" }}>
                  Visual timeline of booked and available slots for {date}
                </p>
              </div>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  height: "32px",
                  padding: "0 8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                  color: "var(--on-surface)",
                }}
              />
            </div>

            {/* Timeline Blocks */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {timelineHours.map((hour, idx) => {
                const booked = isSlotBooked(hour);
                const booking = getSlotBooking(hour);
                const nextHour = timelineHours[idx + 1] || "20:00";

                return (
                  <div
                    key={hour}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor: booked ? "rgba(220, 225, 255, 0.45)" : "var(--surface-container-low)",
                      border: `1px solid ${booked ? "#b7c4ff" : "#e2e8f0"}`,
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ width: "90px", fontFamily: "var(--font-mono)", fontWeight: "600", color: "var(--on-surface-variant)" }}>
                      {hour} – {nextHour}
                    </span>

                    {booked ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                        <span style={{ fontWeight: "700", color: "var(--primary-container)" }}>
                          {booking?.purpose} ({booking?.userName})
                        </span>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: "var(--primary-container)",
                            color: "#ffffff",
                            fontSize: "10px",
                            fontWeight: "700",
                          }}
                        >
                          Booked
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                        <span style={{ color: "#059669", fontWeight: "600" }}>Open Slot</span>
                        <button
                          onClick={() => {
                            setStartTime(hour);
                            setEndTime(nextHour);
                          }}
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "var(--primary-container)",
                            backgroundColor: "#ffffff",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          Select Slot
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Direct Booking Panel (4 cols) */}
        <div style={{ gridColumn: "span 4" }} className="room-details-right">
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
              position: "sticky",
              top: "84px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "22px" }}>
                  calendar_add_on
                </span>
                <h2 style={{ fontSize: "17px", fontWeight: "700", color: "var(--on-surface)", margin: 0 }}>
                  Reserve This Space
                </h2>
              </div>
            </div>

            <form onSubmit={handleBookSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
                    Number of Attendees
                  </label>
                  <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--outline)" }}>
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

              {/* Collision Validation */}
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
                  style={{
                    fontSize: "18px",
                    color: validation.isAvailable ? "#059669" : "#dc2626",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  {validation.isAvailable ? "check_circle" : "error"}
                </span>
                <div>
                  <span style={{ fontWeight: "700" }}>
                    {validation.isAvailable ? "Slot Free & Ready" : "Collision Warning"}
                  </span>
                  <div style={{ fontSize: "11px", marginTop: "2px" }}>
                    {validation.message || "No conflicts detected."}
                  </div>
                </div>
              </div>

              {/* Book Room Button */}
              <button
                type="submit"
                disabled={!validation.isAvailable || isSubmitting}
                className="btn-primary"
                style={{
                  width: "100%",
                  height: "42px",
                  opacity: !validation.isAvailable ? 0.6 : 1,
                  cursor: !validation.isAvailable ? "not-allowed" : "pointer",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  check_circle
                </span>
                <span>{isSubmitting ? "Confirming..." : "Book Room"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Pass Modal */}
      {confirmedBooking && (
        <KeycardPassModal
          booking={confirmedBooking}
          isOpen={true}
          onClose={() => setConfirmedBooking(null)}
        />
      )}

      <style>{`
        @media (max-width: 1024px) {
          .room-details-left, .room-details-right {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RoomDetailsPage;
