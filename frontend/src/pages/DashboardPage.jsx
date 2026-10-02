import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/common/StatCard";
import RoomCard from "../components/common/RoomCard";
import AvailabilityMatrix from "../components/dashboard/AvailabilityMatrix";
import QuickBookingWidget from "../components/dashboard/QuickBookingWidget";
import AllocationProgress from "../components/dashboard/AllocationProgress";
import UpcomingBookingsTable from "../components/dashboard/UpcomingBookingsTable";
import KeycardPassModal from "../components/booking/KeycardPassModal";

export const DashboardPage = ({ onNavigate, onSelectRoom }) => {
  const { rooms, bookings } = useBooking();
  const { currentUser } = useAuth();

  const [widgetPrefill, setWidgetPrefill] = useState(null);
  const [selectedPassBooking, setSelectedPassBooking] = useState(null);

  const availableRooms = rooms.filter((r) => r.status === "AVAILABLE");
  const myBookings = bookings.filter(
    (b) => (b.userId === currentUser?.userId || b.userId === currentUser?.id || b.userId === currentUser?.username) && b.status !== "CANCELLED"
  );
  const nextBooking = myBookings[0] || null;

  const handleQuickReserveFromCard = (room) => {
    setWidgetPrefill({
      building: room.building,
      roomId: room.id,
      purpose: `${currentUser?.role === "STUDENT" ? "Student Study" : "Academic Research"} Session`,
    });
    // Scroll to quick booking panel
    const el = document.getElementById("quick-booking-panel");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectMatrixSlot = (slot) => {
    setWidgetPrefill({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    const el = document.getElementById("quick-booking-panel");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayConfirmed = bookings.filter((b) => b.date === todayStr && b.status === "CONFIRMED");
  const pendingRequests = bookings.filter((b) => b.status === "PENDING");
  const availPct = rooms.length > 0 ? Math.round((availableRooms.length / rooms.length) * 100) : 0;

  // Unique buildings
  const buildingsCount = new Set(rooms.map((r) => r.building).filter(Boolean)).size;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="dashboard-page animate-fade-in">
      {/* Page Header Area */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
              Academic Room Dashboard
            </h1>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "9999px",
                backgroundColor: "#ecfdf5",
                color: "#059669",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              LIVE AWS
            </span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
            Real-time room availability, quick booking, and schedule overview across campus complexes.
          </p>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Schedule Button */}
          <button
            onClick={() => onNavigate("calendar")}
            className="btn-secondary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--secondary)" }}>
              calendar_month
            </span>
            <span>Check Schedule</span>
          </button>

          {/* New Reservation Button */}
          <button
            onClick={() => {
              const el = document.getElementById("quick-booking-panel");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-primary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              add_circle
            </span>
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Top Statistics Row (4 Cards) - All Live AWS Data */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard
          title="Total Campus Rooms"
          value={rooms.length}
          unit="Rooms"
          icon="domain"
          trend={`${buildingsCount} campus complex${buildingsCount === 1 ? "" : "es"}`}
          actionText={`${buildingsCount} Complexes →`}
          onAction={() => onNavigate("rooms")}
        />

        <StatCard
          title="Available Right Now"
          value={availableRooms.length}
          unit="Rooms"
          icon="meeting_room"
          trend={`● ${availPct}% immediate capacity`}
          actionText="Filter open →"
          onAction={() => onNavigate("rooms")}
        />

        <StatCard
          title="Today's Reservations"
          value={todayConfirmed.length}
          unit="Bookings"
          icon="history_edu"
          trend={`${todayConfirmed.length} Confirmed • ${pendingRequests.length} Pending`}
          actionText="My Bookings →"
          onAction={() => onNavigate("my-bookings")}
        />

        <StatCard
          variant="gradient"
          title="My Upcoming Bookings"
          value={myBookings.length}
          unit="Sessions"
          icon="badge"
          trend={nextBooking ? `${nextBooking.roomCode} @ ${nextBooking.startTime}` : "None upcoming"}
          actionText={nextBooking ? "View Pass" : "Book Room"}
          onAction={() => {
            if (nextBooking) setSelectedPassBooking(nextBooking);
            else onNavigate("rooms");
          }}
        />
      </div>

      {/* Main Grid: Left Matrix & Quick Walk-In (65%) | Right Widget & Status (35%) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "24px",
          alignItems: "start",
        }}
        className="dashboard-main-grid"
      >
        {/* Left Column (8 cols / ~65%) */}
        <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", gap: "24px" }} className="dashboard-left-col">
          {/* Availability Matrix */}
          <AvailabilityMatrix onSelectSlot={handleSelectMatrixSlot} />

          {/* Available for Immediate Walk-In */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--on-surface)", margin: 0 }}>
                  Available for Immediate Walk-In
                </h2>
                <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: "2px 0 0" }}>
                  Validated zero-conflict spaces ready for instant keycard access
                </p>
              </div>
              <button
                onClick={() => onNavigate("rooms")}
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--primary-container)",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <span>Explore all {availableRooms.length} rooms</span>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  chevron_right
                </span>
              </button>
            </div>

            {/* 3 Rich Room Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              {availableRooms.slice(0, 3).map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  compact={true}
                  onBook={handleQuickReserveFromCard}
                  onViewDetails={() => onSelectRoom && onSelectRoom(room)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols / ~35%) */}
        <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: "24px" }} className="dashboard-right-col">
          <QuickBookingWidget prefill={widgetPrefill} />
          <AllocationProgress />
        </div>
      </div>

      {/* Bottom Section: Upcoming Bookings & Offline Queue Table */}
      <UpcomingBookingsTable />

      {/* Digital Pass Modal */}
      <KeycardPassModal
        booking={selectedPassBooking}
        isOpen={Boolean(selectedPassBooking)}
        onClose={() => setSelectedPassBooking(null)}
      />

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-left-col, .dashboard-right-col {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
