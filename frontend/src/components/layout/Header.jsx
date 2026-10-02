import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";
import { useNotifications } from "../../context/NotificationContext";

export const Header = ({ onOpenMobile, onNavigate }) => {
  const { currentUser } = useAuth();
  const { isOnline, syncStatus, searchQuery, setSearchQuery } = useBooking();
  const { unreadCount } = useNotifications();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate("rooms");
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: "240px",
        right: 0,
        height: "64px",
        backgroundColor: "rgba(248, 249, 255, 0.94)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #f1f5f9",
        boxShadow: "0 1px 8px rgba(0,0,0,0.03)",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
      }}
      className="top-header"
    >
      {/* Left: Campus Info & Mobile Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <button
          onClick={onOpenMobile}
          className="mobile-menu-btn"
          style={{
            display: "none",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--surface-container-lowest)",
            border: "1px solid #e2e8f0",
          }}
          title="Open Menu"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            menu
          </span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--on-surface-variant)" }}>
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "18px" }}>
            school
          </span>
          <span style={{ fontWeight: "600" }}>Fall 2025</span>
          <span style={{ color: "var(--outline-variant)" }}>•</span>
          <span style={{ color: "var(--on-surface)", fontWeight: "600" }}>Main Campus</span>
        </div>
      </div>

      {/* Right: AWS Sync State, Global Search, Offline Toggle, Notifications & Persona Switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Truthful AWS Amplify AppSync Connection Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "9999px",
            backgroundColor: isOnline ? "var(--surface-container-lowest)" : "#fef2f2",
            border: `1px solid ${isOnline ? "#e2e8f0" : "#fecaca"}`,
            boxShadow: "var(--shadow-xs)",
            fontSize: "12px",
            fontWeight: "600",
            color: isOnline ? "var(--on-surface)" : "#991b1b",
          }}
          title={`Network status: ${syncStatus} (Amazon AppSync + DynamoDB)`}
          className="aws-sync-pill"
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: isOnline ? "#10b981" : "#ef4444",
            }}
            className={isOnline ? "" : "animate-pulse"}
          />
          <span className="hidden sm:inline">
            {isOnline ? "ONLINE • SYNCED" : "OFFLINE"}
          </span>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ position: "relative", width: "260px" }} className="search-form-header">
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "18px",
              color: "var(--outline)",
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search rooms, labs (Press /)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "36px",
              paddingLeft: "34px",
              paddingRight: "12px",
              borderRadius: "8px",
              backgroundColor: "var(--surface-container-lowest)",
              border: "1px solid #e2e8f0",
              color: "var(--on-surface)",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </form>

        {/* Notifications Icon Button */}
        <button
          onClick={() => onNavigate && onNavigate("notifications")}
          style={{
            position: "relative",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: "var(--surface-container-lowest)",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--on-surface-variant)",
          }}
          title="Notifications"
          className="hover:bg-slate-50"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            notifications
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--error)",
              }}
            />
          )}
        </button>

        {/* User Role Profile Badge */}
        {currentUser ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 12px 4px 6px",
              borderRadius: "9999px",
              backgroundColor: "var(--surface-container-lowest)",
              border: "1px solid #e2e8f0",
              boxShadow: "var(--shadow-xs)",
            }}
            title={`Signed in as ${currentUser.name} (${currentUser.email})`}
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }}
            />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--on-surface)" }}>
              {currentUser.role === "STAFF" ? "Faculty" : currentUser.role === "ADMIN" ? "Admin" : "Student"}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onNavigate && onNavigate("login")}
            className="btn-primary"
            style={{ height: "32px", padding: "0 12px", fontSize: "12px" }}
          >
            Sign In
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .top-header {
            left: 0 !important;
            padding: 0 16px !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .sidebar {
            transform: translateX(-100%) !important;
          }
          .sidebar.open {
            transform: translateX(0) !important;
          }
        }
        @media (max-width: 640px) {
          .search-form-header {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
