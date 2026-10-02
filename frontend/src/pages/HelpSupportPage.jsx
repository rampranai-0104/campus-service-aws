import React, { useState } from "react";
import { useNotifications } from "../context/NotificationContext";

export const HelpSupportPage = () => {
  const { showToast } = useNotifications();
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketRoom, setTicketRoom] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    showToast("Support ticket submitted to Campus Facilities! Ticket #TK-" + Math.floor(1000 + Math.random() * 9000), "success");
    setTicketSubject("");
    setTicketRoom("");
    setTicketMsg("");
  };

  const faqs = [
    {
      q: "How do I unlock the room when I arrive?",
      a: "Tap your physical university ID badge on the electronic lock RFID scanner, or type your 4-digit PIN followed by '#' on the digital keypad. The door unlocks automatically 10 minutes prior to your reserved slot.",
    },
    {
      q: "What happens if I reserve while in offline mode?",
      a: "Thanks to AWS Amplify DataStore, your reservation is instantaneously saved to local IndexedDB on your browser. When your connection resumes, the background queue reconciles with AWS AppSync and verifies conflict status.",
    },
    {
      q: "How far in advance can I book rooms?",
      a: "Faculty and staff can reserve spaces up to 90 days in advance. Undergrad and graduate students can book study pods and collaboration labs up to 14 days in advance.",
    },
    {
      q: "What should I do if the AV projector or equipment is broken?",
      a: "Please report the issue immediately using the Facilities Support Ticket form below or mark the room for maintenance from the Admin portal. Our technical team responds within 15 minutes.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto" }} className="help-page animate-fade-in">
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
          <span>Support</span>
          <span style={{ color: "var(--outline)" }}>/</span>
          <span style={{ color: "var(--on-surface-variant)" }}>Guidelines &amp; Help Desk</span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
          Help &amp; Campus Booking Policies
        </h1>
        <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
          Frequently asked questions, door access guides, and facilities technical support.
        </p>
      </div>

      {/* FAQs */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          padding: "24px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0, color: "var(--on-surface)" }}>
          Frequently Asked Questions
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                backgroundColor: "var(--surface-container-low)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--on-surface)" }}>
                {faq.q}
              </span>
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0, lineHeight: "1.5" }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Facilities Support Ticket Form */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          padding: "24px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0, color: "var(--on-surface)" }}>
          Submit Facilities &amp; Equipment Support Ticket
        </h3>

        <form onSubmit={handleTicketSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Issue Subject
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Projector HDMI not connecting"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Room / Facility
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Turing Lab 204"
                value={ticketRoom}
                onChange={(e) => setTicketRoom(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
              Detailed Description
            </label>
            <textarea
              className="form-input"
              style={{ height: "80px", padding: "8px 12px", resize: "none" }}
              placeholder="Describe the issue observed in the space..."
              value={ticketMsg}
              onChange={(e) => setTicketMsg(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start", padding: "0 22px" }}>
            Submit Ticket
          </button>
        </form>
      </div>
    </div>
  );
};

export default HelpSupportPage;
