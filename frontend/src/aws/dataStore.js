// CampusRoom DataStore & Offline Service Layer
// Mirrors AWS Amplify DataStore with optimistic updates, collision detection, and offline queueing

import { initialRooms, initialBookings, initialNotifications } from "./mockData";

const STORAGE_KEYS = {
  ROOMS: "campusroom_rooms_v1",
  BOOKINGS: "campusroom_bookings_v1",
  NOTIFICATIONS: "campusroom_notifications_v1",
  OFFLINE_QUEUE: "campusroom_offline_queue_v1",
  OFFLINE_MODE: "campusroom_offline_sim_active",
};

// Safe storage access
const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

const saveToStorage = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

export const dataStoreService = {
  // Initialize initial data if absent
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      saveToStorage(STORAGE_KEYS.ROOMS, initialRooms);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      saveToStorage(STORAGE_KEYS.BOOKINGS, initialBookings);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    }
  },

  // Rooms
  getRooms() {
    this.init();
    return loadFromStorage(STORAGE_KEYS.ROOMS, initialRooms);
  },

  getRoomById(id) {
    const rooms = this.getRooms();
    return rooms.find((r) => r.id === id || r.code === id) || null;
  },

  addRoom(roomData) {
    const rooms = this.getRooms();
    const newRoom = {
      id: `room-${Date.now()}`,
      code: roomData.code || `RM-${Math.floor(100 + Math.random() * 900)}`,
      name: roomData.name,
      building: roomData.building,
      campusSector: roomData.campusSector || "Main Campus",
      floor: roomData.floor || "Floor 1",
      capacity: parseInt(roomData.capacity, 10) || 10,
      roomType: roomData.roomType || "LAB",
      typeLabel: roomData.typeLabel || "Room",
      facilities: roomData.facilities || ["Wi-Fi 6E", "Whiteboard"],
      status: roomData.status || "AVAILABLE",
      custodian: roomData.custodian || "Facilities Staff",
      instantBookable: roomData.instantBookable !== false,
      image: roomData.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      description: roomData.description || "",
      createdAt: new Date().toISOString(),
    };
    rooms.unshift(newRoom);
    saveToStorage(STORAGE_KEYS.ROOMS, rooms);
    return newRoom;
  },

  updateRoom(id, updates) {
    const rooms = this.getRooms();
    const index = rooms.findIndex((r) => r.id === id);
    if (index === -1) return null;
    rooms[index] = { ...rooms[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.ROOMS, rooms);
    return rooms[index];
  },

  toggleRoomMaintenance(id) {
    const room = this.getRoomById(id);
    if (!room) return null;
    const newStatus = room.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
    return this.updateRoom(id, { status: newStatus });
  },

  // Bookings
  getBookings() {
    this.init();
    return loadFromStorage(STORAGE_KEYS.BOOKINGS, initialBookings);
  },

  // Conflict Checking Engine
  checkAvailability(roomId, date, startTime, endTime, excludeBookingId = null) {
    const bookings = this.getBookings();
    
    // Filter active bookings for same room & date
    const conflicts = bookings.filter((b) => {
      if (b.roomId !== roomId) return false;
      if (b.date !== date) return false;
      if (b.status === "CANCELLED" || b.status === "REJECTED") return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;

      // Time overlap calculation
      // A booking [startA, endA) overlaps with [startB, endB) if:
      // startA < endB && endA > startB
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
      message: "Slot Available: No collision detected in local index or AWS cloud.",
    };
  },

  createBooking(bookingInput, isOffline = false) {
    // Validate conflict first
    const availability = this.checkAvailability(
      bookingInput.roomId,
      bookingInput.date,
      bookingInput.startTime,
      bookingInput.endTime
    );

    if (!availability.isAvailable) {
      return {
        success: false,
        error: availability.message,
        conflictingBooking: availability.conflictingBooking,
      };
    }

    const bookings = this.getBookings();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const newBooking = {
      id: `bk-${Date.now()}`,
      userId: bookingInput.userId || "usr-faculty-01",
      userName: bookingInput.userName || "Dr. Sarah Chen",
      userRole: bookingInput.userRole || "STAFF",
      roomId: bookingInput.roomId,
      roomName: bookingInput.roomName,
      roomCode: bookingInput.roomCode || "RM",
      building: bookingInput.building,
      date: bookingInput.date,
      startTime: bookingInput.startTime,
      endTime: bookingInput.endTime,
      purpose: bookingInput.purpose || "Academic Session",
      attendeeCount: parseInt(bookingInput.attendeeCount, 10) || 1,
      status: bookingInput.status || (bookingInput.userRole === "STUDENT" && bookingInput.capacity > 50 ? "PENDING" : "CONFIRMED"),
      syncState: isOffline ? "PENDING_LOCAL" : "SYNCED",
      keycardPin: pin,
      qrPassCode: `PASS-${pin}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);

    // If offline, also push to offline queue
    if (isOffline) {
      const queue = loadFromStorage(STORAGE_KEYS.OFFLINE_QUEUE, []);
      queue.push({
        action: "CREATE_BOOKING",
        bookingId: newBooking.id,
        timestamp: new Date().toISOString(),
      });
      saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    }

    // Add a notification for user
    this.addNotification({
      userId: newBooking.userId,
      title: isOffline ? "Queued in Local DataStore" : "Reservation Confirmed",
      message: isOffline
        ? `Booking for ${newBooking.roomName} saved to offline queue. Will sync when reconnected.`
        : `${newBooking.roomName} confirmed for ${newBooking.date} at ${newBooking.startTime}. Keycard PIN: ${pin}.`,
      type: "BOOKING_CONFIRMED",
    });

    return {
      success: true,
      booking: newBooking,
    };
  },

  cancelBooking(id, reason = "") {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      status: "CANCELLED",
      cancelReason: reason,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);

    this.addNotification({
      userId: bookings[index].userId,
      title: "Booking Cancelled",
      message: `Your reservation for ${bookings[index].roomName} on ${bookings[index].date} has been cancelled.`,
      type: "BOOKING_CANCELLED",
    });

    return bookings[index];
  },

  approveBooking(id, adminNotes = "") {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    bookings[index] = {
      ...bookings[index],
      status: "CONFIRMED",
      keycardPin: pin,
      qrPassCode: `PASS-${pin}`,
      adminNotes,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);

    this.addNotification({
      userId: bookings[index].userId,
      title: "Request Approved",
      message: `Your reservation request for ${bookings[index].roomName} has been approved by Facilities! Access PIN: ${pin}.`,
      type: "REQUEST_APPROVED",
    });

    return bookings[index];
  },

  rejectBooking(id, reason = "") {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      status: "REJECTED",
      adminNotes: reason,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);

    this.addNotification({
      userId: bookings[index].userId,
      title: "Booking Request Rejected",
      message: `Your request for ${bookings[index].roomName} was not approved: ${reason || "Room required for departmental examination."}`,
      type: "REQUEST_REJECTED",
    });

    return bookings[index];
  },

  reassignBooking(id, newRoomId) {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const newRoom = this.getRoomById(newRoomId);
    if (!newRoom) return null;

    bookings[index] = {
      ...bookings[index],
      roomId: newRoom.id,
      roomName: newRoom.name,
      roomCode: newRoom.code,
      building: newRoom.building,
      status: "CONFIRMED",
      adminNotes: `Reassigned to ${newRoom.name} by administrator.`,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);

    this.addNotification({
      userId: bookings[index].userId,
      title: "Room Reassigned",
      message: `Your reservation on ${bookings[index].date} has been relocated to ${newRoom.name} (${newRoom.building}).`,
      type: "REQUEST_APPROVED",
    });

    return bookings[index];
  },

  // Offline Simulation State & Queue
  isOfflineSimActive() {
    return loadFromStorage(STORAGE_KEYS.OFFLINE_MODE, false);
  },

  setOfflineSimActive(active) {
    saveToStorage(STORAGE_KEYS.OFFLINE_MODE, Boolean(active));
    if (!active) {
      // Sync all pending bookings
      this.syncOfflineQueue();
    }
  },

  getOfflineQueue() {
    return loadFromStorage(STORAGE_KEYS.OFFLINE_QUEUE, []);
  },

  syncOfflineQueue() {
    const bookings = this.getBookings();
    let updated = false;

    bookings.forEach((b) => {
      if (b.syncState === "PENDING_LOCAL") {
        b.syncState = "SYNCED";
        updated = true;
      }
    });

    if (updated) {
      saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);
    }
    saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, []);
  },

  // Notifications
  getNotifications(userId) {
    this.init();
    const all = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    if (!userId) return all;
    return all.filter((n) => !n.userId || n.userId === userId);
  },

  addNotification(notif) {
    const all = this.getNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: notif.userId || "usr-faculty-01",
      title: notif.title,
      message: notif.message,
      type: notif.type || "INFO",
      isRead: false,
      timestamp: "Just now",
      createdAt: new Date().toISOString(),
    };
    all.unshift(newNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
    return newNotif;
  },

  markAllNotificationsRead(userId) {
    const all = this.getNotifications();
    all.forEach((n) => {
      if (!userId || n.userId === userId) {
        n.isRead = true;
      }
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  },

  // Purge / Reset to initial
  resetAllData() {
    saveToStorage(STORAGE_KEYS.ROOMS, initialRooms);
    saveToStorage(STORAGE_KEYS.BOOKINGS, initialBookings);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, []);
    saveToStorage(STORAGE_KEYS.OFFLINE_MODE, false);
  }
};
