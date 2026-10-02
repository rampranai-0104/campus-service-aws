import React from "react";
import Modal from "../common/Modal";

export const RequestSubmittedModal = ({ booking, isOpen, onClose }) => {
  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reservation Request Submitted" maxWidth="460px">
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
        {/* Status card */}
        <div
          style={{
            width: "100%",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
            color: "#ffffff",
            padding: "22px",
            boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.85 }}>
                Allocation Request • In Review
              </span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", margin: "2px 0 0" }}>
                {booking.roomName}
              </h3>
              <p style={{ fontSize: "12px", opacity: 0.9, margin: 0 }}>
                {booking.building}
              </p>
            </div>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "9999px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(4px)",
                fontSize: "11px",
                fontWeight: "700",
                fontFamily: "var(--font-mono)",
              }}
            >
              {booking.roomCode || "RM"}
            </div>
          </div>

          {/* Time & Date */}
          <div
            style={{
              margin: "18px 0 14px",
              padding: "12px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div>
              <span style={{ fontSize: "10px", textTransform: "uppercase", opacity: 0.75 }}>Date</span>
              <div style={{ fontSize: "13px", fontWeight: "700" }}>{booking.date}</div>
            </div>
            <div>
              <span style={{ fontSize: "10px", textTransform: "uppercase", opacity: 0.75 }}>Time Window</span>
              <div style={{ fontSize: "13px", fontWeight: "700" }}>
                {booking.startTime} – {booking.endTime}
              </div>
            </div>
          </div>

          {/* Pending Access Notice */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              color: "#0f172a",
              borderRadius: "12px",
              padding: "14px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#fef3c7",
                color: "#b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                schedule
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#b45309", textTransform: "uppercase" }}>
                Status: Pending Approval
              </span>
              <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>
                Door PIN and NFC keycard pass will be generated once facilities approves.
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", opacity: 0.85 }}>
            <span>Requester: {booking.userName}</span>
            <span>Attendees: {booking.attendeeCount}</span>
          </div>
        </div>

        {/* Guidance */}
        <div style={{ width: "100%", fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>
          <p style={{ margin: "0 0 6px" }}>
            <strong>What happens next?</strong> Campus Facilities will review your reservation. You can track this request anytime in <strong>My Bookings</strong>.
          </p>
          <p style={{ margin: 0 }}>
            Once approved, your electronic door PIN will unlock the room automatically 10 minutes prior to scheduled start.
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn-primary"
          style={{ width: "100%", height: "40px" }}
        >
          View in My Bookings
        </button>
      </div>
    </Modal>
  );
};

export default RequestSubmittedModal;
