import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import BookingModal from "../components/booking/BookingModal";
import KeycardPassModal from "../components/booking/KeycardPassModal";

export const CalendarPage = () => {
  const { rooms, bookings } = useBooking();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [modalRoom, setModalRoom] = useState(null);
  const [selectedPass, setSelectedPass] = useState(null);

  const hours = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  const filteredRooms = rooms.filter((r) => {
    if (selectedBuilding !== "all" && !r.building.toLowerCase().includes(selectedBuilding.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getBookingForRoomAndHour = (roomId, hour) => {
    return bookings.find((b) => {
      if (b.roomId !== roomId) return false;
      if (b.date !== selectedDate) return false;
      if (b.status === "CANCELLED") return false;
      return b.startTime <= hour && b.endTime > hour;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="calendar-page animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            <span>General</span>
            <span style={{ color: "var(--outline)" }}>/</span>
            <span style={{ color: "var(--on-surface-variant)" }}>Campus Timetable</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
            Master Room Calendar
          </h1>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
            Real-time visual schedule across all campus sectors. Click any open slot to reserve immediately.
          </p>
        </div>

        {/* Date and Building Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--on-surface-variant)" }}>Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                height: "36px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
                backgroundColor: "var(--surface-container-lowest)",
                color: "var(--on-surface)",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--on-surface-variant)" }}>Building:</span>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              style={{
                height: "36px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
                backgroundColor: "var(--surface-container-lowest)",
                color: "var(--on-surface)",
              }}
            >
              <option value="all">All Buildings</option>
              <option value="Turing Computing">Turing Computing Complex</option>
              <option value="Science & Engineering">Science & Engineering Hall</option>
              <option value="Central Library">Central Library</option>
              <option value="Baker Humanities">Baker Humanities Center</option>
              <option value="BioTech">BioTech Research Center</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid #f1f5f9",
          overflowX: "auto",
        }}
      >
        <div style={{ minWidth: "900px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Header Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px repeat(12, 1fr)",
              gap: "4px",
              paddingBottom: "8px",
              borderBottom: "1px solid #f1f5f9",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              fontWeight: "700",
              color: "var(--outline)",
              textAlign: "center",
            }}
          >
            <div style={{ textAlign: "left", paddingLeft: "10px" }}>Room / Facility</div>
            {hours.map((h) => (
              <div key={h}>{h}</div>
            ))}
          </div>

          {/* Room Rows */}
          {filteredRooms.map((room) => {
            const isMaint = room.status === "MAINTENANCE";

            return (
              <div
                key={room.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "220px repeat(12, 1fr)",
                  gap: "4px",
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: "1px solid #f8fafc",
                }}
              >
                {/* Room Label */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      backgroundColor: "var(--surface-container)",
                      color: "var(--primary-container)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {room.code}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {room.name}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Cap: {room.capacity} • {room.building}
                    </span>
                  </div>
                </div>

                {/* 12 Hour Slots */}
                {hours.map((hour) => {
                  const booking = getBookingForRoomAndHour(room.id, hour);

                  if (isMaint) {
                    return (
                      <div
                        key={hour}
                        style={{
                          height: "38px",
                          borderRadius: "6px",
                          backgroundColor: "#fef3c7",
                          color: "#b45309",
                          fontSize: "10px",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Room Under Maintenance"
                      >
                        Maint
                      </div>
                    );
                  }

                  if (booking) {
                    return (
                      <div
                        key={hour}
                        onClick={() => setSelectedPass(booking)}
                        style={{
                          height: "38px",
                          borderRadius: "6px",
                          backgroundColor: "var(--primary-container)",
                          color: "#ffffff",
                          padding: "2px 4px",
                          fontSize: "10px",
                          fontWeight: "600",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          overflow: "hidden",
                        }}
                        title={`Booked: ${booking.purpose} (${booking.userName}) - Click for pass`}
                      >
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {booking.purpose}
                        </span>
                        <span style={{ opacity: 0.8, fontSize: "9px" }}>
                          {booking.userName.split(" ")[1] || booking.userName}
                        </span>
                      </div>
                    );
                  }

                  // Open Slot -> Click to book
                  return (
                    <button
                      key={hour}
                      onClick={() => setModalRoom(room)}
                      style={{
                        height: "38px",
                        borderRadius: "6px",
                        backgroundColor: "var(--surface-container-low)",
                        border: "1px dashed #cbd5e1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "transparent",
                        transition: "all 0.15s ease",
                      }}
                      className="hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600"
                      title={`${room.name} at ${hour} - Click to Reserve`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        add
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Dialog */}
      {modalRoom && (
        <BookingModal
          room={modalRoom}
          isOpen={Boolean(modalRoom)}
          onClose={() => setModalRoom(null)}
        />
      )}

      {/* Keycard Pass Dialog */}
      {selectedPass && (
        <KeycardPassModal
          booking={selectedPass}
          isOpen={Boolean(selectedPass)}
          onClose={() => setSelectedPass(null)}
        />
      )}
    </div>
  );
};

export default CalendarPage;
