import React, { useState } from "react";
import { useNotifications } from "../context/NotificationContext";

export const NotificationsPage = () => {
  const { notifications, markAllRead } = useNotifications();
  const [filter, setFilter] = useState("all");

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case "BOOKING_CONFIRMED":
        return { icon: "check_circle", color: "#16a34a", bg: "#f0fdf4" };
      case "BOOKING_CANCELLED":
        return { icon: "cancel", color: "#dc2626", bg: "#fef2f2" };
      case "REQUEST_APPROVED":
        return { icon: "verified", color: "#1d4ed8", bg: "#eff6ff" };
      case "REQUEST_REJECTED":
        return { icon: "error", color: "#dc2626", bg: "#fef2f2" };
      case "MAINTENANCE_ALERT":
        return { icon: "build_circle", color: "#d97706", bg: "#fffbeb" };
      case "SYSTEM":
        return { icon: "cloud_sync", color: "#2563eb", bg: "#eff6ff" };
      default:
        return { icon: "notifications", color: "#1d4ed8", bg: "#eff6ff" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto" }} className="notifications-page animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            <span>Management</span>
            <span style={{ color: "var(--outline)" }}>/</span>
            <span style={{ color: "var(--on-surface-variant)" }}>Activity Alerts</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
            Notifications &amp; System Alerts
          </h1>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
            Real-time reservation confirmations, keycard PIN dispatches, and Amplify DataStore sync logs.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={markAllRead} className="btn-secondary" style={{ height: "36px", fontSize: "12px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              done_all
            </span>
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", backgroundColor: "var(--surface-container-high)", padding: "3px", borderRadius: "10px", width: "fit-content" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "6px 14px",
            borderRadius: "7px",
            fontSize: "12px",
            fontWeight: filter === "all" ? "700" : "500",
            backgroundColor: filter === "all" ? "var(--surface-container-lowest)" : "transparent",
            color: filter === "all" ? "var(--primary-container)" : "var(--on-surface-variant)",
            boxShadow: filter === "all" ? "var(--shadow-xs)" : "none",
          }}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          style={{
            padding: "6px 14px",
            borderRadius: "7px",
            fontSize: "12px",
            fontWeight: filter === "unread" ? "700" : "500",
            backgroundColor: filter === "unread" ? "var(--surface-container-lowest)" : "transparent",
            color: filter === "unread" ? "var(--primary-container)" : "var(--on-surface-variant)",
            boxShadow: filter === "unread" ? "var(--shadow-xs)" : "none",
          }}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notification List */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          border: "1px solid #f1f5f9",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--outline)" }}>
            No notifications in this view.
          </div>
        ) : (
          filtered.map((n) => {
            const iconObj = getIcon(n.type);

            return (
              <div
                key={n.id}
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #f8fafc",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  backgroundColor: !n.isRead ? "rgba(239, 244, 255, 0.35)" : "transparent",
                  transition: "background-color 0.15s ease",
                }}
                className="hover:bg-slate-50/70"
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: iconObj.bg,
                    color: iconObj.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    {iconObj.icon}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--on-surface)" }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--outline)", fontFamily: "var(--font-mono)" }}>
                      {n.timestamp || "Recent"}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0, lineHeight: "1.4" }}>
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
