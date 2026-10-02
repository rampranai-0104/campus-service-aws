import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/common/StatusBadge";

export const HelpSupportPage = () => {
  const { rooms = [], tickets = [], createSupportTicket, isLoadingData } = useBooking();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "my-tickets" | "faqs"

  // Ticket form state
  const [category, setCategory] = useState("Facilities");
  const [priority, setPriority] = useState("MEDIUM");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setFormError("Please fill out both the subject and description.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    const targetRoom = rooms.find((r) => r.id === selectedRoomId);

    const res = await createSupportTicket({
      roomId: selectedRoomId || undefined,
      roomName: targetRoom ? `${targetRoom.name} (${targetRoom.building})` : undefined,
      category,
      priority,
      subject: subject.trim(),
      description: description.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(`Support Ticket #${res.ticket.id.slice(-6).toUpperCase()} submitted successfully! Campus Facilities will inspect the request.`);
      setSubject("");
      setDescription("");
      setSelectedRoomId("");
      setCategory("Facilities");
      setPriority("MEDIUM");
    } else {
      setFormError(res.error || "Failed to submit support ticket. Please check your connection.");
    }
  };

  const getPriorityStyle = (p) => {
    switch (p) {
      case "URGENT":
        return { backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" };
      case "HIGH":
        return { backgroundColor: "#ffedd5", color: "#c2410c", border: "1px solid #fdba74" };
      case "MEDIUM":
        return { backgroundColor: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" };
      case "LOW":
      default:
        return { backgroundColor: "var(--surface-container)", color: "var(--on-surface-variant)", border: "1px solid #e2e8f0" };
    }
  };

  const getTicketStatusBadge = (status) => {
    switch (status) {
      case "OPEN":
        return <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#dbeafe", color: "#1d4ed8", fontSize: "11px", fontWeight: "700" }}>OPEN</span>;
      case "IN_PROGRESS":
        return <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#fef3c7", color: "#b45309", fontSize: "11px", fontWeight: "700" }}>IN PROGRESS</span>;
      case "RESOLVED":
        return <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#dcfce7", color: "#15803d", fontSize: "11px", fontWeight: "700" }}>RESOLVED</span>;
      case "CLOSED":
        return <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "var(--surface-container-high)", color: "var(--outline)", fontSize: "11px", fontWeight: "700" }}>CLOSED</span>;
      default:
        return <StatusBadge status={status} size="sm" />;
    }
  };

  const myTickets = tickets.filter(
    (t) => t.userId === currentUser?.userId || t.userId === currentUser?.id
  );

  const faqs = [
    {
      q: "How do I unlock the room when I arrive?",
      a: "Tap your physical university ID badge on the electronic lock RFID scanner, or type your 4-digit PIN followed by '#' on the digital keypad. The door unlocks automatically 10 minutes prior to your reserved slot.",
    },
    {
      q: "How does real-time conflict checking work?",
      a: "CampusRoom connects directly to Amazon AppSync and DynamoDB with atomic transactions. When you request a space, the server-side conflict engine verifies that no overlapping confirmed reservation exists before confirming your booking.",
    },
    {
      q: "How far in advance can I book rooms?",
      a: "Faculty and staff can reserve spaces up to 90 days in advance. Undergrad and graduate students can book study pods and collaboration labs up to 14 days in advance.",
    },
    {
      q: "What should I do if the AV projector or equipment is broken?",
      a: "Please report the issue immediately using the Facilities Support Ticket form above or contact Campus Facilities. Technicians receive real-time notifications for urgent equipment and maintenance requests.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "860px", margin: "0 auto" }} className="help-page animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            <span>Support &amp; Facilities</span>
            <span style={{ color: "var(--outline)" }}>/</span>
            <span style={{ color: "var(--on-surface-variant)" }}>Campus Help Desk</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
            Help &amp; Facilities Support
          </h1>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
            Submit equipment repair tickets, track maintenance requests, and review campus space booking policies.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", backgroundColor: "var(--surface-container-low)", padding: "3px", borderRadius: "10px" }}>
          {[
            { id: "submit", label: "New Support Ticket", icon: "add_circle" },
            { id: "my-tickets", label: `My Tickets (${myTickets.length})`, icon: "confirmation_number" },
            { id: "faqs", label: "Policies & FAQs", icon: "help" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: activeTab === tab.id ? "700" : "500",
                backgroundColor: activeTab === tab.id ? "var(--surface-container-lowest)" : "transparent",
                color: activeTab === tab.id ? "var(--primary-container)" : "var(--on-surface-variant)",
                boxShadow: activeTab === tab.id ? "var(--shadow-xs)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SUBMIT NEW TICKET */}
      {activeTab === "submit" && (
        <div
          style={{
            borderRadius: "16px",
            backgroundColor: "var(--surface-container-lowest)",
            padding: "24px",
            boxShadow: "var(--shadow-sm)",
            border: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--on-surface)" }}>
              Submit Facilities &amp; Equipment Support Ticket
            </h3>
            <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
              Report classroom hardware faults, network connectivity issues, or schedule physical sanitization.
            </p>
          </div>

          {/* Alert Messages */}
          {successMessage && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#059669" }}>
                  check_circle
                </span>
                <span>{successMessage}</span>
              </div>
              <button
                onClick={() => setActiveTab("my-tickets")}
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#059669",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                View Tickets →
              </button>
            </div>
          )}

          {formError && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#dc2626" }}>
                error
              </span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleTicketSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Category & Priority Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                  Category *
                </label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  <option value="Facilities">Facilities &amp; Infrastructure</option>
                  <option value="Equipment">Equipment &amp; Hardware</option>
                  <option value="Maintenance">Maintenance &amp; Repairs</option>
                  <option value="Cleaning">Sanitization &amp; Cleaning</option>
                  <option value="Electrical">Electrical &amp; Power</option>
                  <option value="Network">Wi-Fi &amp; Network</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                  Priority Level *
                </label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  <option value="LOW">Low (Informational / Minor)</option>
                  <option value="MEDIUM">Medium (Normal issue)</option>
                  <option value="HIGH">High (Disrupts academic activity)</option>
                  <option value="URGENT">Urgent (Safety / Immediate stoppage)</option>
                </select>
              </div>
            </div>

            {/* Room / Facility Dropdown (Live Rooms) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Target Room / Facility (Optional)
              </label>
              <select
                className="form-select"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">-- General Campus Grounds / None Specified --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code}) — {r.building} ({r.floor})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Issue Subject *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. HDMI port broken on presentation podium"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Description */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Detailed Description *
              </label>
              <textarea
                className="form-input"
                style={{ height: "90px", padding: "10px 12px", resize: "none" }}
                placeholder="Provide details about the issue, affected devices, or specific assistance required..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                alignSelf: "flex-start",
                padding: "0 24px",
                height: "38px",
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #ffffff",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <span>Submitting to AWS...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    send
                  </span>
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: MY SUPPORT TICKETS HISTORY */}
      {activeTab === "my-tickets" && (
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--on-surface)" }}>
                My Support Tickets
              </h3>
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
                Real-time status of facilities requests submitted from your account
              </p>
            </div>
            <button
              onClick={() => setActiveTab("submit")}
              className="btn-secondary"
              style={{ height: "32px", fontSize: "12px", padding: "0 12px" }}
            >
              + New Ticket
            </button>
          </div>

          {isLoadingData ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--outline)" }}>
              Loading ticket records...
            </div>
          ) : myTickets.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                backgroundColor: "var(--surface-container-low)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "var(--outline)" }}>
                inbox
              </span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--on-surface)" }}>
                No Support Tickets Yet
              </span>
              <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", maxWidth: "340px", margin: 0 }}>
                You have not submitted any equipment or facility tickets. If you notice a broken display or maintenance issue, submit a ticket above.
              </p>
              <button onClick={() => setActiveTab("submit")} className="btn-primary" style={{ marginTop: "6px" }}>
                Submit First Ticket
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {myTickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: "16px 18px",
                    borderRadius: "12px",
                    backgroundColor: "var(--surface-container-low)",
                    border: "1px solid #f1f5f9",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)" }}>
                          #TK-{t.id.slice(-6).toUpperCase()}
                        </span>
                        <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "var(--surface-container-high)", color: "var(--on-surface)" }}>
                          {t.category}
                        </span>
                        <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "4px", ...getPriorityStyle(t.priority) }}>
                          {t.priority}
                        </span>
                      </div>
                      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--on-surface)", margin: "4px 0 0" }}>
                        {t.subject}
                      </h4>
                    </div>
                    <div>{getTicketStatusBadge(t.status)}</div>
                  </div>

                  {t.roomName && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--on-surface-variant)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--primary-container)" }}>
                        meeting_room
                      </span>
                      <span>Location: <strong>{t.roomName}</strong></span>
                    </div>
                  )}

                  <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0, lineHeight: "1.5" }}>
                    {t.description}
                  </p>

                  {/* Admin Response section if present */}
                  {t.adminResponse && (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        backgroundColor: "var(--surface-container-lowest)",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary-container)" }}>
                        Facilities Admin Response:
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--on-surface)" }}>
                        {t.adminResponse}
                      </span>
                    </div>
                  )}

                  <div style={{ fontSize: "11px", color: "var(--outline)", borderTop: "1px solid #f1f5f9", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span>Submitted: {new Date(t.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    <span>Last updated: {new Date(t.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FAQs & POLICIES */}
      {activeTab === "faqs" && (
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
            Frequently Asked Questions &amp; Policies
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
      )}
    </div>
  );
};

export default HelpSupportPage;
