import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import RoomCard from "../components/common/RoomCard";
import BookingModal from "../components/booking/BookingModal";

export const RoomsPage = ({ onSelectRoom, onNavigate }) => {
  const { rooms, searchQuery, setSearchQuery, refreshData } = useBooking();

  const [buildingFilter, setBuildingFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [selectedKit, setSelectedKit] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [bookingModalRoom, setBookingModalRoom] = useState(null);

  const availableKit = [
    "Projector",
    "High-Speed Wi-Fi 6E",
    "Whiteboard",
    "Video Conference",
    "ADA Accessible Tier 1",
    "Dual Displays",
    "Air Conditioning",
  ];

  const toggleKit = (kit) => {
    setSelectedKit((prev) =>
      prev.includes(kit) ? prev.filter((k) => k !== kit) : [...prev, kit]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setBuildingFilter("all");
    setTypeFilter("all");
    setCapacityFilter("all");
    setSelectedKit([]);
  };

  // Filter logic
  const filteredRooms = rooms.filter((room) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = room.name.toLowerCase().includes(q);
      const matchBuilding = room.building.toLowerCase().includes(q);
      const matchCode = room.code.toLowerCase().includes(q);
      const matchFacility = (room.facilities || []).some((f) =>
        f.toLowerCase().includes(q)
      );
      if (!matchName && !matchBuilding && !matchCode && !matchFacility) {
        return false;
      }
    }

    // Building filter
    if (buildingFilter !== "all" && !room.building.toLowerCase().includes(buildingFilter.toLowerCase())) {
      return false;
    }

    // Type filter
    if (typeFilter !== "all" && room.roomType !== typeFilter) {
      return false;
    }

    // Capacity filter
    if (capacityFilter === "solo" && (room.capacity < 1 || room.capacity > 4)) return false;
    if (capacityFilter === "small" && (room.capacity < 5 || room.capacity > 15)) return false;
    if (capacityFilter === "medium" && (room.capacity < 16 || room.capacity > 40)) return false;
    if (capacityFilter === "large" && room.capacity < 41) return false;

    // Kit amenities filter
    if (selectedKit.length > 0) {
      const hasAllKit = selectedKit.every((kit) =>
        (room.facilities || []).some((rf) =>
          rf.toLowerCase().includes(kit.toLowerCase().split(" ")[0])
        )
      );
      if (!hasAllKit) return false;
    }

    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="rooms-page animate-fade-in">
      {/* Top Banner / Live Sync Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          backgroundColor: "var(--surface-container-low)",
          borderRadius: "12px",
          boxShadow: "var(--shadow-xs)",
          border: "1px solid #e2e8f0",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-container)",
            }}
            className="animate-pulse"
          />
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--primary-container)" }}>
            AWS Amplify DataStore Synced
          </span>
          <span style={{ color: "var(--outline)" }}>•</span>
          <span style={{ color: "var(--on-surface-variant)" }}>
            {rooms.length} rooms indexed across 14 campus sectors
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--on-surface-variant)" }}>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "16px" }}>
              cloud_done
            </span>
            <span>Low-latency conflict verification active</span>
          </span>
          <button
            onClick={() => {
              resetFilters();
              if (refreshData) refreshData();
            }}
            style={{ color: "var(--primary-container)", fontWeight: "600", display: "flex", alignItems: "center", gap: "2px" }}
          >
            <span>Refresh Catalog</span>
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
              sync
            </span>
          </button>
        </div>
      </div>

      {/* Main Directory Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            <span>Space Reservations</span>
            <span style={{ color: "var(--outline)" }}>/</span>
            <span style={{ color: "var(--on-surface-variant)" }}>Academic Infrastructure</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
            Campus Rooms Directory
          </h1>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0", maxWidth: "700px" }}>
            Browse, filter, and instantly reserve study spaces, labs, auditoriums, and seminar rooms across campus with guaranteed collision detection.
          </p>
        </div>

        {/* Right Controls: View Switcher & Request Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--surface-container-high)",
              padding: "3px",
              borderRadius: "10px",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: viewMode === "grid" ? "700" : "500",
                backgroundColor: viewMode === "grid" ? "var(--surface-container-lowest)" : "transparent",
                color: viewMode === "grid" ? "var(--primary-container)" : "var(--on-surface-variant)",
                boxShadow: viewMode === "grid" ? "var(--shadow-xs)" : "none",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                grid_view
              </span>
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: viewMode === "list" ? "700" : "500",
                backgroundColor: viewMode === "list" ? "var(--surface-container-lowest)" : "transparent",
                color: viewMode === "list" ? "var(--primary-container)" : "var(--on-surface-variant)",
                boxShadow: viewMode === "list" ? "var(--shadow-xs)" : "none",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                view_list
              </span>
              <span>List View</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate("quick-book")}
            className="btn-primary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              add
            </span>
            <span>Request New Space</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Bento Panel */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Search Bar */}
        <div style={{ position: "relative", width: "100%" }}>
          <span
            className="material-symbols-outlined text-primary"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "22px",
            }}
          >
            search
          </span>
          <input
            type="text"
            className="form-input"
            style={{
              height: "46px",
              paddingLeft: "46px",
              paddingRight: "80px",
              fontSize: "14px",
              borderRadius: "12px",
            }}
            placeholder="Search by room name, building, equipment (e.g. 'Projector', 'Turing 200', 'Touchscreen')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <kbd
              style={{
                padding: "3px 7px",
                borderRadius: "6px",
                backgroundColor: "var(--surface-container-low)",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--on-surface-variant)",
                border: "1px solid #e2e8f0",
              }}
            >
              ⌘K
            </kbd>
          </div>
        </div>

        {/* 4 Dropdown Selectors */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {/* Building */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
              Campus Sector
            </label>
            <select
              className="form-select"
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
            >
              <option value="all">All Buildings (All Campus)</option>
              <option value="Turing Computing">Turing Computing Complex</option>
              <option value="Science & Engineering">Science & Engineering Hall</option>
              <option value="Central Library">Central Library</option>
              <option value="Baker Humanities">Baker Humanities Center</option>
              <option value="BioTech">BioTech Research Center</option>
              <option value="Environmental">Environmental Sciences</option>
            </select>
          </div>

          {/* Typology */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
              Room Typology
            </label>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types (Pods, Labs, Halls)</option>
              <option value="STUDY_POD">Study Pods (1-4 cap)</option>
              <option value="LAB">Computer &amp; Research Labs</option>
              <option value="SEMINAR">Seminar &amp; Meeting Rooms</option>
              <option value="AUDITORIUM">Auditoriums &amp; Halls</option>
              <option value="CONFERENCE">Conference Suites</option>
            </select>
          </div>

          {/* Capacity */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
              Occupancy Tier
            </label>
            <select
              className="form-select"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            >
              <option value="all">Any Capacity</option>
              <option value="solo">Solo &amp; Duo (1-4 seats)</option>
              <option value="small">Small Team (5-15 seats)</option>
              <option value="medium">Medium Group (16-40 seats)</option>
              <option value="large">High Capacity (40+ seats)</option>
            </select>
          </div>

          {/* Target Slot Time */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
              Target Window
            </label>
            <div
              style={{
                height: "40px",
                padding: "0 12px",
                borderRadius: "8px",
                backgroundColor: "var(--surface-container-low)",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "13px",
                color: "var(--on-surface)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "16px" }}>
                  schedule
                </span>
                <span>Today at 2:00 PM</span>
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--outline)" }}>
                edit_calendar
              </span>
            </div>
          </div>
        </div>

        {/* Required Kit Multi-Pills */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
            Required Kit:
          </span>
          {availableKit.map((kit) => {
            const isSelected = selectedKit.includes(kit);
            return (
              <button
                key={kit}
                onClick={() => toggleKit(kit)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: "600",
                  backgroundColor: isSelected ? "var(--primary-container)" : "var(--surface-container-low)",
                  color: isSelected ? "#ffffff" : "var(--on-surface-variant)",
                  border: `1px solid ${isSelected ? "var(--primary-container)" : "#e2e8f0"}`,
                  boxShadow: isSelected ? "var(--shadow-xs)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  {isSelected ? "check" : "add"}
                </span>
                <span>{kit}</span>
              </button>
            );
          })}
        </div>

        {/* Active Filter Badges */}
        {(buildingFilter !== "all" || typeFilter !== "all" || capacityFilter !== "all" || selectedKit.length > 0 || searchQuery) && (
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "rgba(239, 244, 255, 0.6)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--outline)", fontWeight: "600" }}>Active Filters:</span>
              {buildingFilter !== "all" && (
                <span style={{ padding: "2px 8px", backgroundColor: "#ffffff", borderRadius: "6px", fontWeight: "600", color: "var(--primary-container)" }}>
                  Building: {buildingFilter}
                </span>
              )}
              {typeFilter !== "all" && (
                <span style={{ padding: "2px 8px", backgroundColor: "#ffffff", borderRadius: "6px", fontWeight: "600", color: "var(--primary-container)" }}>
                  Type: {typeFilter}
                </span>
              )}
              {selectedKit.map((kit) => (
                <span key={kit} style={{ padding: "2px 8px", backgroundColor: "#ffffff", borderRadius: "6px", fontWeight: "600", color: "var(--primary-container)" }}>
                  Kit: {kit}
                </span>
              ))}
            </div>

            <button
              onClick={resetFilters}
              style={{
                color: "var(--error)",
                fontSize: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                restart_alt
              </span>
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Catalog Display */}
      {filteredRooms.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            borderRadius: "16px",
            backgroundColor: "var(--surface-container-lowest)",
            border: "1px solid #f1f5f9",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span className="material-symbols-outlined text-outline" style={{ fontSize: "40px" }}>
            search_off
          </span>
          <h3 style={{ fontSize: "18px", fontWeight: "700" }}>No spaces matched your filters</h3>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", maxWidth: "400px", margin: 0 }}>
            Try clearing some filters or searching with a different room name, building, or capacity requirement.
          </p>
          <button onClick={resetFilters} className="btn-primary" style={{ marginTop: "8px" }}>
            Reset All Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBook={(r) => setBookingModalRoom(r)}
              onViewDetails={(r) => onSelectRoom && onSelectRoom(r)}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div
          style={{
            borderRadius: "16px",
            backgroundColor: "var(--surface-container-lowest)",
            border: "1px solid #f1f5f9",
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "rgba(239, 244, 255, 0.7)", color: "var(--on-surface-variant)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                <th style={{ padding: "12px 16px" }}>Room &amp; Complex</th>
                <th style={{ padding: "12px 16px" }}>Floor &amp; Sector</th>
                <th style={{ padding: "12px 16px" }}>Capacity &amp; Typology</th>
                <th style={{ padding: "12px 16px" }}>Installed Equipment</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.id} style={{ borderBottom: "1px solid #f8fafc" }} className="hover:bg-slate-50/60">
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={room.image}
                        alt={room.name}
                        style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "700", color: "var(--on-surface)" }}>{room.name}</span>
                        <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>{room.building}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{room.floor}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontWeight: "700", color: "var(--primary-container)" }}>{room.capacity} seats</span>
                    <span style={{ fontSize: "11px", color: "var(--outline)", display: "block" }}>{room.typeLabel}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "260px" }}>
                      {(room.facilities || []).slice(0, 3).map((f, i) => (
                        <span key={i} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--surface-container)" }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        fontWeight: "700",
                        backgroundColor: room.status === "AVAILABLE" ? "#ecfdf5" : "#fef3c7",
                        color: room.status === "AVAILABLE" ? "#047857" : "#b45309",
                      }}
                    >
                      {room.status === "AVAILABLE" ? "Available" : "Maintenance"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        onClick={() => onSelectRoom && onSelectRoom(room)}
                        className="btn-secondary"
                        style={{ height: "30px", padding: "0 10px", fontSize: "11px" }}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setBookingModalRoom(room)}
                        disabled={room.status !== "AVAILABLE"}
                        className="btn-primary"
                        style={{ height: "30px", padding: "0 12px", fontSize: "11px", opacity: room.status === "AVAILABLE" ? 1 : 0.5 }}
                      >
                        Reserve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalRoom && (
        <BookingModal
          room={bookingModalRoom}
          isOpen={Boolean(bookingModalRoom)}
          onClose={() => setBookingModalRoom(null)}
        />
      )}
    </div>
  );
};

export default RoomsPage;
