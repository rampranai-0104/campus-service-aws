import React, { useState, useMemo } from "react";
import { useBooking } from "../context/BookingContext";
import StatusBadge from "../components/common/StatusBadge";
import RoomModal from "../components/admin/RoomModal";
import RequestActionModal from "../components/admin/RequestActionModal";
import TicketActionModal from "../components/admin/TicketActionModal";
import { calculateSpaceEfficiency } from "../services/analyticsService";

export const AdminDashboardPage = ({ onNavigate }) => {
  const {
    rooms = [],
    bookings = [],
    tickets = [],
    toggleRoomMaintenance,
    addRoom,
    updateRoom,
    refreshData,
    syncStatus,
    isLoadingData,
  } = useBooking();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [editingRoom, setEditingRoom] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionRequest, setActionRequest] = useState(null); // { booking, type }
  const [activeTicket, setActiveTicket] = useState(null);

  // Dynamic unique list of buildings
  const buildings = useMemo(() => {
    const set = new Set();
    rooms.forEach((r) => {
      if (r.building) set.add(r.building);
    });
    return Array.from(set).sort();
  }, [rooms]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Live Metrics Calculations
  const pendingRequests = useMemo(
    () => bookings.filter((b) => b.status === "PENDING"),
    [bookings]
  );

  const todayConfirmedBookings = useMemo(
    () => bookings.filter((b) => b.date === todayStr && b.status === "CONFIRMED"),
    [bookings, todayStr]
  );

  const availableRooms = useMemo(
    () => rooms.filter((r) => r.status === "AVAILABLE"),
    [rooms]
  );

  const maintRooms = useMemo(
    () => rooms.filter((r) => r.status === "MAINTENANCE"),
    [rooms]
  );

  const openTickets = useMemo(
    () => tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS"),
    [tickets]
  );

  const spaceEfficiency = useMemo(() => {
    return calculateSpaceEfficiency(rooms, bookings);
  }, [rooms, bookings]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.building.toLowerCase().includes(q) ||
          (r.custodian || "").toLowerCase().includes(q);
        if (!match) return false;
      }

      if (statusFilter === "active" && r.status !== "AVAILABLE") return false;
      if (statusFilter === "maintenance" && r.status !== "MAINTENANCE") return false;
      if (statusFilter === "disabled" && r.status !== "DISABLED") return false;

      if (buildingFilter !== "all" && r.building !== buildingFilter) {
        return false;
      }

      return true;
    });
  }, [rooms, searchTerm, statusFilter, buildingFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="admin-dashboard animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            <span>Operations &amp; Infrastructure</span>
            <span style={{ color: "var(--outline)" }}>/</span>
            <span style={{ color: "var(--on-surface-variant)" }}>Campus Facilities Admin</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
            Facilities Operations &amp; Administration
          </h1>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
            Manage room states, review pending reservations, inspect equipment tickets, and maintain campus inventory.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Refresh Button */}
          <button
            onClick={() => refreshData && refreshData()}
            className="btn-secondary"
            title="Refresh all telemetry directly from AWS AppSync"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              sync
            </span>
            <span>Sync Live AWS</span>
          </button>

          {/* Review Requests Button */}
          <button onClick={() => onNavigate("booking-requests")} className="btn-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              rule
            </span>
            <span>
              Review Requests ({pendingRequests.length})
            </span>
          </button>

          {/* Add New Room Button */}
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              add
            </span>
            <span>Add New Room</span>
          </button>
        </div>
      </div>

      {/* 5 Live Admin Stat Cards (No Hardcoded Values) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}
      >
        {/* Card 1: Pending Requests */}
        <div
          onClick={() => onNavigate("booking-requests")}
          style={{
            borderRadius: "16px",
            backgroundColor: "var(--surface-container-lowest)",
            padding: "18px",
            boxShadow: "var(--shadow-sm)",
            border: `1px solid ${pendingRequests.length > 0 ? "var(--secondary-container)" : "#f1f5f9"}`,
            cursor: "pointer",
          }}
          className="hover:shadow-md transition-shadow"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Pending Requests
              </span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: pendingRequests.length > 0 ? "var(--primary-container)" : "var(--on-surface)", marginTop: "4px" }}>
                {pendingRequests.length}
              </div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "var(--secondary-container)", color: "var(--on-secondary-fixed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>pending_actions</span>
            </div>
          </div>
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span>Requires review</span>
            <span style={{ color: "var(--primary-container)", fontWeight: "700" }}>Queue →</span>
          </div>
        </div>

        {/* Card 2: Today's Confirmed Bookings */}
        <div style={{ borderRadius: "16px", backgroundColor: "var(--surface-container-lowest)", padding: "18px", boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Today's Bookings
              </span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", marginTop: "4px" }}>
                {todayConfirmedBookings.length}
              </div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)", color: "var(--primary-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>event_available</span>
            </div>
          </div>
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span style={{ padding: "2px 6px", borderRadius: "9999px", backgroundColor: "#ecfdf5", color: "#059669", fontWeight: "700" }}>
              CONFIRMED
            </span>
            <span>for {todayStr}</span>
          </div>
        </div>

        {/* Card 3: Total & Available Rooms */}
        <div style={{ borderRadius: "16px", backgroundColor: "var(--surface-container-lowest)", padding: "18px", boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Rooms Available
              </span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", marginTop: "4px" }}>
                {availableRooms.length} <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--outline)" }}>/ {rooms.length}</span>
              </div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>meeting_room</span>
            </div>
          </div>
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span>Across {buildings.length} campus complex{buildings.length === 1 ? "" : "es"}</span>
          </div>
        </div>

        {/* Card 4: Under Maintenance */}
        <div style={{ borderRadius: "16px", backgroundColor: "var(--surface-container-lowest)", padding: "18px", boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Maintenance
              </span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: maintRooms.length > 0 ? "#b45309" : "var(--on-surface)", marginTop: "4px" }}>
                {maintRooms.length}
              </div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>build_circle</span>
            </div>
          </div>
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span>Locked against collision</span>
          </div>
        </div>

        {/* Card 5: Open Support Tickets */}
        <div
          onClick={() => onNavigate("help")}
          style={{
            borderRadius: "16px",
            backgroundColor: "var(--surface-container-lowest)",
            padding: "18px",
            boxShadow: "var(--shadow-sm)",
            border: "1px solid #f1f5f9",
            cursor: "pointer",
          }}
          className="hover:shadow-md transition-shadow"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Support Tickets
              </span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: openTickets.length > 0 ? "var(--primary-container)" : "var(--on-surface)", marginTop: "4px" }}>
                {openTickets.length} <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--outline)" }}>Open</span>
              </div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>support_agent</span>
            </div>
          </div>
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span>Facilities &amp; AV</span>
            <span style={{ color: "var(--primary-container)", fontWeight: "700" }}>Manage →</span>
          </div>
        </div>

        {/* Card 6: Space Utilization */}
        <div
          onClick={() => onNavigate("analytics")}
          style={{
            borderRadius: "16px",
            backgroundColor: "var(--surface-container-lowest)",
            padding: "18px",
            boxShadow: "var(--shadow-sm)",
            border: "1px solid #f1f5f9",
            cursor: "pointer",
          }}
          className="hover:shadow-md transition-shadow"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>
                Space Utilization
              </span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", marginTop: "4px" }}>
                {spaceEfficiency.formatted}
              </div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)", color: "var(--primary-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>insights</span>
            </div>
          </div>
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span>Weekly efficiency</span>
            <span style={{ color: "var(--primary-container)", fontWeight: "700" }}>Analytics →</span>
          </div>
        </div>
      </div>

      {/* DUAL SECTION: Recent Pending Booking Requests & Recent Facilities Support Tickets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px" }}>
        {/* Panel 1: Pending Booking Requests */}
        <div
          style={{
            borderRadius: "16px",
            backgroundColor: "var(--surface-container-lowest)",
            padding: "20px",
            boxShadow: "var(--shadow-sm)",
            border: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                pending_actions
              </span>
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--on-surface)" }}>
                Pending Allocation Requests ({pendingRequests.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate("booking-requests")}
              style={{ fontSize: "12px", color: "var(--primary-container)", fontWeight: "700" }}
            >
              View All Queue →
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div style={{ padding: "28px", textAlign: "center", color: "var(--outline)", fontSize: "13px" }}>
              No pending requests awaiting approval. All requests processed.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {pendingRequests.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    backgroundColor: "var(--surface-container-low)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <strong style={{ fontSize: "13px", color: "var(--on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {b.roomName}
                      </strong>
                      <span style={{ fontSize: "11px", color: "var(--outline)" }}>• {b.userName}</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                      {b.date} ({b.startTime} – {b.endTime}) • {b.purpose}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <button
                      onClick={() => setActionRequest({ booking: b, type: "approve" })}
                      className="btn-primary"
                      style={{ height: "28px", padding: "0 10px", fontSize: "11px" }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setActionRequest({ booking: b, type: "reject" })}
                      className="btn-secondary"
                      style={{ height: "28px", padding: "0 8px", fontSize: "11px", color: "#dc2626" }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setActionRequest({ booking: b, type: "reassign" })}
                      className="btn-secondary"
                      style={{ height: "28px", padding: "0 8px", fontSize: "11px" }}
                      title="Reassign to alternative space"
                    >
                      Reassign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel 2: Open Support Tickets */}
        <div
          style={{
            borderRadius: "16px",
            backgroundColor: "var(--surface-container-lowest)",
            padding: "20px",
            boxShadow: "var(--shadow-sm)",
            border: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                build
              </span>
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--on-surface)" }}>
                Active Support Tickets ({openTickets.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate("help")}
              style={{ fontSize: "12px", color: "var(--primary-container)", fontWeight: "700" }}
            >
              Ticket Portal →
            </button>
          </div>

          {openTickets.length === 0 ? (
            <div style={{ padding: "28px", textAlign: "center", color: "var(--outline)", fontSize: "13px" }}>
              No active equipment or facilities tickets. All campus spaces nominal.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {openTickets.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    backgroundColor: "var(--surface-container-low)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 5px", borderRadius: "4px", backgroundColor: t.priority === "URGENT" ? "#fee2e2" : "#fef3c7", color: t.priority === "URGENT" ? "#b91c1c" : "#b45309" }}>
                        {t.priority}
                      </span>
                      <strong style={{ fontSize: "13px", color: "var(--on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t.subject}
                      </strong>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                      {t.category} • {t.roomName || "General Area"} • By {t.userName}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTicket(t)}
                    className="btn-secondary"
                    style={{ height: "28px", padding: "0 10px", fontSize: "11px", flexShrink: 0 }}
                  >
                    Respond &amp; Update
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar for Rooms */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          padding: "16px 20px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "260px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span className="material-symbols-outlined" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "var(--outline)" }}>
              search
            </span>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "34px" }}
              placeholder="Filter room #, building, or custodian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Tabs */}
          <div style={{ display: "flex", backgroundColor: "var(--surface-container-low)", padding: "3px", borderRadius: "8px" }}>
            {["all", "active", "maintenance"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: statusFilter === s ? "700" : "500",
                  backgroundColor: statusFilter === s ? "var(--surface-container-lowest)" : "transparent",
                  color: statusFilter === s ? "var(--primary-container)" : "var(--on-surface-variant)",
                  boxShadow: statusFilter === s ? "var(--shadow-xs)" : "none",
                  textTransform: "capitalize",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Building Filter */}
        <select
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
          className="form-select"
          style={{ width: "auto", minWidth: "160px" }}
        >
          <option value="all">All Buildings ({buildings.length})</option>
          {buildings.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Spaces Inventory Table */}
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
          border: "1px solid #f1f5f9",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 20px", backgroundColor: "var(--surface-container-low)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--on-surface)" }}>
              Campus Room Inventory &amp; Telemetry
            </span>
            <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "var(--surface-container-high)", fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: "600" }}>
              {filteredRooms.length} rooms listed
            </span>
          </div>

          {/* Truthful Connection & Sync State (No fake DataStore claim) */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: syncStatus.includes("ONLINE") ? "#10b981" : "#f59e0b",
              }}
              className={syncStatus.includes("ONLINE") ? "" : "animate-pulse"}
            />
            <span style={{ fontWeight: "600", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
              {syncStatus} (AWS AppSync)
            </span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "rgba(248, 249, 255, 0.9)", color: "var(--on-surface-variant)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                <th style={{ padding: "12px 18px" }}>Room Details</th>
                <th style={{ padding: "12px 18px" }}>Building &amp; Wing</th>
                <th style={{ padding: "12px 18px" }}>Capacity &amp; Type</th>
                <th style={{ padding: "12px 18px" }}>Key Facilities</th>
                <th style={{ padding: "12px 18px" }}>Operational Status</th>
                <th style={{ padding: "12px 18px" }}>Custodian</th>
                <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "var(--outline)" }}>
                    {isLoadingData ? "Loading live room catalog from AWS AppSync..." : "No rooms found matching your filter criteria."}
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => {
                  const isMaint = room.status === "MAINTENANCE";

                  return (
                    <tr
                      key={room.id}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        backgroundColor: isMaint ? "rgba(254, 243, 199, 0.15)" : "transparent",
                      }}
                      className="hover:bg-slate-50/60"
                    >
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img
                            src={room.image}
                            alt={room.name}
                            style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }}
                          />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: "700", color: "var(--on-surface)" }}>{room.name}</span>
                            <span style={{ fontSize: "11px", color: "var(--outline)", fontFamily: "var(--font-mono)" }}>
                              ID: {room.code}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: "600", color: "var(--on-surface)" }}>{room.building}</span>
                          <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>{room.floor}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ fontWeight: "700", color: "var(--primary-container)" }}>{room.capacity} seats</span>
                        <span style={{ fontSize: "11px", color: "var(--outline)", display: "block" }}>{room.typeLabel}</span>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "220px" }}>
                          {(room.facilities || []).slice(0, 2).map((f, i) => (
                            <span key={i} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--surface-container)" }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <StatusBadge status={room.status} size="sm" />
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: "12px", color: "var(--on-surface-variant)" }}>
                        {room.custodian || "Campus Facilities"}
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          {/* Edit Space */}
                          <button
                            onClick={() => setEditingRoom(room)}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              backgroundColor: "var(--surface-container-low)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--on-surface-variant)",
                            }}
                            className="hover:text-blue-700"
                            title="Edit Space"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>
                              edit
                            </span>
                          </button>

                          {/* Toggle Maintenance */}
                          <button
                            onClick={() => toggleRoomMaintenance(room.id)}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              backgroundColor: isMaint ? "#fef3c7" : "var(--surface-container-low)",
                              color: isMaint ? "#b45309" : "var(--secondary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            className="hover:opacity-80"
                            title={isMaint ? "Restore to Available" : "Set Under Maintenance"}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>
                              build
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Room Modal */}
      {editingRoom && (
        <RoomModal
          room={editingRoom}
          isOpen={Boolean(editingRoom)}
          onClose={() => setEditingRoom(null)}
          onSave={(updates) => updateRoom(editingRoom.id, updates)}
        />
      )}

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <RoomModal
          room={null}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newRoomData) => addRoom(newRoomData)}
        />
      )}

      {/* Request Action Modal */}
      {actionRequest && (
        <RequestActionModal
          booking={actionRequest.booking}
          actionType={actionRequest.type}
          isOpen={Boolean(actionRequest)}
          onClose={() => setActionRequest(null)}
        />
      )}

      {/* Ticket Action Modal */}
      {activeTicket && (
        <TicketActionModal
          ticket={activeTicket}
          isOpen={Boolean(activeTicket)}
          onClose={() => setActiveTicket(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
