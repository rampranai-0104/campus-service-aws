import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { roomService } from "../services/roomService";
import { bookingService } from "../services/bookingService";
import { notificationService } from "../services/notificationService";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { currentUser, isAuthenticated, isLoadingAuth, isAdmin } = useAuth();
  const { showToast, refreshNotifications } = useNotifications();

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isOfflineSim, setIsOfflineSim] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBuildingFilter, setActiveBuildingFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [activeCapacityFilter, setActiveCapacityFilter] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [quickBookPrefill, setQuickBookPrefill] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const loadedRooms = await roomService.getRooms();
      setRooms(loadedRooms);

      const loadedBookings = await bookingService.getBookings(loadedRooms);
      setBookings(loadedBookings);

      // If user is Admin, auto-seed catalog to AppSync if empty
      if (isAdmin && loadedRooms.length > 0) {
        roomService.seedInitialRoomsIfEmpty().catch(console.warn);
      }
    } catch (e) {
      console.warn("Error loading rooms and bookings from AWS services:", e);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isLoadingAuth) {
      loadData();
    }
  }, [loadData, currentUser?.userId, currentUser?.email, isAuthenticated, isLoadingAuth]);

  const toggleOfflineSim = () => {
    const nextState = !isOfflineSim;
    setIsOfflineSim(nextState);

    if (nextState) {
      showToast("Offline Simulation Mode Enabled: Writes queued in client state.", "warning");
    } else {
      showToast("Online Synced: AWS AppSync connected & local queue reconciled!", "success");
      loadData();
    }
    refreshNotifications();
  };

  const createBooking = async (bookingData) => {
    const payload = {
      ...bookingData,
      userId: currentUser?.id || currentUser?.userId || "campus-user",
      userName: currentUser?.name || "University User",
      userRole: currentUser?.role || "STUDENT",
    };

    // Client-side availability pre-check
    const availability = bookingService.checkAvailability(
      payload.roomId,
      payload.date,
      payload.startTime,
      payload.endTime,
      bookings
    );

    if (!availability.isAvailable) {
      showToast(availability.message || "Room booking conflict detected!", "error");
      return { success: false, error: availability.message };
    }

    // Call live AppSync conflict mutation / API
    const result = await bookingService.createBooking(payload, rooms);

    if (!result.success) {
      showToast(result.error || "Room booking conflict detected on AWS!", "error");
      return result;
    }

    const isPending = result.booking.status === "PENDING";

    if (isPending) {
      await notificationService.createNotification({
        userId: payload.userId,
        title: "Reservation Request Submitted",
        message: `Request for ${result.booking.roomName} on ${result.booking.date} (${result.booking.startTime} - ${result.booking.endTime}) submitted. Awaiting Facilities review.`,
        type: "BOOKING_REQUESTED",
      });

      await loadData();
      refreshNotifications();

      showToast(
        `Reservation request submitted for ${result.booking.roomName}! Awaiting administrator review.`,
        "info"
      );
    } else {
      await notificationService.createNotification({
        userId: payload.userId,
        title: "Reservation Confirmed",
        message: `${result.booking.roomName} confirmed for ${result.booking.date} at ${result.booking.startTime}. Access PIN: ${result.booking.keycardPin}.`,
        type: "BOOKING_CONFIRMED",
      });

      await loadData();
      refreshNotifications();

      showToast(
        `Reservation Confirmed for ${result.booking.roomName}! PIN: ${result.booking.keycardPin}`,
        "success"
      );
    }

    return result;
  };

  const cancelBooking = async (id, _reason = "") => {
    const targetBooking = bookings.find((b) => b.id === id);
    const success = await bookingService.cancelBooking(id);

    if (success) {
      if (targetBooking?.userId) {
        await notificationService.createNotification({
          userId: targetBooking.userId,
          title: "Booking Cancelled",
          message: `Your reservation for ${targetBooking.roomName || "room"} on ${targetBooking.date} has been cancelled.`,
          type: "BOOKING_CANCELLED",
        });
      }

      await loadData();
      refreshNotifications();
      showToast("Reservation successfully cancelled.", "info");
      return true;
    }

    showToast("Failed to cancel booking. Please try again.", "error");
    return false;
  };

  const approveBooking = async (id, _adminNotes = "") => {
    const targetBooking = bookings.find((b) => b.id === id);
    const result = await bookingService.approveBooking(id, _adminNotes);

    if (result.success) {
      if (targetBooking?.userId) {
        await notificationService.createNotification({
          userId: targetBooking.userId,
          title: "Request Approved",
          message: `Your reservation request for ${targetBooking.roomName} on ${targetBooking.date} was approved by Facilities. Access PIN: ${result.pin || targetBooking.keycardPin}.`,
          type: "REQUEST_APPROVED",
        });
      }

      await loadData();
      refreshNotifications();
      showToast("Booking request approved!", "success");
      return result;
    }

    showToast(result.error || "Failed to approve booking.", "error");
    return result;
  };

  const rejectBooking = async (id, reason = "") => {
    const targetBooking = bookings.find((b) => b.id === id);
    const result = await bookingService.rejectBooking(id, reason);

    if (result.success) {
      if (targetBooking?.userId) {
        await notificationService.createNotification({
          userId: targetBooking.userId,
          title: "Booking Request Rejected",
          message: `Your reservation request for ${targetBooking.roomName} was not approved: ${reason || "Room required for departmental examination."}`,
          type: "REQUEST_REJECTED",
        });
      }

      await loadData();
      refreshNotifications();
      showToast("Booking request rejected.", "info");
      return result;
    }

    showToast(result.error || "Failed to reject booking.", "error");
    return result;
  };

  const reassignBooking = async (id, newRoomId) => {
    const targetBooking = bookings.find((b) => b.id === id);
    const result = await bookingService.reassignBooking(id, newRoomId);

    if (result.success) {
      const assignedRoom = result.targetRoom || rooms.find((r) => r.id === newRoomId);
      if (targetBooking?.userId) {
        await notificationService.createNotification({
          userId: targetBooking.userId,
          title: "Booking Reassigned",
          message: `Your reservation on ${targetBooking.date} was reassigned to ${assignedRoom?.name || "a different space"} (${assignedRoom?.building || ""}). Access PIN: ${result.pin || targetBooking.keycardPin}.`,
          type: "REQUEST_REASSIGNED",
        });
      }

      await loadData();
      refreshNotifications();
      showToast(`Reservation reassigned to ${assignedRoom?.name || "new room"}!`, "success");
      return result;
    }

    showToast(result.error || "Failed to reassign reservation.", "error");
    return result;
  };

  const addRoom = async (roomData) => {
    try {
      const newRoom = await roomService.createRoom(roomData);
      await loadData();
      showToast(`Room ${newRoom.name} added to catalog!`, "success");
      return newRoom;
    } catch (err) {
      showToast(err.message || "Failed to add room", "error");
      return null;
    }
  };

  const updateRoom = async (id, updates) => {
    try {
      const updated = await roomService.updateRoom(id, updates);
      await loadData();
      showToast(`Room ${updated.name} updated!`, "success");
      return updated;
    } catch (err) {
      showToast(err.message || "Failed to update room", "error");
      return null;
    }
  };

  const toggleRoomMaintenance = async (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return null;

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const futureConfirmed = bookings.filter(
        (b) => b.roomId === roomId && b.status === "CONFIRMED" && b.date >= todayStr
      );

      const updated = await roomService.toggleRoomMaintenance(roomId, room.status);
      await loadData();
      const isMaint = updated.status === "MAINTENANCE";

      if (isMaint) {
        if (futureConfirmed.length > 0) {
          showToast(
            `${updated.name} set to Maintenance. Note: ${futureConfirmed.length} upcoming confirmed reservation(s) preserved. Review or reassign if space is physically inaccessible.`,
            "warning",
            6000
          );
        } else {
          showToast(`${updated.name} marked under Maintenance.`, "warning");
        }
      } else {
        showToast(`${updated.name} restored to Available!`, "success");
      }
      return updated;
    } catch (err) {
      showToast(err.message || "Failed to toggle maintenance status", "error");
      return null;
    }
  };

  const checkAvailability = (roomId, date, startTime, endTime, excludeBookingId = null) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (targetRoom && targetRoom.status === "MAINTENANCE") {
      return {
        isAvailable: false,
        conflictingBooking: null,
        message: `Maintenance Notice: "${targetRoom.name}" is currently under maintenance and cannot be reserved.`,
      };
    }
    return bookingService.checkAvailability(roomId, date, startTime, endTime, bookings, excludeBookingId);
  };

  const resetAllData = async () => {
    await loadData();
    showToast("Refreshed live data from AWS Amplify backend.", "info");
  };

  return (
    <BookingContext.Provider
      value={{
        rooms,
        bookings,
        isLoadingData,
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

export default BookingContext;
