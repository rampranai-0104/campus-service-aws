import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";

export const RoomModal = ({ room, isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [building, setBuilding] = useState("Turing Computing Complex");
  const [floor, setFloor] = useState("Floor 2 • West Wing");
  const [capacity, setCapacity] = useState(16);
  const [roomType, setRoomType] = useState("LAB");
  const [facilities, setFacilities] = useState("4K Display, Dual Whiteboard, Video Conference");
  const [status, setStatus] = useState("AVAILABLE");
  const [custodian, setCustodian] = useState("Marcus Bradley");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (room) {
      setName(room.name || "");
      setCode(room.code || "");
      setBuilding(room.building || "Turing Computing Complex");
      setFloor(room.floor || "");
      setCapacity(room.capacity || 16);
      setRoomType(room.roomType || "LAB");
      setFacilities((room.facilities || []).join(", "));
      setStatus(room.status || "AVAILABLE");
      setCustodian(room.custodian || "Marcus Bradley");
      setImage(room.image || "");
    } else {
      setName("");
      setCode(`RM-${Math.floor(100 + Math.random() * 900)}`);
      setBuilding("Turing Computing Complex");
      setFloor("Floor 2");
      setCapacity(16);
      setRoomType("LAB");
      setFacilities("4K Display, Whiteboard, Wi-Fi 6E");
      setStatus("AVAILABLE");
      setCustodian("Facilities Admin");
      setImage("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80");
    }
  }, [room, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const facilityList = facilities
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    onSave({
      name,
      code,
      building,
      floor,
      capacity: parseInt(capacity, 10) || 10,
      roomType,
      typeLabel: roomType === "LAB" ? "Lab" : roomType === "AUDITORIUM" ? "Auditorium" : "Seminar",
      facilities: facilityList,
      status,
      custodian,
      image,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={room ? "Edit Room Details" : "Add New Campus Space"} maxWidth="540px">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Room Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Turing Innovation Hub 305"
              required
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Room Code</label>
            <input
              type="text"
              className="form-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Building</label>
            <select className="form-select" value={building} onChange={(e) => setBuilding(e.target.value)}>
              <option value="Turing Computing Complex">Turing Computing Complex</option>
              <option value="Science & Engineering Hall">Science & Engineering Hall</option>
              <option value="Central Library">Central Library</option>
              <option value="Baker Humanities Center">Baker Humanities Center</option>
              <option value="BioTech Research Center">BioTech Research Center</option>
              <option value="Environmental Sciences">Environmental Sciences</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Floor / Wing</label>
            <input
              type="text"
              className="form-input"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Capacity</label>
            <input
              type="number"
              className="form-input"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
              required
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Type</label>
            <select className="form-select" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              <option value="LAB">Lab</option>
              <option value="STUDY_POD">Study Pod</option>
              <option value="SEMINAR">Seminar</option>
              <option value="AUDITORIUM">Auditorium</option>
              <option value="CONFERENCE">Conference</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="AVAILABLE">Available</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Facilities (comma-separated)</label>
          <input
            type="text"
            className="form-input"
            value={facilities}
            onChange={(e) => setFacilities(e.target.value)}
            placeholder="e.g. 4K Display, Dual Whiteboard, Video Conference"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase" }}>Room Image URL (Amazon S3)</label>
          <input
            type="text"
            className="form-input"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>
            {room ? "Save Changes" : "Create Room"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoomModal;
