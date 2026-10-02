import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import StatusBadge from "../components/common/StatusBadge";
import RequestActionModal from "../components/admin/RequestActionModal";

export const BookingRequestsPage = () => {
  const { bookings, loadData, isLoadingData } = useBooking();
  const [filter, setFilter] = useState("PENDING");
  const [activeAction, setActiveAction] = useState(null); // { booking, type: 'approve' | 'reject' | 'reassign' }

  const requests = bookings.filter((b) => {
    if (filter === "ALL") return true;
    return b.status === filter;
  });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="booking-requests-page animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            <span>Admin Approvals</span>
            <span style={{ color: "var(--outline)" }}>/</span>
            <span style={{ color: "var(--on-surface-variant)" }}>Space Allocation Queue</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
            Booking Allocation Requests
          </h1>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
            Review, approve, reject, or reassign faculty and student reservation requests for high-capacity halls and labs.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => loadData?.()}
            disabled={isLoadingData}
            className="btn-secondary"
            style={{ height: "36px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}
          >
            <span className={`material-symbols-outlined ${isLoadingData ? "animate-spin" : ""}`} style={{ fontSize: "16px" }}>
              sync
            </span>
            <span>{isLoadingData ? "Refreshing..." : "Refresh Queue"}</span>
          </button>

          {/* Filter Tabs */}
          <div style={{ display: "flex", backgroundColor: "var(--surface-container-high)", padding: "3px", borderRadius: "10px" }}>
            {["PENDING", "CONFIRMED", "REJECTED", "ALL"].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: filter === st ? "700" : "500",
                  backgroundColor: filter === st ? "var(--surface-container-lowest)" : "transparent",
                  color: filter === st ? "var(--primary-container)" : "var(--on-surface-variant)",
                  boxShadow: filter === st ? "var(--shadow-xs)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span>{st}</span>
                {st === "PENDING" && pendingCount > 0 && (
                  <span style={{ padding: "1px 6px", borderRadius: "9999px", backgroundColor: "var(--secondary-container)", color: "var(--on-secondary-fixed)", fontSize: "10px", fontWeight: "700" }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          border: "1px solid #f1f5f9",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "rgba(239, 244, 255, 0.7)", color: "var(--on-surface-variant)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                <th style={{ padding: "12px 18px" }}>Requester</th>
                <th style={{ padding: "12px 18px" }}>Requested Space</th>
                <th style={{ padding: "12px 18px" }}>Date &amp; Hours</th>
                <th style={{ padding: "12px 18px" }}>Purpose &amp; Headcount</th>
                <th style={{ padding: "12px 18px" }}>Status</th>
                <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "36px", textAlign: "center", color: "var(--outline)" }}>
                    No booking requests in this category.
                  </td>
                </tr>
              ) : (
                requests.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #f8fafc" }} className="hover:bg-slate-50/60">
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "var(--surface-container)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-container)", fontWeight: "700" }}>
                          {b.userName.charAt(0)}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: "700", color: "var(--on-surface)" }}>{b.userName}</span>
                          <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>{b.userRole}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "600", color: "var(--on-surface)" }}>{b.roomName}</span>
                        <span style={{ fontSize: "11px", color: "var(--outline)" }}>{b.building}</span>
                      </div>
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "600", color: "var(--on-surface)" }}>{b.date}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--on-surface-variant)" }}>
                          {b.startTime} – {b.endTime}
                        </span>
                        {b.createdAt && (
                          <span style={{ fontSize: "10px", color: "var(--outline)", marginTop: "2px" }}>
                            Req: {new Date(b.createdAt).toLocaleDateString()} {new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "500", color: "var(--on-surface)" }}>{b.purpose}</span>
                        <span style={{ fontSize: "11px", color: "var(--outline)" }}>{b.attendeeCount} expected attendees</span>
                        {b.adminNotes && (
                          <span style={{ fontSize: "11px", color: "var(--primary-container)", fontStyle: "italic", marginTop: "2px" }}>
                            Note: {b.adminNotes}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      <StatusBadge status={b.status} size="sm" />
                    </td>

                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      {b.status === "PENDING" ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            onClick={() => setActiveAction({ booking: b, type: "approve" })}
                            className="btn-primary"
                            style={{ height: "30px", padding: "0 10px", fontSize: "11px" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setActiveAction({ booking: b, type: "reject" })}
                            className="btn-destructive"
                            style={{ height: "30px", padding: "0 10px", fontSize: "11px" }}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setActiveAction({ booking: b, type: "reassign" })}
                            className="btn-secondary"
                            style={{ height: "30px", padding: "0 10px", fontSize: "11px" }}
                          >
                            Reassign
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--outline)" }}>
                          {b.status === "CONFIRMED" ? `Approved (PIN: ${b.keycardPin})` : "Resolved"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog */}
      {activeAction && (
        <RequestActionModal
          booking={activeAction.booking}
          actionType={activeAction.type}
          isOpen={Boolean(activeAction)}
          onClose={() => setActiveAction(null)}
        />
      )}
    </div>
  );
};

export default BookingRequestsPage;
