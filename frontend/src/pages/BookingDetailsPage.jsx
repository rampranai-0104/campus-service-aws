import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import StatusBadge from "../components/common/StatusBadge";
import KeycardPassModal from "../components/booking/KeycardPassModal";
import Modal from "../components/common/Modal";

export const BookingDetailsPage = ({ booking, onBack, onNavigate }) => {
  const { cancelBooking } = useBooking();
  const [showPassModal, setShowPassModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (!booking) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>No reservation selected</h3>
        <button onClick={onBack} className="btn-primary" style={{ marginTop: "10px" }}>
          Back to My Bookings
        </button>
      </div>
    );
  }

  const handleConfirmCancel = () => {
    cancelBooking(booking.id, cancelReason);
    setShowCancelModal(false);
    if (onBack) onBack();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto" }} className="booking-details-page animate-fade-in">
      {/* Top Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "var(--primary-container)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
          <span>Back</span>
        </button>

        <StatusBadge status={booking.status} syncState={booking.syncState} />
      </div>

      {/* Main Reservation Card */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          padding: "28px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
              Reservation Confirmation #{booking.id}
            </span>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--on-surface)", margin: "4px 0 0" }}>
              {booking.roomName}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: "2px 0 0" }}>
              {booking.building}
            </p>
          </div>

          <button onClick={() => setShowPassModal(true)} className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>badge</span>
            <span>View Digital Pass</span>
          </button>
        </div>

        {/* Schedule & Pass Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
          <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Date</span>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--on-surface)", marginTop: "2px" }}>
              {booking.date}
            </div>
          </div>

          <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Time Slot</span>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--on-surface)", marginTop: "2px" }}>
              {booking.startTime} – {booking.endTime}
            </div>
          </div>

          <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Electronic PIN</span>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary-container)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
              {booking.keycardPin || "Pending"}
            </div>
          </div>

          <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Host / Organizer</span>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--on-surface)", marginTop: "2px" }}>
              {booking.userName}
            </div>
          </div>
        </div>

        {/* Purpose & Attendees */}
        <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>Stated Purpose:</span>
            <span style={{ fontSize: "13px", fontWeight: "700" }}>{booking.purpose}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>Expected Attendees:</span>
            <span style={{ fontSize: "13px", fontWeight: "700" }}>{booking.attendeeCount} persons</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>Backend Sync Status:</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#059669" }}>{booking.syncState || "LIVE • AWS AppSync"}</span>
          </div>
        </div>

        {/* Cancellation and Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => onNavigate("my-bookings")} className="btn-secondary">
            View All My Bookings
          </button>

          {booking.status !== "CANCELLED" && (
            <button onClick={() => setShowCancelModal(true)} className="btn-destructive">
              Cancel This Reservation
            </button>
          )}
        </div>
      </div>

      {/* Keycard Pass Modal */}
      <KeycardPassModal
        booking={booking}
        isOpen={showPassModal}
        onClose={() => setShowPassModal(false)}
      />

      {/* Cancellation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Confirm Cancellation"
        maxWidth="440px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0 }}>
            Are you sure you want to cancel this booking for {booking.roomName}?
          </p>
          <input
            type="text"
            className="form-input"
            placeholder="Cancellation reason..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowCancelModal(false)} className="btn-secondary" style={{ flex: 1 }}>
              Back
            </button>
            <button onClick={handleConfirmCancel} className="btn-destructive" style={{ flex: 1 }}>
              Confirm Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingDetailsPage;
