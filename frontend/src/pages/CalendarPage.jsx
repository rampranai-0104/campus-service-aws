import React, { useState, useMemo } from "react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import BookingModal from "../components/booking/BookingModal";
import KeycardPassModal from "../components/booking/KeycardPassModal";

export const CalendarPage = () => {
  const { rooms = [], bookings = [], refreshData, isLoadingData } = useBooking();
  const { currentUser, isAdmin } = useAuth();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "confirmed" | "pending"
  const [modalRoom, setModalRoom] = useState(null);
  const [selectedPass, setSelectedPass] = useState(null);

  const hours = useMemo(
    () => [
      "08:00", "09:00", "10:00", "11:00", "12:00",
      "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
    ],
    []
  );

  // Dynamic buildings from actual live rooms
  const buildings = useMemo(() => {
    const set = new Set();
    rooms.forEach((r) => {
      if (r.building) set.add(r.building);
    });
    return Array.from(set).sort();
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (selectedBuilding !== "all" && r.building !== selectedBuilding) {
        return false;
      }
      return true;
    });
  }, [rooms, selectedBuilding]);

  // Determine active booking occupying or requested for a specific room & hour
  const getBookingForRoomAndHour = (roomId, hour) => {
    return bookings.find((b) => {
      if (b.roomId !== roomId) return false;
      if (b.date !== selectedDate) return false;
      // CANCELLED and REJECTED must NOT appear as active reservations
      if (b.status === "CANCELLED" || b.status === "REJECTED") return false;

      // Status filter check
      if (statusFilter === "confirmed" && b.status !== "CONFIRMED") return false;
      if (statusFilter === "pending" && b.status !== "PENDING") return false;

      // If booking is PENDING, only Admin or the requester can see the pending request
      if (b.status === "PENDING" && !isAdmin && b.userId !== currentUser?.userId && b.userId !== currentUser?.id) {
        return false;
      }

      return b.startTime <= hour && b.endTime > hour;
    });
  };

  const activeReservationsCount = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.date === selectedDate &&
        (b.status === "CONFIRMED" || (b.status === "PENDING" && (isAdmin || b.userId === currentUser?.userId)))
    ).length;
  }, [bookings, selectedDate, isAdmin, currentUser?.userId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="calendar-page animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            <span>Operations</span>
            <span style={{ color: "var(--outline)" }}>/</span>
            <span style={{ color: "var(--on-surface-variant)" }}>Live Master Timetable</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
            Master Room Calendar
          </h1>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
            Live schedule powered directly by AWS AppSync DynamoDB records. Click any confirmed reservation to view pass, or open slots to reserve.
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Date Picker */}
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

          {/* Dynamic Building Filter */}
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
              <option value="all">All Campus Buildings ({buildings.length})</option>
              {buildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div style={{ display: "flex", backgroundColor: "var(--surface-container-low)", padding: "2px", borderRadius: "8px" }}>
            {[
              { id: "all", label: "All" },
              { id: "confirmed", label: "Confirmed" },
              { id: "pending", label: "Pending" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: statusFilter === st.id ? "700" : "500",
                  backgroundColor: statusFilter === st.id ? "var(--surface-container-lowest)" : "transparent",
                  color: statusFilter === st.id ? "var(--primary-container)" : "var(--on-surface-variant)",
                  boxShadow: statusFilter === st.id ? "var(--shadow-xs)" : "none",
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refreshData && refreshData()}
            className="btn-secondary"
            title="Reload live calendar bookings from AWS"
            style={{ height: "36px", padding: "0 12px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              sync
            </span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Ribbon */}
      <div
        style={{
          padding: "10px 16px",
          borderRadius: "10px",
          backgroundColor: "var(--surface-container-low)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "var(--on-surface-variant)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>
            Viewing <strong>{filteredRooms.length}</strong> spaces for <strong>{selectedDate}</strong>
          </span>
          <span>•</span>
          <span style={{ color: "var(--primary-container)", fontWeight: "600" }}>
            {activeReservationsCount} active session{activeReservationsCount === 1 ? "" : "s"} scheduled
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "var(--primary-container)" }} />
            <span>Confirmed</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#f59e0b" }} />
            <span>Pending Review</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#fef3c7" }} />
            <span>Maintenance</span>
          </span>
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
        {filteredRooms.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--outline)" }}>
            {isLoadingData ? "Loading live spaces from AWS..." : "No rooms match the selected building filter."}
          </div>
        ) : (
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
                        flexShrink: 0,
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
                          title={`${room.name} is currently under maintenance`}
                        >
                          Maint
                        </div>
                      );
                    }

                    if (booking) {
                      const isPending = booking.status === "PENDING";
                      return (
                        <div
                          key={hour}
                          onClick={() => setSelectedPass(booking)}
                          style={{
                            height: "38px",
                            borderRadius: "6px",
                            backgroundColor: isPending ? "#f59e0b" : "var(--primary-container)",
                            color: "#ffffff",
                            padding: "2px 5px",
                            fontSize: "10px",
                            fontWeight: "600",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            overflow: "hidden",
                            transition: "transform 0.1s ease",
                          }}
                          className="hover:scale-102"
                          title={`${isPending ? "[PENDING REVIEW] " : ""}${booking.purpose} (${booking.userName}) | ${booking.startTime} – ${booking.endTime}`}
                        >
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: "700" }}>
                            {isPending ? "⏳ Review" : booking.purpose}
                          </span>
                          <span style={{ opacity: 0.85, fontSize: "9px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {booking.userName}
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
        )}
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
