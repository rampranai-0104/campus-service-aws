import React, { useState } from "react";
import Modal from "../common/Modal";
import { useBooking } from "../../context/BookingContext";

export const TicketActionModal = ({ ticket, isOpen, onClose }) => {
  const { updateSupportTicket } = useBooking();
  const [status, setStatus] = useState(() => ticket?.status || "IN_PROGRESS");
  const [adminResponse, setAdminResponse] = useState(() => ticket?.adminResponse || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const res = await updateSupportTicket(ticket.id, {
      status,
      adminResponse: adminResponse.trim(),
    });

    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || "Failed to update ticket.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Ticket #TK-${ticket.id.slice(-6).toUpperCase()}`} maxWidth="500px">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Ticket Details summary */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            backgroundColor: "var(--surface-container-low)",
            fontSize: "13px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--outline)" }}>Requester:</span>
            <strong>{ticket.userName} ({ticket.userRole})</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--outline)" }}>Category &amp; Priority:</span>
            <span><strong>{ticket.category}</strong> • {ticket.priority}</span>
          </div>
          {ticket.roomName && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--outline)" }}>Location:</span>
              <span>{ticket.roomName}</span>
            </div>
          )}
          <div style={{ marginTop: "4px" }}>
            <strong style={{ color: "var(--on-surface)" }}>{ticket.subject}</strong>
            <p style={{ margin: "2px 0 0", color: "var(--on-surface-variant)", fontSize: "12px", lineHeight: "1.4" }}>
              {ticket.description}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "#fef2f2", color: "#991b1b", fontSize: "12px" }}>
            {errorMsg}
          </div>
        )}

        {/* Status Dropdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
            Update Ticket Status *
          </label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isSubmitting}
            required
          >
            <option value="OPEN">OPEN (Under Initial Review)</option>
            <option value="IN_PROGRESS">IN PROGRESS (Dispatched / Repairing)</option>
            <option value="RESOLVED">RESOLVED (Fixed / Completed)</option>
            <option value="CLOSED">CLOSED (Archived)</option>
          </select>
        </div>

        {/* Admin Response Note */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
            Facilities Administrative Response
          </label>
          <textarea
            className="form-input"
            style={{ height: "80px", padding: "8px 12px", resize: "none" }}
            placeholder="e.g. Technician dispatched to replace HDMI adapter. Issue resolved."
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ flex: 1.5 }}>
            {isSubmitting ? "Updating..." : "Save Ticket Status"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TicketActionModal;
