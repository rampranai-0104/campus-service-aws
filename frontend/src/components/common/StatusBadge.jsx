import React from "react";

export const StatusBadge = ({ status, syncState, size = "md" }) => {
  const isSmall = size === "sm";

  // Check sync state first if provided
  if (syncState === "PENDING_LOCAL") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: isSmall ? "2px 8px" : "4px 10px",
          borderRadius: "9999px",
          backgroundColor: "var(--amber-100)",
          color: "var(--amber-800)",
          fontSize: isSmall ? "11px" : "12px",
          fontWeight: "600",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "var(--amber-500)",
          }}
        />
        <span>Pending Local Sync</span>
      </span>
    );
  }

  // Room Statuses
  if (status === "AVAILABLE" || status === "Open" || status === "Instant") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: isSmall ? "2px 8px" : "4px 10px",
          borderRadius: "9999px",
          backgroundColor: "#10b981",
          color: "#ffffff",
          fontSize: isSmall ? "11px" : "12px",
          fontWeight: "600",
        }}
      >
        <span
          className="animate-pulse"
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
          }}
        />
        <span>Available Now</span>
      </span>
    );
  }

  if (status === "MAINTENANCE") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: isSmall ? "2px 8px" : "4px 10px",
          borderRadius: "9999px",
          backgroundColor: "#fef3c7",
          color: "#b45309",
          fontSize: isSmall ? "11px" : "12px",
          fontWeight: "600",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
          build
        </span>
        <span>Maintenance</span>
      </span>
    );
  }

  if (status === "OCCUPIED" || status === "In-Session") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: isSmall ? "2px 8px" : "4px 10px",
          borderRadius: "9999px",
          backgroundColor: "var(--surface-container-high)",
          color: "var(--primary-container)",
          fontSize: isSmall ? "11px" : "12px",
          fontWeight: "600",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "var(--primary-container)",
          }}
        />
        <span>Occupied</span>
      </span>
    );
  }

  // Booking Statuses
  if (status === "CONFIRMED") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: isSmall ? "2px 8px" : "4px 10px",
          borderRadius: "9999px",
          backgroundColor: "#ecfdf5",
          color: "#047857",
          fontSize: isSmall ? "11px" : "12px",
          fontWeight: "600",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#10b981",
          }}
        />
        <span>Confirmed • Synced</span>
      </span>
    );
  }

  if (status === "PENDING") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: isSmall ? "2px 8px" : "4px 10px",
          borderRadius: "9999px",
          backgroundColor: "#fffbeb",
          color: "#b45309",
          fontSize: isSmall ? "11px" : "12px",
          fontWeight: "600",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#f59e0b",
          }}
        />
        <span>Pending Approval</span>
      </span>
    );
  }

  if (status === "CANCELLED" || status === "REJECTED") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: isSmall ? "2px 8px" : "4px 10px",
          borderRadius: "9999px",
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          fontSize: isSmall ? "11px" : "12px",
          fontWeight: "600",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
          cancel
        </span>
        <span>{status === "REJECTED" ? "Rejected" : "Cancelled"}</span>
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: isSmall ? "2px 8px" : "4px 10px",
        borderRadius: "9999px",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        fontSize: isSmall ? "11px" : "12px",
        fontWeight: "500",
      }}
    >
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
