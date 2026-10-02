import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";
import { useNotifications } from "../../context/NotificationContext";
import { awsConfig } from "../../aws/amplifyConfig";

export const Sidebar = ({ activePath, onNavigate, mobileOpen, onCloseMobile }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { bookings, isOnline, syncStatus, tickets = [] } = useBooking();
  const { unreadCount } = useNotifications();

  // Active bookings count for this user (Student / Faculty)
  const myBookingsCount = bookings.filter(
    (b) => b.userId === currentUser?.userId && b.status !== "CANCELLED"
  ).length;

  const pendingRequestsCount = bookings.filter((b) => b.status === "PENDING").length;
  const openTicketsCount = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  const handleNav = (path) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(11, 28, 48, 0.4)",
            zIndex: 49,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: "240px",
          backgroundColor: "var(--surface-container-lowest)",
          borderRight: "1px solid #f1f5f9",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: mobileOpen ? "translateX(0)" : "translateX(0)",
          transition: "transform 0.25s ease",
        }}
        className="sidebar"
      >
        {/* Top Branding & Nav */}
        <div style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {/* Logo Header */}
          <div
            style={{
              height: "64px",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderBottom: "1px solid #f8fafc",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                backgroundColor: "var(--primary-container)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <path d="M12 36V18L24 10L36 18V36" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 36V24H27V36" fill="white"/>
                <circle cx="24" cy="18" r="3" fill="#93C5FD"/>
                <circle cx="36" cy="14" r="3" fill="#10B981"/>
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "var(--primary-container)",
                  letterSpacing: "-0.02em",
                  lineHeight: "1.1",
                }}
              >
                CampusRoom
              </span>
              <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                University Workspace
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: "3px" }}>
            {/* General Section */}
            <div style={{ padding: "6px 8px 3px", fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              General
            </div>

            <button
              onClick={() => handleNav("dashboard")}
              className={`nav-button ${activePath === "dashboard" ? "active" : ""}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                  dashboard
                </span>
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => handleNav("rooms")}
              className={`nav-button ${activePath === "rooms" ? "active" : ""}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                  meeting_room
                </span>
                <span>Rooms</span>
              </div>
            </button>

            <button
              onClick={() => handleNav("calendar")}
              className={`nav-button ${activePath === "calendar" ? "active" : ""}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                  calendar_today
                </span>
                <span>Calendar</span>
              </div>
            </button>

            {!isAdmin && (
              <button
                onClick={() => handleNav("quick-book")}
                className={`nav-button ${activePath === "quick-book" ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                    bolt
                  </span>
                  <span>Quick Book</span>
                </div>
              </button>
            )}

            {/* Management Section */}
            <div style={{ padding: "14px 8px 3px", fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Management
            </div>

            {!isAdmin && (
              <button
                onClick={() => handleNav("my-bookings")}
                className={`nav-button ${activePath === "my-bookings" ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                    bookmark_added
                  </span>
                  <span>My Bookings</span>
                </div>
                {myBookingsCount > 0 && (
                  <span
                    style={{
                      padding: "1px 7px",
                      borderRadius: "9999px",
                      backgroundColor: "var(--primary-fixed)",
                      color: "var(--on-primary-fixed)",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {myBookingsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => handleNav("notifications")}
              className={`nav-button ${activePath === "notifications" ? "active" : ""}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                  notifications
                </span>
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: "9999px",
                    backgroundColor: "var(--primary-container)",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Admin Section (Restricted to Admin Cognito Group) */}
            {isAdmin && (
              <>
                <div style={{ padding: "14px 8px 3px", fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Admin Control</span>
                  <span style={{ fontSize: "9px", color: "var(--primary-container)", fontWeight: "700", textTransform: "uppercase" }}>
                    Verified
                  </span>
                </div>

                <button
                  onClick={() => handleNav("admin")}
                  className={`nav-button ${activePath === "admin" ? "active" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                      space_dashboard
                    </span>
                    <span>Admin Dashboard</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav("room-management")}
                  className={`nav-button ${activePath === "room-management" ? "active" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                      domain
                    </span>
                    <span>Room Management</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav("booking-requests")}
                  className={`nav-button ${activePath === "booking-requests" ? "active" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                      rule
                    </span>
                    <span>Booking Requests</span>
                  </div>
                  {pendingRequestsCount > 0 && (
                    <span
                      style={{
                        padding: "1px 6px",
                        borderRadius: "9999px",
                        backgroundColor: "var(--secondary-container)",
                        color: "var(--on-secondary-fixed)",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {pendingRequestsCount} pending
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNav("analytics")}
                  className={`nav-button ${activePath === "analytics" ? "active" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                      monitoring
                    </span>
                    <span>Analytics & Use</span>
                  </div>
                </button>
              </>
            )}

            {/* System Section */}
            <div style={{ padding: "14px 8px 3px", fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              System
            </div>

            <button
              onClick={() => handleNav("settings")}
              className={`nav-button ${activePath === "settings" ? "active" : ""}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                  settings
                </span>
                <span>Settings & AWS</span>
              </div>
            </button>

            <button
              onClick={() => handleNav("help")}
              className={`nav-button ${activePath === "help" ? "active" : ""}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                  help_outline
                </span>
                <span>Help & Support</span>
              </div>
              {openTicketsCount > 0 && (
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: "9999px",
                    backgroundColor: "var(--primary-container)",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {openTicketsCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Profile & AWS Connection Status */}
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid #f8fafc" }}>
          {/* Truthful AWS AppSync Status Pill */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "12px",
              backgroundColor: !isOnline ? "var(--amber-50)" : "var(--surface-container-low)",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: !isOnline ? "var(--amber-800)" : "var(--on-surface-variant)" }}>
                AWS AppSync Live
              </span>
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: !isOnline ? "var(--amber-500)" : syncStatus === "SYNCING" ? "#3b82f6" : "#10b981",
                }}
                className={syncStatus === "SYNCING" ? "animate-pulse" : ""}
              />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: !isOnline ? "#b45309" : "var(--on-surface)", fontWeight: "500" }}>
              {!isOnline ? "OFFLINE" : `${syncStatus || "ONLINE • SYNCED"} (${awsConfig.aws_project_region})`}
            </span>
            <span style={{ fontSize: "10px", color: "var(--on-surface-variant)" }}>
              {!isOnline ? "No network connection" : "Real-time subscriptions active"}
            </span>
          </div>

          {/* User Profile Card */}
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              backgroundColor: "var(--surface-container-lowest)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
              <img
                src={currentUser?.avatarUrl}
                alt={currentUser?.name}
                style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--on-surface)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUser?.name}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--on-surface-variant)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUser?.roleLabel}
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                if (currentUser) {
                  await logout();
                }
                handleNav("login");
              }}
              title={currentUser ? "Sign Out" : "Sign In"}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--on-surface-variant)",
              }}
              className="hover:text-red-600 hover:bg-red-50"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>
                {currentUser ? "logout" : "login"}
              </span>
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        .nav-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
          color: var(--on-surface-variant);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
          background: transparent;
        }
        .nav-button:hover {
          background-color: var(--surface-container-low);
          color: var(--on-surface);
        }
        .nav-button.active {
          background-color: var(--primary-container);
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .nav-button.active .material-symbols-outlined {
          color: #ffffff;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
