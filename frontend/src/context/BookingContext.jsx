import React, { createContext, useContext, useState, useEffect } from "react";
import { dataStoreService } from "../aws/dataStore";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast, refreshNotifications } = useNotifications();

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isOfflineSim, setIsOfflineSim] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBuildingFilter, setActiveBuildingFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [activeCapacityFilter, setActiveCapacityFilter] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [quickBookPrefill, setQuickBookPrefill] = useState(null);

  const loadData = () => {
    setRooms(dataStoreService.getRooms());
    setBookings(dataStoreService.getBookings());
    setIsOfflineSim(dataStoreService.isOfflineSimActive());
    setOfflineQueue(dataStoreService.getOfflineQueue());
  };

  useEffect(() => {
    dataStoreService.init();
    loadData();
  }, []);

  const toggleOfflineSim = () => {
    const nextState = !isOfflineSim;
    setIsOfflineSim(nextState);
    dataStoreService.setOfflineSimActive(nextState);
    
    if (nextState) {
      showToast("Offline Simulation Mode Enabled: Writes are queued in local IndexedDB.", "warning");
    } else {
      showToast("Online Synced: AWS AppSync connected & local queue reconciled!", "success");
    }
    loadData();
    refreshNotifications();
  };

  const createBooking = (bookingData) => {
    const payload = {
      ...bookingData,
      userId: currentUser?.id || "usr-faculty-01",
      userName: currentUser?.name || "Dr. Sarah Chen",
      userRole: currentUser?.role || "STAFF",
    };

    const result = dataStoreService.createBooking(payload, isOfflineSim);
    if (!result.success) {
      showToast(result.error || "Room booking conflict detected!", "error");
      return result;
    }

    loadData();
    refreshNotifications();

    if (isOfflineSim) {
      showToast(`Saved to Offline Queue! (${result.booking.roomName})`, "warning");
    } else {
      showToast(`Reservation Confirmed for ${result.booking.roomName}! PIN: ${result.booking.keycardPin}`, "success");
    }

    return result;
  };

  const cancelBooking = (id, reason) => {
    const updated = dataStoreService.cancelBooking(id, reason);
    if (updated) {
      loadData();
      refreshNotifications();
      showToast("Reservation successfully cancelled.", "info");
      return true;
    }
    return false;
  };

  const approveBooking = (id, notes) => {
    const updated = dataStoreService.approveBooking(id, notes);
    if (updated) {
      loadData();
      refreshNotifications();
      showToast("Booking request approved!", "success");
      return true;
    }
    return false;
  };

  const rejectBooking = (id, reason) => {
    const updated = dataStoreService.rejectBooking(id, reason);
    if (updated) {
      loadData();
      refreshNotifications();
      showToast("Booking request rejected.", "info");
      return true;
    }
    return false;
  };

  const reassignBooking = (id, newRoomId) => {
    const updated = dataStoreService.reassignBooking(id, newRoomId);
    if (updated) {
      loadData();
      refreshNotifications();
      showToast(`Reservation reassigned to ${updated.roomName}!`, "success");
      return true;
    }
    return false;
  };

  const addRoom = (roomData) => {
    const newRoom = dataStoreService.addRoom(roomData);
    loadData();
    showToast(`Room ${newRoom.name} added to catalog!`, "success");
    return newRoom;
  };

  const updateRoom = (id, updates) => {
    const updated = dataStoreService.updateRoom(id, updates);
    loadData();
    showToast(`Room ${updated.name} updated!`, "success");
    return updated;
  };

  const toggleRoomMaintenance = (roomId) => {
    const updated = dataStoreService.toggleRoomMaintenance(roomId);
    loadData();
    const isMaint = updated.status === "MAINTENANCE";
    showToast(
      isMaint ? `${updated.name} marked under Maintenance.` : `${updated.name} restored to Available!`,
      isMaint ? "warning" : "success"
    );
    return updated;
  };

  const checkAvailability = (roomId, date, startTime, endTime, excludeBookingId) => {
    return dataStoreService.checkAvailability(roomId, date, startTime, endTime, excludeBookingId);
  };

  const resetAllData = () => {
    dataStoreService.resetAllData();
    loadData();
    refreshNotifications();
    showToast("All room and booking data reset to default demo state.", "info");
  };

  return (
    <BookingContext.Provider
      value={{
        rooms,
        bookings,
        isOfflineSim,
        offlineQueue,
        toggleOfflineSim,
        createBooking,
        cancelBooking,
        approveBooking,
        rejectBooking,
        reassignBooking,
        addRoom,
        updateRoom,
        toggleRoomMaintenance,
        checkAvailability,
        searchQuery,
        setSearchQuery,
        activeBuildingFilter,
        setActiveBuildingFilter,
        activeTypeFilter,
        setActiveTypeFilter,
        activeCapacityFilter,
        setActiveCapacityFilter,
        selectedAmenities,
        setSelectedAmenities,
        quickBookPrefill,
        setQuickBookPrefill,
        resetAllData,
        refreshData: loadData,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within BookingProvider");
  return context;
};
