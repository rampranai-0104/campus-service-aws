import React from "react";
import { useNotifications } from "../../context/NotificationContext";

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "76px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "400px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => {
        let bgColor = "var(--surface-container-lowest)";
        let borderColor = "#e2e8f0";
        let icon = "info";
        let iconColor = "var(--primary-container)";

        if (toast.type === "success") {
          bgColor = "#f0fdf4";
          borderColor = "#86efac";
          icon = "check_circle";
          iconColor = "#16a34a";
        } else if (toast.type === "warning") {
          bgColor = "#fffbeb";
          borderColor = "#fde68a";
          icon = "warning";
          iconColor = "#d97706";
        } else if (toast.type === "error") {
          bgColor = "#fef2f2";
          borderColor = "#fca5a5";
          icon = "error";
          iconColor = "#dc2626";
        }

        return (
          <div
            key={toast.id}
            className="animate-fade-in"
            style={{
              pointerEvents: "auto",
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.1)",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: iconColor, fontSize: "20px", marginTop: "1px" }}
            >
              {icon}
            </span>
            <div style={{ flex: 1, fontSize: "13px", fontWeight: "500", color: "#0f172a" }}>
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px",
                borderRadius: "4px",
              }}
              title="Dismiss"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                close
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
