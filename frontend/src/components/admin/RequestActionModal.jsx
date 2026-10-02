import React, { useState } from "react";
import Modal from "../common/Modal";
import { useBooking } from "../../context/BookingContext";

export const RequestActionModal = ({ booking, actionType, isOpen, onClose }) => {
  const { rooms, approveBooking, rejectBooking, reassignBooking } = useBooking();
  const [adminNote, setAdminNote] = useState("");
  const [selectedNewRoomId, setSelectedNewRoomId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!booking) return null;

  const availableAlternativeRooms = rooms.filter(
    (r) => r.id !== booking.roomId && r.status === "AVAILABLE" && r.capacity >= booking.attendeeCount
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let result;
      if (actionType === "approve") {
        result = await approveBooking(booking.id, adminNote || "Approved by Facilities Department");
      } else if (actionType === "reject") {
        result = await rejectBooking(booking.id, adminNote || "Unavailable due to scheduled academic exam");
      } else if (actionType === "reassign") {
        if (!selectedNewRoomId) {
          setErrorMessage("Please select an alternative room.");
          setIsSubmitting(false);
          return;
        }
        result = await reassignBooking(booking.id, selectedNewRoomId);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || "Action could not be completed due to a conflict or validation error.");
      } else {
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (actionType === "approve") return `Approve Request for ${booking.roomName}`;
    if (actionType === "reject") return `Reject Request for ${booking.roomName}`;
    return `Reassign Booking for ${booking.roomName}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} maxWidth="480px">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Booking Details Card */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            backgroundColor: "var(--surface-container-low)",
            fontSize: "13px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--outline)" }}>Requester:</span>
            <strong>{booking.userName} ({booking.userRole})</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--outline)" }}>Scheduled:</span>
            <strong>{booking.date} ({booking.startTime} – {booking.endTime})</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--outline)" }}>Purpose:</span>
            <span>{booking.purpose}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--outline)" }}>Attendees:</span>
            <strong>{booking.attendeeCount} persons</strong>
          </div>
        </div>

        {/* Error / Conflict Alert */}
        {errorMessage && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              color: "#991b1b",
              fontSize: "12px",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#dc2626", flexShrink: 0 }}>
              error
            </span>
            <div style={{ lineHeight: "1.4" }}>
              <strong>Action Blocked:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* Reassignment Dropdown */}
        {actionType === "reassign" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
              Select Alternative Space
            </label>
            <select
              className="form-select"
              value={selectedNewRoomId}
              onChange={(e) => setSelectedNewRoomId(e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="">-- Choose an alternative room --</option>
              {availableAlternativeRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.building}) — Cap: {r.capacity}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Note / Reason Field */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
            {actionType === "reject" ? "Reason for Rejection *" : "Internal Admin Notes (Optional)"}
          </label>
          <textarea
            className="form-input"
            style={{ height: "70px", padding: "8px 12px", resize: "none" }}
            placeholder={actionType === "reject" ? "State reason to inform the requester..." : "e.g. Verified projector and microphone setup."}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            required={actionType === "reject"}
            disabled={isSubmitting}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={actionType === "reject" ? "btn-destructive" : "btn-primary"}
            style={{ flex: 1.2, opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
          >
            {isSubmitting
              ? "Processing..."
              : actionType === "approve"
              ? "Confirm Approval"
              : actionType === "reject"
              ? "Confirm Rejection"
              : "Confirm Reassignment"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RequestActionModal;
