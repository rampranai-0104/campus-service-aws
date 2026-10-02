import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/common/StatusBadge";
import RoomModal from "../components/admin/RoomModal";
import RequestActionModal from "../components/admin/RequestActionModal";

export const AdminDashboardPage = ({ onNavigate }) => {
  const { rooms, bookings, toggleRoomMaintenance, addRoom, updateRoom } = useBooking();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [editingRoom, setEditingRoom] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionRequest, setActionRequest] = useState(null); // { booking, type }

  const pendingRequests = bookings.filter((b) => b.status === "PENDING");
  const maintRooms = rooms.filter((r) => r.status === "MAINTENANCE");

  const filteredRooms = rooms.filter((r) => {
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

    if (buildingFilter !== "all" && !r.building.toLowerCase().includes(buildingFilter.toLowerCase())) {
      return false;
    }

    return true;
  });

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
            Facilities &amp; Room Operations
          </h1>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
            Manage room operational states, review special allocation requests, and schedule maintenance tickets.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => onNavigate("booking-requests")} className="btn-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              rule
            </span>
            <span>Review Requests ({pendingRequests.length})</span>
          </button>

          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              add
            </span>
            <span>Add New Room</span>
          </button>
        </div>
      </div>

      {/* 4 Admin Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Card 1 */}
        <div style={{ borderRadius: "16px", backgroundColor: "var(--surface-container-lowest)", padding: "20px", boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Total Campus Inventory</span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", marginTop: "4px" }}>
                {rooms.length} <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--outline)" }}>Rooms</span>
              </div>
            </div>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)", color: "var(--primary-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>domain</span>
            </div>
          </div>
          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span style={{ padding: "2px 6px", borderRadius: "9999px", backgroundColor: "#ecfdf5", color: "#059669", fontWeight: "700" }}>95.3% Available</span>
            <span>Across 8 complexes</span>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ borderRadius: "16px", backgroundColor: "var(--surface-container-lowest)", padding: "20px", boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Under Maintenance</span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#b45309", marginTop: "4px" }}>
                {maintRooms.length} <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--outline)" }}>Spaces</span>
              </div>
            </div>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>build_circle</span>
            </div>
          </div>
          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "15px", color: "var(--amber-500)" }}>priority_high</span>
            <span>2 urgent tickets, 4 scheduled</span>
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ borderRadius: "16px", backgroundColor: "var(--surface-container-lowest)", padding: "20px", boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Avg Weekly Utilization</span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", marginTop: "4px" }}>
                78.4%
              </div>
            </div>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "var(--surface-container-low)", color: "var(--tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>donut_large</span>
            </div>
          </div>
          <div style={{ marginTop: "14px", width: "100%", height: "6px", backgroundColor: "var(--surface-container-low)", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{ width: "78.4%", height: "100%", backgroundColor: "var(--primary-container)", borderRadius: "9999px" }} />
          </div>
        </div>

        {/* Card 4 */}
        <div style={{ borderRadius: "16px", backgroundColor: "var(--surface-container-lowest)", padding: "20px", boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Pending Requests</span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: pendingRequests.length > 0 ? "var(--primary-container)" : "var(--on-surface)", marginTop: "4px" }}>
                {pendingRequests.length} <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--outline)" }}>Requests</span>
              </div>
            </div>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "var(--secondary-container)", color: "var(--on-secondary-fixed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>pending_actions</span>
            </div>
          </div>
          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span>Auditorium &amp; Labs</span>
            <button onClick={() => onNavigate("booking-requests")} style={{ color: "var(--primary-container)", fontWeight: "700" }}>
              Review All →
            </button>
          </div>
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
            {["all", "active", "maintenance", "disabled"].map((s) => (
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
          <option value="all">All Buildings (8)</option>
          <option value="Turing Computing">Turing Computing</option>
          <option value="Science & Engineering">Science Hall</option>
          <option value="Baker Humanities">Arts &amp; Humanities</option>
          <option value="Central Library">Library Complex</option>
          <option value="BioTech">BioTech Center</option>
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
        <div style={{ padding: "14px 20px", backgroundColor: "var(--surface-container-low)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--on-surface)" }}>
              Spaces Inventory &amp; Telemetry
            </span>
            <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "var(--surface-container-high)", fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: "600" }}>
              {filteredRooms.length} rooms shown
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "16px" }}>
              cloud_done
            </span>
            <span>Amplify DataStore: Synchronized</span>
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
              {filteredRooms.map((room) => {
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
                      {room.custodian || "Facilities"}
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
              })}
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
    </div>
  );
};

export default AdminDashboardPage;
