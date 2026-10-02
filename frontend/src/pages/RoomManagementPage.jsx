import React, { useState } from "react";
import { useBooking } from "../context/BookingContext";
import StatusBadge from "../components/common/StatusBadge";
import RoomModal from "../components/admin/RoomModal";

export const RoomManagementPage = ({ onSelectRoom }) => {
  const { rooms, toggleRoomMaintenance, addRoom, updateRoom } = useBooking();

  const [search, setSearch] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [editingRoom, setEditingRoom] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filtered = rooms.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !r.code.toLowerCase().includes(q) && !r.building.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedBuilding !== "all" && !r.building.toLowerCase().includes(selectedBuilding.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="room-management-page animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--primary-container)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            <span>Admin</span>
            <span style={{ color: "var(--outline)" }}>/</span>
            <span style={{ color: "var(--on-surface-variant)" }}>Campus Asset Control</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--on-surface)", margin: 0, letterSpacing: "-0.02em" }}>
            Room Asset Management
          </h1>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 0" }}>
            Maintain campus room catalog, upload S3 photos, configure installed hardware, and toggle maintenance states.
          </p>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            add_home
          </span>
          <span>Add New Room</span>
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <input
          type="text"
          className="form-input"
          style={{ maxWidth: "340px" }}
          placeholder="Search by room name, code, or complex..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          className="form-select"
          style={{ width: "auto" }}
        >
          <option value="all">All Complexes</option>
          <option value="Turing Computing">Turing Computing</option>
          <option value="Science & Engineering">Science & Engineering</option>
          <option value="Central Library">Central Library</option>
          <option value="Baker Humanities">Baker Humanities</option>
          <option value="BioTech">BioTech Center</option>
          <option value="Environmental">Environmental Sciences</option>
        </select>

        <span style={{ fontSize: "12px", color: "var(--outline)", marginLeft: "auto" }}>
          Showing {filtered.length} of {rooms.length} facilities
        </span>
      </div>

      {/* Grid of Room Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {filtered.map((room) => {
          const isMaint = room.status === "MAINTENANCE";

          return (
            <div
              key={room.id}
              style={{
                borderRadius: "16px",
                backgroundColor: "var(--surface-container-lowest)",
                border: "1px solid #f1f5f9",
                boxShadow: "var(--shadow-sm)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ position: "relative", height: "150px" }}>
                  <img
                    src={room.image}
                    alt={room.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                    <StatusBadge status={room.status} size="sm" />
                  </div>
                  <div style={{ position: "absolute", top: "10px", left: "10px", padding: "2px 8px", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.9)", fontSize: "11px", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                    {room.code}
                  </div>
                </div>

                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--on-surface)" }}>
                        {room.name}
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
                        {room.building} • {room.floor}
                      </span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--primary-container)" }}>
                      {room.capacity} seats
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {(room.facilities || []).slice(0, 3).map((f, i) => (
                      <span key={i} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--surface-container)" }}>
                        {f}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: "11px", color: "var(--outline)" }}>
                    Custodian: <strong>{room.custodian || "Facilities"}</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid #f8fafc", display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setEditingRoom(room)}
                  className="btn-secondary"
                  style={{ flex: 1, height: "34px", fontSize: "12px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    edit
                  </span>
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => toggleRoomMaintenance(room.id)}
                  style={{
                    flex: 1.2,
                    height: "34px",
                    borderRadius: "8px",
                    backgroundColor: isMaint ? "#ecfdf5" : "#fef3c7",
                    color: isMaint ? "#047857" : "#b45309",
                    fontSize: "12px",
                    fontWeight: "600",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    {isMaint ? "check_circle" : "build"}
                  </span>
                  <span>{isMaint ? "Restore" : "Maintenance"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingRoom && (
        <RoomModal
          room={editingRoom}
          isOpen={Boolean(editingRoom)}
          onClose={() => setEditingRoom(null)}
          onSave={(updates) => updateRoom(editingRoom.id, updates)}
        />
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <RoomModal
          room={null}
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSave={(data) => addRoom(data)}
        />
      )}
    </div>
  );
};

export default RoomManagementPage;
