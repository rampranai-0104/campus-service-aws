import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { generateClient } from "aws-amplify/api";
import { roomService } from "../services/roomService";
import { bookingService } from "../services/bookingService";
import { notificationService } from "../services/notificationService";
import { supportTicketService } from "../services/supportTicketService";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";

const BookingContext = createContext();

let apiClient = null;
const getClient = () => {
  if (!apiClient) {
    apiClient = generateClient();
  }
  return apiClient;
};

export const BookingProvider = ({ children }) => {
  const { currentUser, isAuthenticated, isLoadingAuth, isAdmin } = useAuth();
  const { showToast, refreshNotifications } = useNotifications();

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Truthful Network and Sync State (No fake DataStore simulation)
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [syncStatus, setSyncStatus] = useState("ONLINE • SYNCED"); // 'ONLINE • SYNCED' | 'SYNCING' | 'OFFLINE' | 'ERROR'
  const [lastSyncTime, setLastSyncTime] = useState(() => new Date());

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBuildingFilter, setActiveBuildingFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [activeCapacityFilter, setActiveCapacityFilter] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [quickBookPrefill, setQuickBookPrefill] = useState(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Unified, reliable data fetcher for all AWS live data
   */
  const loadData = useCallback(async () => {
    if (!navigator.onLine) {
      setSyncStatus("OFFLINE");
      return;
    }

    setSyncStatus("SYNCING");
    setDataError(null);

    try {
      const loadedRooms = await roomService.getRooms();
      if (!isMountedRef.current) return;
      setRooms(loadedRooms);

      const loadedBookings = await bookingService.getBookings(loadedRooms);
      if (!isMountedRef.current) return;
      setBookings(loadedBookings);

      if (isAuthenticated && currentUser) {
        const loadedTickets = await supportTicketService.getTickets(
          currentUser.userId,
          isAdmin
        );
        if (isMountedRef.current) {
          setTickets(loadedTickets);
        }
      }

      setSyncStatus("ONLINE • SYNCED");
      setLastSyncTime(new Date());
    } catch (e) {
      console.error("[AWS Live Data Load Error]:", e);
      if (isMountedRef.current) {
        setDataError(e.message || "Failed to load live records from AWS.");
        setSyncStatus("ERROR");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingData(false);
      }
    }
  }, [isAuthenticated, currentUser, isAdmin]);

  // Track online/offline browser events truthfully
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus("SYNCING");
      loadData();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("OFFLINE");
      showToast("Network connection lost. Offline state detected.", "warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [loadData, showToast]);

  // Load data as soon as authentication finishes loading
  useEffect(() => {
    if (!isLoadingAuth) {
      loadData();
    }
  }, [loadData, isLoadingAuth, isAuthenticated, currentUser?.userId]);

  /**
   * Real-time AppSync Subscriptions for live updates
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    let subBookingCreate;
    let subBookingUpdate;
    let subBookingDelete;
    let subRoomUpdate;
    let subTicketCreate;
    let subTicketUpdate;

    try {
      const client = getClient();

      if (client.models?.Booking) {
        subBookingCreate = client.models.Booking.onCreate().subscribe({
          next: () => loadData(),
          error: (err) => console.warn("AppSync Booking.onCreate subscription error:", err),
        });
        subBookingUpdate = client.models.Booking.onUpdate().subscribe({
          next: () => loadData(),
          error: (err) => console.warn("AppSync Booking.onUpdate subscription error:", err),
        });
        subBookingDelete = client.models.Booking.onDelete().subscribe({
          next: () => loadData(),
          error: (err) => console.warn("AppSync Booking.onDelete subscription error:", err),
        });
      }

      if (client.models?.Room) {
        subRoomUpdate = client.models.Room.onUpdate().subscribe({
          next: () => loadData(),
          error: (err) => console.warn("AppSync Room.onUpdate subscription error:", err),
        });
      }

      if (client.models?.SupportTicket) {
        subTicketCreate = client.models.SupportTicket.onCreate().subscribe({
          next: () => loadData(),
          error: (err) => console.warn("AppSync SupportTicket.onCreate subscription error:", err),
        });
        subTicketUpdate = client.models.SupportTicket.onUpdate().subscribe({
          next: () => loadData(),
          error: (err) => console.warn("AppSync SupportTicket.onUpdate subscription error:", err),
        });
      }
    } catch (err) {
      console.warn("Could not establish real-time subscriptions:", err);
    }

    return () => {
      subBookingCreate?.unsubscribe();
      subBookingUpdate?.unsubscribe();
      subBookingDelete?.unsubscribe();
      subRoomUpdate?.unsubscribe();
      subTicketCreate?.unsubscribe();
      subTicketUpdate?.unsubscribe();
    };
  }, [isAuthenticated, loadData]);

  /**
   * Create a booking with conflict verification
   */
  const createBooking = async (bookingData) => {
    if (!isOnline) {
      showToast("Cannot create reservation while offline. Please reconnect.", "error");
      return { success: false, error: "Network offline." };
    }

    const payload = {
      ...bookingData,
      userId: currentUser?.userId || currentUser?.id || "campus-user",
      userName: currentUser?.name || "University User",
      userRole: currentUser?.role === "ADMIN" ? "Admin" : currentUser?.role === "STAFF" ? "Faculty" : "Student",
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
        message: `Request for ${result.booking.roomName} on ${result.booking.date} (${result.booking.startTime} – ${result.booking.endTime}) submitted. Awaiting review.`,
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

  /**
   * Cancel an existing booking
   */
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

  /**
   * Approve a pending booking (Admin only)
   */
  const approveBooking = async (id, adminNotes = "") => {
    const targetBooking = bookings.find((b) => b.id === id);
    const result = await bookingService.approveBooking(id, adminNotes);

    if (result.success) {
      if (targetBooking?.userId) {
        await notificationService.createNotification({
          userId: targetBooking.userId,
          title: "Request Approved",
          message: `Your reservation request for ${targetBooking.roomName} on ${targetBooking.date} was approved. Access PIN: ${result.pin || targetBooking.keycardPin}.`,
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

  /**
   * Reject a pending booking (Admin only)
   */
  const rejectBooking = async (id, reason = "") => {
    const targetBooking = bookings.find((b) => b.id === id);
    const result = await bookingService.rejectBooking(id, reason);

    if (result.success) {
      if (targetBooking?.userId) {
        await notificationService.createNotification({
          userId: targetBooking.userId,
          title: "Booking Request Rejected",
          message: `Your reservation request for ${targetBooking.roomName} was not approved: ${reason || "Room unavailable."}`,
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

  /**
   * Reassign a booking (Admin only)
   */
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

  /**
   * Add a new room (Admin only)
   */
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

  /**
   * Update an existing room (Admin only)
   */
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

  /**
   * Toggle room maintenance state (Admin only)
   */
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

  /**
   * Support Tickets operations
   */
  const createSupportTicket = async (ticketInput) => {
    try {
      const newTicket = await supportTicketService.createTicket(ticketInput);
      await loadData();
      showToast(`Support Ticket #${newTicket.id.slice(-6).toUpperCase()} submitted to Facilities!`, "success");
      return { success: true, ticket: newTicket };
    } catch (err) {
      showToast(err.message || "Failed to submit support ticket.", "error");
      return { success: false, error: err.message };
    }
  };

  const updateSupportTicket = async (ticketId, { status, adminResponse }) => {
    try {
      const result = await supportTicketService.updateTicketStatus(ticketId, {
        status,
        adminResponse,
      });
      if (result.success) {
        await loadData();
        showToast(`Ticket status updated to ${status}.`, "success");
      } else {
        showToast(result.error || "Failed to update ticket.", "error");
      }
      return result;
    } catch (err) {
      showToast(err.message || "Failed to update ticket.", "error");
      return { success: false, error: err.message };
    }
  };

  /**
   * Conflict checking helper
   */
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

  return (
    <BookingContext.Provider
      value={{
        rooms,
        bookings,
        tickets,
        isLoadingData,
        dataError,
        isOnline,
        syncStatus,
        lastSyncTime,
        refreshData: loadData,
        createBooking,
        cancelBooking,
        approveBooking,
        rejectBooking,
        reassignBooking,
        addRoom,
        updateRoom,
        toggleRoomMaintenance,
        createSupportTicket,
        updateSupportTicket,
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
