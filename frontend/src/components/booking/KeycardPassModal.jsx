import React from "react";
import Modal from "../common/Modal";
import StatusBadge from "../common/StatusBadge";

export const KeycardPassModal = ({ booking, isOpen, onClose }) => {
  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Keycard Access Pass" maxWidth="460px">
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
        {/* Pass Card Container */}
        <div
          style={{
            width: "100%",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #1d4ed8 0%, #0037b0 100%)",
            color: "#ffffff",
            padding: "20px",
            boxShadow: "0 10px 25px -5px rgba(29, 78, 216, 0.3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Header in Pass */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.8 }}>
                Campus Access Credential
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
              margin: "18px 0",
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

          {/* Door Access PIN & Simulated QR */}
          <div
            style={{
              backgroundColor: "#ffffff",
              color: "#0f172a",
              borderRadius: "12px",
              padding: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                Electronic Door PIN
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "24px",
                  fontWeight: "800",
                  letterSpacing: "0.15em",
                  color: "#1d4ed8",
                }}
              >
                {booking.keycardPin || "8392"}
              </span>
              <span style={{ fontSize: "10px", color: "#059669", fontWeight: "600" }}>
                ✓ NFC Card & Keypad Active
              </span>
            </div>

            {/* Simulated QR Code graphic */}
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#f8fafc",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "3px",
                padding: "4px",
              }}
              title="Scanner QR Code"
            >
              <div style={{ backgroundColor: "#0f172a", borderRadius: "2px" }} />
              <div style={{ backgroundColor: "#0f172a", borderRadius: "2px" }} />
              <div style={{ backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
              <div style={{ backgroundColor: "#0f172a", borderRadius: "2px" }} />
              <div style={{ backgroundColor: "#ffffff" }} />
              <div style={{ backgroundColor: "#0f172a", borderRadius: "2px" }} />
              <div style={{ backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
              <div style={{ backgroundColor: "#0f172a", borderRadius: "2px" }} />
              <div style={{ backgroundColor: "#0f172a", borderRadius: "2px" }} />
            </div>
          </div>

          {/* Footer note */}
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", opacity: 0.85 }}>
            <span>Host: {booking.userName}</span>
            <span>Attendees: {booking.attendeeCount}</span>
          </div>
        </div>

        {/* Guidance */}
        <div style={{ width: "100%", fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>
          <p style={{ margin: "0 0 6px" }}>
            <strong>How to Access:</strong> Tap your physical campus ID card against the door reader, or type the 4-digit PIN followed by <strong>#</strong> on the keypad.
          </p>
          <p style={{ margin: 0 }}>
            Doors unlock automatically 10 minutes prior to scheduled start time.
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn-primary"
          style={{ width: "100%", height: "40px" }}
        >
          Done
        </button>
      </div>
    </Modal>
  );
};

export default KeycardPassModal;
