import React, { useState } from "react";
import { useBooking } from "../../context/BookingContext";
import { useNotifications } from "../../context/NotificationContext";
import StatusBadge from "../common/StatusBadge";
import KeycardPassModal from "../booking/KeycardPassModal";
import Modal from "../common/Modal";

export const UpcomingBookingsTable = () => {
  const { bookings, cancelBooking } = useBooking();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState("all");
  const [selectedPassBooking, setSelectedPassBooking] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return b.status !== "CANCELLED";
    if (activeTab === "confirmed") return b.status === "CONFIRMED";
    if (activeTab === "pending") return b.status === "PENDING";
    return true;
  });

  const allCount = bookings.filter((b) => b.status !== "CANCELLED").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  const handleCheckIn = (booking) => {
    showToast(`Checked in to ${booking.roomName}! Door latch unlocked.`, "success");
  };

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      cancelBooking(bookingToCancel.id, cancelReason);
      setBookingToCancel(null);
      setCancelReason("");
    }
  };

  const handleExportIcs = () => {
    showToast("Downloaded campus_schedule.ics calendar file!", "info");
  };

  return (
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
      {/* Table Header & Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--on-surface)", margin: 0 }}>
            Upcoming Reservations &amp; Active Sessions
          </h2>
          <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: "2px 0 0" }}>
            Real-time status of reservations synchronized with AWS AppSync
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--surface-container-low)",
              padding: "2px",
              borderRadius: "8px",
            }}
          >
            <button
              onClick={() => setActiveTab("all")}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: activeTab === "all" ? "700" : "500",
                backgroundColor: activeTab === "all" ? "var(--surface-container-lowest)" : "transparent",
                color: activeTab === "all" ? "var(--primary-container)" : "var(--on-surface-variant)",
                boxShadow: activeTab === "all" ? "var(--shadow-xs)" : "none",
              }}
            >
              All ({allCount})
            </button>
            <button
              onClick={() => setActiveTab("confirmed")}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: activeTab === "confirmed" ? "700" : "500",
                backgroundColor: activeTab === "confirmed" ? "var(--surface-container-lowest)" : "transparent",
                color: activeTab === "confirmed" ? "var(--primary-container)" : "var(--on-surface-variant)",
                boxShadow: activeTab === "confirmed" ? "var(--shadow-xs)" : "none",
              }}
            >
              Confirmed ({confirmedCount})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: activeTab === "pending" ? "700" : "500",
                backgroundColor: activeTab === "pending" ? "var(--surface-container-lowest)" : "transparent",
                color: activeTab === "pending" ? "var(--primary-container)" : "var(--on-surface-variant)",
                boxShadow: activeTab === "pending" ? "var(--shadow-xs)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>Pending Local Sync</span>
              {pendingCount > 0 && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--amber-500)",
                  }}
                />
              )}
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportIcs}
            style={{
              height: "32px",
              padding: "0 10px",
              borderRadius: "8px",
              backgroundColor: "var(--surface-container-low)",
              color: "var(--on-surface-variant)",
              fontSize: "12px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              border: "1px solid #e2e8f0",
            }}
            className="hover:bg-slate-100"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              file_download
            </span>
            <span>Export (.ics)</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", margin: "0 -4px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "rgba(239, 244, 255, 0.7)",
                color: "var(--on-surface-variant)",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              <th style={{ padding: "10px 14px", borderRadius: "8px 0 0 8px" }}>Room &amp; Facility</th>
              <th style={{ padding: "10px 14px" }}>Date &amp; Schedule</th>
              <th style={{ padding: "10px 14px" }}>Purpose</th>
              <th style={{ padding: "10px 14px" }}>Host / Faculty</th>
              <th style={{ padding: "10px 14px" }}>Amplify Sync State</th>
              <th style={{ padding: "10px 14px", textAlign: "right", borderRadius: "0 8px 8px 0" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "28px", textAlign: "center", color: "var(--outline)" }}>
                  No reservations found for this view.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr
                  key={b.id}
                  style={{
                    borderBottom: "1px solid #f8fafc",
                    backgroundColor: b.syncState === "PENDING_LOCAL" ? "rgba(254, 243, 199, 0.25)" : "transparent",
                    transition: "background-color 0.15s ease",
                  }}
                  className="hover:bg-slate-50/60"
                >
                  {/* Room */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          backgroundColor:
                            b.syncState === "PENDING_LOCAL" ? "#fef3c7" : "var(--surface-container)",
                          color: b.syncState === "PENDING_LOCAL" ? "#92400e" : "var(--primary-container)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          fontWeight: "700",
                          flexShrink: 0,
                        }}
                      >
                        {b.roomCode || "RM"}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "700", color: "var(--on-surface)" }}>
                          {b.roomName}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                          {b.building}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Schedule */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "600", color: "var(--on-surface)" }}>
                        {b.date}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--on-surface-variant)" }}>
                        {b.startTime} – {b.endTime}
                      </span>
                    </div>
                  </td>

                  {/* Purpose */}
                  <td style={{ padding: "12px 14px", color: "var(--on-surface)", fontWeight: "500", maxWidth: "200px" }}>
                    <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {b.purpose}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--outline)" }}>
                      {b.attendeeCount} attendees
                    </span>
                  </td>

                  {/* Host */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--outline)" }}>
                        account_circle
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: "500" }}>{b.userName}</span>
                    </div>
                  </td>

                  {/* Sync State */}
                  <td style={{ padding: "12px 14px" }}>
                    <StatusBadge status={b.status} syncState={b.syncState} size="sm" />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        onClick={() => handleCheckIn(b)}
                        style={{
                          padding: "4px 9px",
                          borderRadius: "6px",
                          backgroundColor: "var(--primary-container)",
                          color: "#ffffff",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                        title="Instant Check-in"
                      >
                        Check-in
                      </button>

                      <button
                        onClick={() => setSelectedPassBooking(b)}
                        style={{
                          padding: "4px 9px",
                          borderRadius: "6px",
                          backgroundColor: "var(--surface-container-low)",
                          color: "var(--primary-container)",
                          fontSize: "11px",
                          fontWeight: "600",
                          border: "1px solid #e2e8f0",
                        }}
                        title="View Keycard Pass"
                      >
                        Pass PIN
                      </button>

                      <button
                        onClick={() => setBookingToCancel(b)}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--error)",
                        }}
                        className="hover:bg-red-50"
                        title="Cancel Reservation"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                          close
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Digital Pass Modal */}
      <KeycardPassModal
        booking={selectedPassBooking}
        isOpen={Boolean(selectedPassBooking)}
        onClose={() => setSelectedPassBooking(null)}
      />

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        title="Cancel Reservation"
        maxWidth="440px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0 }}>
            Are you sure you want to cancel the booking for{" "}
            <strong>{bookingToCancel?.roomName}</strong> on {bookingToCancel?.date} (
            {bookingToCancel?.startTime} – {bookingToCancel?.endTime})?
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
              Cancellation Reason (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Schedule conflict / Rescheduled"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              onClick={() => setBookingToCancel(null)}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Keep Booking
            </button>
            <button
              onClick={handleConfirmCancel}
              className="btn-destructive"
              style={{ flex: 1 }}
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UpcomingBookingsTable;
