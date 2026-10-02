import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/common/StatusBadge";
import KeycardPassModal from "../components/booking/KeycardPassModal";
import Modal from "../components/common/Modal";

export const MyBookingsPage = ({ onNavigate }) => {
  const { bookings, cancelBooking } = useBooking();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedPass, setSelectedPass] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const myBookings = bookings.filter((b) => b.userId === currentUser?.id);

  const filteredBookings = myBookings.filter((b) => {
    if (activeTab === "upcoming") {
      return (
        b.status !== "CANCELLED" &&
        b.status !== "COMPLETED" &&
        b.date >= todayStr
      );
    }
    if (activeTab === "past") {
      return b.status === "COMPLETED" || b.date < todayStr;
    }
    if (activeTab === "cancelled") {
      return b.status === "CANCELLED" || b.status === "REJECTED";
    }
    if (activeTab === "offline") {
      return b.syncState === "PENDING_LOCAL";
    }
    return true;
  });

  const upcomingCount = myBookings.filter(
    (b) => b.status !== "CANCELLED" && b.status !== "COMPLETED" && b.date >= todayStr
  ).length;

  const pastCount = myBookings.filter(
    (b) => b.status === "COMPLETED" || b.date < todayStr
  ).length;

  const cancelledCount = myBookings.filter(
    (b) => b.status === "CANCELLED" || b.status === "REJECTED"
  ).length;

  const offlineCount = myBookings.filter((b) => b.syncState === "PENDING_LOCAL").length;

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      cancelBooking(bookingToCancel.id, cancelReason);
      setBookingToCancel(null);
      setCancelReason("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="my-bookings-page animate-fade-in">
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            <span>Management</span>
            <span style={{ color: "var(--outline)" }}>/</span>
            <span style={{ color: "var(--on-surface-variant)" }}>Campus Access</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
            My Bookings &amp; Reservations
          </h1>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
            View your active room bookings, digital electronic access passes, and history.
          </p>
        </div>

        <button
          onClick={() => onNavigate("rooms")}
          className="btn-primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            add
          </span>
          <span>Book Another Space</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div
        style={{
          display: "flex",
          backgroundColor: "var(--surface-container-high)",
          padding: "4px",
          borderRadius: "12px",
          width: "fit-content",
          gap: "4px",
        }}
      >
        <button
          onClick={() => setActiveTab("upcoming")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: activeTab === "upcoming" ? "700" : "500",
            backgroundColor: activeTab === "upcoming" ? "var(--surface-container-lowest)" : "transparent",
            color: activeTab === "upcoming" ? "var(--primary-container)" : "var(--on-surface-variant)",
            boxShadow: activeTab === "upcoming" ? "var(--shadow-xs)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>Upcoming</span>
          <span style={{ padding: "1px 6px", borderRadius: "9999px", backgroundColor: "var(--primary-fixed)", color: "var(--on-primary-fixed)", fontSize: "11px" }}>
            {upcomingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("past")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: activeTab === "past" ? "700" : "500",
            backgroundColor: activeTab === "past" ? "var(--surface-container-lowest)" : "transparent",
            color: activeTab === "past" ? "var(--primary-container)" : "var(--on-surface-variant)",
            boxShadow: activeTab === "past" ? "var(--shadow-xs)" : "none",
          }}
        >
          Past ({pastCount})
        </button>

        <button
          onClick={() => setActiveTab("cancelled")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: activeTab === "cancelled" ? "700" : "500",
            backgroundColor: activeTab === "cancelled" ? "var(--surface-container-lowest)" : "transparent",
            color: activeTab === "cancelled" ? "var(--primary-container)" : "var(--on-surface-variant)",
            boxShadow: activeTab === "cancelled" ? "var(--shadow-xs)" : "none",
          }}
        >
          Cancelled ({cancelledCount})
        </button>

        {offlineCount > 0 && (
          <button
            onClick={() => setActiveTab("offline")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: activeTab === "offline" ? "700" : "500",
              backgroundColor: activeTab === "offline" ? "var(--surface-container-lowest)" : "transparent",
              color: activeTab === "offline" ? "var(--amber-800)" : "var(--on-surface-variant)",
              boxShadow: activeTab === "offline" ? "var(--shadow-xs)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>Offline Queued</span>
            <span style={{ padding: "1px 6px", borderRadius: "9999px", backgroundColor: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: "700" }}>
              {offlineCount}
            </span>
          </button>
        )}
      </div>

      {/* Bookings List Cards */}
      {filteredBookings.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            borderRadius: "16px",
            backgroundColor: "var(--surface-container-lowest)",
            border: "1px solid #f1f5f9",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span className="material-symbols-outlined text-outline" style={{ fontSize: "40px" }}>
            event_busy
          </span>
          <h3 style={{ fontSize: "18px", fontWeight: "700" }}>No {activeTab} bookings</h3>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0 }}>
            {activeTab === "upcoming"
              ? "You do not have any upcoming reservations at this moment."
              : "No reservations found in this category."}
          </p>
          <button onClick={() => onNavigate("rooms")} className="btn-primary" style={{ marginTop: "8px" }}>
            Browse Campus Spaces
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              style={{
                borderRadius: "16px",
                backgroundColor: "var(--surface-container-lowest)",
                border: "1px solid #f1f5f9",
                boxShadow: "var(--shadow-sm)",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                transition: "all 0.15s ease",
              }}
              className="hover:shadow-md"
            >
              {/* Left Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "260px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "var(--surface-container)",
                    color: "var(--primary-container)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    fontWeight: "800",
                    flexShrink: 0,
                  }}
                >
                  {b.roomCode || "RM"}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--on-surface)", margin: 0 }}>
                      {b.roomName}
                    </h3>
                    <StatusBadge status={b.status} syncState={b.syncState} size="sm" />
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>
                    {b.building}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--primary-container)", fontWeight: "600", marginTop: "2px" }}>
                    Purpose: {b.purpose}
                  </span>
                </div>
              </div>

              {/* Schedule Info */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "160px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                  Date &amp; Time
                </span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--on-surface)" }}>
                  {b.date}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--on-surface-variant)" }}>
                  {b.startTime} – {b.endTime}
                </span>
              </div>

              {/* Access PIN Pill */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "120px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                  Door PIN
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "16px",
                    fontWeight: "800",
                    letterSpacing: "0.08em",
                    color: "var(--primary-container)",
                  }}
                >
                  {b.keycardPin ? `***${b.keycardPin.slice(-2)}` : "Pending Approval"}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => setSelectedPass(b)}
                  className="btn-primary"
                  style={{ height: "36px", padding: "0 14px", fontSize: "12px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    badge
                  </span>
                  <span>View Pass</span>
                </button>

                {b.status !== "CANCELLED" && (
                  <button
                    onClick={() => setBookingToCancel(b)}
                    className="btn-destructive"
                    style={{ height: "36px", padding: "0 12px" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      close
                    </span>
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Digital Keycard Pass Modal */}
      <KeycardPassModal
        booking={selectedPass}
        isOpen={Boolean(selectedPass)}
        onClose={() => setSelectedPass(null)}
      />

      {/* Cancellation Confirmation Dialog */}
      <Modal
        isOpen={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        title="Confirm Cancellation"
        maxWidth="440px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0 }}>
            Are you sure you want to cancel your reservation for{" "}
            <strong>{bookingToCancel?.roomName}</strong> on {bookingToCancel?.date}?
            This space will be immediately made available for other researchers and students.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
              Reason for Cancellation
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rescheduled / Met online"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <button
              onClick={() => setBookingToCancel(null)}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Keep Space
            </button>
            <button
              onClick={handleConfirmCancel}
              className="btn-destructive"
              style={{ flex: 1 }}
            >
              Cancel Reservation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookingsPage;
