import React from "react";

export const StatCard = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendPositive = true,
  actionText,
  onAction,
  variant = "default", // default or gradient
}) => {
  const isGradient = variant === "gradient";

  return (
    <div
      style={{
        borderRadius: "16px",
        backgroundColor: isGradient ? "transparent" : "var(--surface-container-lowest)",
        backgroundImage: isGradient
          ? "linear-gradient(135deg, var(--primary-container) 0%, var(--primary) 100%)"
          : "none",
        color: isGradient ? "#ffffff" : "var(--on-surface)",
        padding: "20px",
        boxShadow: isGradient ? "var(--shadow-md)" : "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: isGradient ? "none" : "1px solid #f1f5f9",
        minHeight: "135px",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      className="stat-card"
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: isGradient ? "rgba(255, 255, 255, 0.85)" : "var(--on-surface-variant)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            {title}
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "4px" }}>
            <span
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "30px",
                fontWeight: "700",
                lineHeight: "1",
                color: isGradient ? "#ffffff" : "var(--on-surface)",
              }}
            >
              {value}
            </span>
            {unit && (
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: isGradient ? "rgba(255, 255, 255, 0.8)" : "var(--on-surface-variant)",
                }}
              >
                {unit}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            backgroundColor: isGradient ? "rgba(255, 255, 255, 0.16)" : "var(--surface-container-low)",
            color: isGradient ? "#ffffff" : "var(--primary-container)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: isGradient ? "blur(4px)" : "none",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
            {icon}
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          paddingTop: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12px",
          color: isGradient ? "rgba(255, 255, 255, 0.9)" : "var(--on-surface-variant)",
        }}
      >
        {trend && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: "600",
              color: isGradient ? "#ffffff" : trendPositive ? "var(--primary-container)" : "#dc2626",
            }}
          >
            {trend}
          </span>
        )}
        {actionText && (
          <button
            onClick={onAction}
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: isGradient ? "#ffffff" : "var(--primary-container)",
              backgroundColor: isGradient ? "rgba(255, 255, 255, 0.2)" : "transparent",
              padding: isGradient ? "3px 8px" : "0",
              borderRadius: "4px",
            }}
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default StatCard;
