import React from "react";
import StatusBadge from "./StatusBadge";

export const RoomCard = ({
  room,
  onBook,
  onViewDetails,
  compact = false,
}) => {
  const isAvailable = room.status === "AVAILABLE";

  return (
    <div
      style={{
        borderRadius: "16px",
        backgroundColor: "var(--surface-container-lowest)",
        border: "1px solid #f1f5f9",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s ease-in-out",
      }}
      className="room-card group hover:shadow-md"
    >
      <div>
        {/* Image header with badges */}
        <div
          style={{
            position: "relative",
            height: compact ? "130px" : "165px",
            backgroundColor: "var(--surface-container)",
            overflow: "hidden",
          }}
        >
          <img
            src={room.image}
            alt={room.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(11, 28, 48, 0.75) 0%, rgba(11, 28, 48, 0.1) 60%, transparent 100%)",
            }}
          />

          {/* Top Badges */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              right: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "9999px",
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(4px)",
                color: "var(--primary-container)",
                fontSize: "11px",
                fontWeight: "700",
                fontFamily: "var(--font-mono)",
              }}
            >
              Cap: {room.capacity} Persons
            </span>
            <StatusBadge status={room.status} size="sm" />
          </div>

          {/* Bottom Title on Image */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "12px",
              right: "12px",
              color: "#ffffff",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                opacity: 0.85,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                domain
              </span>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {room.building}
              </span>
            </div>
            <h3
              style={{
                color: "#ffffff",
                fontSize: compact ? "14px" : "16px",
                margin: "2px 0 0",
                fontWeight: "700",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {room.name}
            </h3>
          </div>
        </div>

        {/* Room Specs & Amenities */}
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 8px",
              backgroundColor: "var(--surface-container-low)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "var(--on-surface-variant)" }}>
              {room.floor}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--primary-container)",
                fontWeight: "600",
              }}
            >
              {room.code}
            </span>
          </div>

          {/* Facility Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {(room.facilities || []).slice(0, 3).map((facility, i) => (
              <span
                key={i}
                style={{
                  padding: "2px 7px",
                  borderRadius: "6px",
                  backgroundColor: "var(--surface-container)",
                  color: "var(--on-surface-variant)",
                  fontSize: "11px",
                  fontWeight: "500",
                }}
              >
                {facility}
              </span>
            ))}
            {(room.facilities || []).length > 3 && (
              <span
                style={{
                  padding: "2px 6px",
                  borderRadius: "6px",
                  backgroundColor: "var(--surface-container-low)",
                  color: "var(--outline)",
                  fontSize: "11px",
                }}
              >
                +{room.facilities.length - 3} more
              </span>
            )}
          </div>

          <div
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              backgroundColor: isAvailable ? "var(--surface-container-low)" : "#fef3c7",
              color: isAvailable ? "var(--primary-container)" : "#b45309",
              fontSize: "11px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
              {isAvailable ? "schedule" : "warning"}
            </span>
            <span>
              {isAvailable
                ? "Available Now • Collision-free access"
                : "Maintenance scheduled"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          padding: "12px 16px 16px",
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          onClick={() => onViewDetails && onViewDetails(room)}
          style={{
            flex: 1,
            height: "36px",
            borderRadius: "8px",
            backgroundColor: "var(--surface-container-lowest)",
            border: "1px solid #e2e8f0",
            color: "var(--on-surface)",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            transition: "all 0.15s ease",
          }}
          className="hover:bg-slate-50"
        >
          <span>Details</span>
          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
            chevron_right
          </span>
        </button>

        <button
          onClick={() => onBook && onBook(room)}
          disabled={!isAvailable}
          style={{
            flex: 1.3,
            height: "36px",
            borderRadius: "8px",
            backgroundColor: isAvailable ? "var(--primary-container)" : "#cbd5e1",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            cursor: isAvailable ? "pointer" : "not-allowed",
            transition: "all 0.15s ease",
          }}
          className={isAvailable ? "hover:bg-blue-700" : ""}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
            touch_app
          </span>
          <span>{isAvailable ? "Quick Reserve" : "Unavailable"}</span>
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
