import { generateClient } from "aws-amplify/api";

let apiClient = null;
const getClient = () => {
  if (!apiClient) {
    apiClient = generateClient();
  }
  return apiClient;
};

// Deterministic 4-digit PIN generator from booking ID
const generatePin = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(1000 + (hash % 9000)).toString();
};

/**
 * Format raw AppSync Booking item for UI consumption
 */
export const formatBookingForUI = (b, roomCatalog = []) => {
  const room = roomCatalog.find((r) => r.id === b.roomId || r.code === b.roomId) || {};
  const pin = generatePin(b.id);

  return {
    id: b.id,
    roomId: b.roomId,
    roomName: b.roomName || room.name || `Campus Room ${b.roomId?.slice(-4)}`,
    roomCode: b.roomCode || room.code || "RM",
    building: b.building || room.building || "University Campus",
    userId: b.userId,
    userName: b.userName || "Campus User",
    userRole: b.userRole || "STUDENT",
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime,
    purpose: b.purpose || "Academic Study",
    attendeeCount: b.attendeeCount || 1,
    status: b.status || "CONFIRMED",
    syncState: "SYNCED",
    keycardPin: pin,
    qrPassCode: `PASS-${pin}-${b.id?.slice(-4)}`,
    adminNotes: b.adminNotes || "",
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: b.updatedAt,
  };
};

export const bookingService = {
  /**
   * Fetch all bookings from AppSync
   */
  async getBookings(roomCatalog = []) {
    try {
      const client = getClient();
      const res = await client.models.Booking.list({ limit: 1000 });
      if (Array.isArray(res?.data)) {
        return res.data.map((item) => formatBookingForUI(item, roomCatalog));
      }
      return [];
    } catch (e) {
      console.warn("AppSync Booking.list() failed:", e);
      throw e;
    }
  },

  /**
   * Client-side availability check
   */
  checkAvailability(roomId, date, startTime, endTime, bookings = [], excludeBookingId = null) {
    const conflicts = bookings.filter((b) => {
      if (b.roomId !== roomId) return false;
      if (b.date !== date) return false;
      if (b.status === "CANCELLED" || b.status === "REJECTED") return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;

      // Overlap: startA < endB && endA > startB
      const startA = b.startTime;
      const endA = b.endTime;
      const startB = startTime;
      const endB = endTime;

      return startA < endB && endA > startB;
    });

    if (conflicts.length > 0) {
      return {
        isAvailable: false,
        conflictingBooking: conflicts[0],
        message: `Collision: Room is already booked for "${conflicts[0].purpose}" (${conflicts[0].startTime} - ${conflicts[0].endTime}).`,
      };
    }

    return {
      isAvailable: true,
      conflictingBooking: null,
      message: "Slot Available: No collision detected.",
    };
  },

  /**
   * Create a booking using the AWS AppSync custom conflict engine mutation
   * or direct model creation fallback
   */
  async createBooking(bookingInput, roomCatalog = []) {
    const targetRoom = roomCatalog.find((r) => r.id === bookingInput.roomId);
    if (targetRoom && targetRoom.status === "MAINTENANCE") {
      return {
        success: false,
        error: `Space Unavailable: "${targetRoom.name}" is currently under maintenance and cannot be reserved.`,
      };
    }

    const client = getClient();

    // 1. Try atomic server-side conflict check mutation first
    try {
      if (client.mutations?.createBookingWithConflictCheck) {
        const res = await client.mutations.createBookingWithConflictCheck({
          roomId: bookingInput.roomId,
          date: bookingInput.date,
          startTime: bookingInput.startTime,
          endTime: bookingInput.endTime,
          purpose: bookingInput.purpose || "Academic Session",
        });

        const result = res?.data;
        if (result) {
          if (!result.success) {
            return {
              success: false,
              error: result.message || "Room conflict detected by AWS AppSync engine.",
              conflictingBookingId: result.conflictingBookingId,
            };
          }

          // If booking was created via Lambda
          const room = roomCatalog.find((r) => r.id === bookingInput.roomId) || {};
          const pin = generatePin(result.bookingId);
          const newBooking = {
            id: result.bookingId,
            roomId: result.roomId || bookingInput.roomId,
            roomName: room.name || bookingInput.roomName || "Reserved Room",
            roomCode: room.code || bookingInput.roomCode || "RM",
            building: room.building || bookingInput.building || "University Campus",
            userId: bookingInput.userId,
            userName: bookingInput.userName,
            userRole: bookingInput.userRole || "STUDENT",
            date: result.date || bookingInput.date,
            startTime: result.startTime || bookingInput.startTime,
            endTime: result.endTime || bookingInput.endTime,
            purpose: bookingInput.purpose,
            attendeeCount: parseInt(bookingInput.attendeeCount, 10) || 1,
            status: result.status || (bookingInput.userRole === "ADMIN" ? "CONFIRMED" : "PENDING"),
            syncState: "SYNCED",
            keycardPin: pin,
            qrPassCode: `PASS-${pin}`,
            createdAt: new Date().toISOString(),
          };

          return {
            success: true,
            booking: newBooking,
          };
        }
      }
    } catch (mutationErr) {
      console.warn("createBookingWithConflictCheck mutation failed, falling back to direct Booking.create():", mutationErr);
    }

    // 2. Direct model create fallback with AppSync client
    try {
      const status = bookingInput.userRole === "ADMIN" ? "CONFIRMED" : "PENDING";

      const res = await client.models.Booking.create({
        roomId: bookingInput.roomId,
        userId: bookingInput.userId,
        userName: bookingInput.userName || "University User",
        userRole: bookingInput.userRole || "STUDENT",
        date: bookingInput.date,
        startTime: bookingInput.startTime,
        endTime: bookingInput.endTime,
        purpose: bookingInput.purpose || "Academic Reservation",
        status,
      });

      if (res?.data) {
        return {
          success: true,
          booking: formatBookingForUI(res.data, roomCatalog),
        };
      }
      throw new Error(res?.errors?.[0]?.message || "Failed to create booking in AppSync");
    } catch (createErr) {
      return {
        success: false,
        error: createErr.message || "Failed to reserve room",
      };
    }
  },

  /**
   * Cancel an existing booking
   */
  async cancelBooking(id) {
    try {
      const client = getClient();
      const res = await client.models.Booking.update({
        id,
        status: "CANCELLED",
      });
      return Boolean(res?.data);
    } catch (e) {
      console.warn("Booking cancellation failed on AppSync:", e);
      return false;
    }
  },

  /**
   * Approve a pending booking with conflict protection (Admin only)
   * Re-checks the room/date/time for active conflicting bookings before confirming.
   */
  async approveBooking(id, _adminNotes = "") {
    try {
      const client = getClient();
      // 1. Fetch current booking details
      const getRes = await client.models.Booking.get({ id });
      const booking = getRes?.data;
      if (!booking) {
        return { success: false, error: "Booking record not found on AppSync." };
      }

      // 2. Query all bookings for this room & date to check for conflicts
      const listRes = await client.models.Booking.list({
        filter: {
          roomId: { eq: booking.roomId },
          date: { eq: booking.date },
        },
      });

      const existingBookings = listRes?.data || [];
      const conflicting = existingBookings.find((b) => {
        if (b.id === id) return false;
        if (b.status === "CANCELLED" || b.status === "REJECTED") return false;
        // Interval overlap check: existingStart < newEnd && existingEnd > newStart
        return b.startTime < booking.endTime && b.endTime > booking.startTime;
      });

      if (conflicting) {
        return {
          success: false,
          error: `Approval Conflict: Room is already reserved for "${conflicting.purpose}" from ${conflicting.startTime} to ${conflicting.endTime} (${conflicting.status}). Cannot approve this request.`,
          conflictingBookingId: conflicting.id,
        };
      }

      // 3. Update status to CONFIRMED
      const res = await client.models.Booking.update({
        id,
        status: "CONFIRMED",
      });

      if (res?.data) {
        const pin = generatePin(id);
        return {
          success: true,
          booking: res.data,
          pin,
        };
      }
      return { success: false, error: "Failed to update booking status on AppSync." };
    } catch (e) {
      console.warn("Booking approval failed on AppSync:", e);
      return { success: false, error: e.message || "Approval failed" };
    }
  },

  /**
   * Reject a pending booking (Admin only)
   */
  async rejectBooking(id, reason = "") {
    try {
      const client = getClient();
      const res = await client.models.Booking.update({
        id,
        status: "REJECTED",
      });
      return {
        success: Boolean(res?.data),
        booking: res?.data,
        reason,
      };
    } catch (e) {
      console.warn("Booking rejection failed on AppSync:", e);
      return { success: false, error: e.message || "Rejection failed" };
    }
  },

  /**
   * Reassign a booking to an alternative room with validation & conflict protection (Admin only)
   */
  async reassignBooking(id, newRoomId) {
    try {
      const client = getClient();
      // 1. Fetch current booking details
      const getRes = await client.models.Booking.get({ id });
      const booking = getRes?.data;
      if (!booking) {
        return { success: false, error: "Booking record not found on AppSync." };
      }

      // 2. Verify target room exists
      const roomRes = await client.models.Room.get({ id: newRoomId });
      const targetRoom = roomRes?.data;
      if (!targetRoom) {
        return { success: false, error: "Target room does not exist in catalog." };
      }

      // 3. Verify target room is AVAILABLE
      if (targetRoom.status !== "AVAILABLE") {
        return {
          success: false,
          error: `Target room "${targetRoom.name}" is currently ${targetRoom.status} and cannot be assigned.`,
        };
      }

      // 4. Verify target room capacity is sufficient
      const requiredCapacity = booking.attendeeCount || 1;
      if (targetRoom.capacity < requiredCapacity) {
        return {
          success: false,
          error: `Insufficient capacity: Target room "${targetRoom.name}" accommodates ${targetRoom.capacity} persons, but reservation requires ${requiredCapacity}.`,
        };
      }

      // 5. Check target room for schedule conflicts on this date and time
      const listRes = await client.models.Booking.list({
        filter: {
          roomId: { eq: newRoomId },
          date: { eq: booking.date },
        },
      });

      const existingBookings = listRes?.data || [];
      const conflicting = existingBookings.find((b) => {
        if (b.id === id) return false;
        if (b.status === "CANCELLED" || b.status === "REJECTED") return false;
        // Interval overlap check: existingStart < newEnd && existingEnd > newStart
        return b.startTime < booking.endTime && b.endTime > booking.startTime;
      });

      if (conflicting) {
        return {
          success: false,
          error: `Reassignment Collision: Room "${targetRoom.name}" is already booked for "${conflicting.purpose}" from ${conflicting.startTime} to ${conflicting.endTime} (${conflicting.status}).`,
          conflictingBookingId: conflicting.id,
        };
      }

      // 6. Update booking room and status to CONFIRMED
      const res = await client.models.Booking.update({
        id,
        roomId: newRoomId,
        status: "CONFIRMED",
      });

      if (res?.data) {
        const pin = generatePin(id);
        return {
          success: true,
          booking: res.data,
          targetRoom,
          pin,
        };
      }
      return { success: false, error: "Failed to update reassigned booking on AppSync." };
    } catch (e) {
      console.warn("Booking reassignment failed on AppSync:", e);
      return { success: false, error: e.message || "Reassignment failed" };
    }
  },
};

export default bookingService;
