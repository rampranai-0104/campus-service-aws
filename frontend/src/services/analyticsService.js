/**
 * Analytics calculation engine based entirely on live AWS AppSync Room and Booking data.
 * Pure mathematical functions handling HH:MM durations, room capacities, building aggregations,
 * and hourly occupancy intervals.
 */

/**
 * Converts "HH:MM" string to minutes from midnight
 */
export const parseTimeToMinutes = (timeStr = "00:00") => {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.trim().split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
};

/**
 * Calculates duration in decimal hours for a booking
 */
export const getBookingDurationHours = (booking) => {
  if (!booking?.startTime || !booking?.endTime) return 0;
  const startMin = parseTimeToMinutes(booking.startTime);
  const endMin = parseTimeToMinutes(booking.endTime);
  if (endMin <= startMin) return 0;
  return (endMin - startMin) / 60;
};

/**
 * Total confirmed booked hours across all spaces
 */
export const calculateTotalHoursBooked = (bookings = []) => {
  if (!Array.isArray(bookings)) return 0;
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const total = confirmed.reduce((sum, b) => sum + getBookingDurationHours(b), 0);
  return Math.round(total * 10) / 10;
};

/**
 * Booking counts segregated strictly by status
 */
export const getBookingStatusCounts = (bookings = []) => {
  if (!Array.isArray(bookings)) {
    return { confirmed: 0, pending: 0, cancelled: 0, rejected: 0, total: 0 };
  }

  let confirmed = 0;
  let pending = 0;
  let cancelled = 0;
  let rejected = 0;

  for (const b of bookings) {
    if (b.status === "CONFIRMED") confirmed++;
    else if (b.status === "PENDING") pending++;
    else if (b.status === "CANCELLED") cancelled++;
    else if (b.status === "REJECTED") rejected++;
  }

  return {
    confirmed,
    pending,
    cancelled,
    rejected,
    total: bookings.length,
  };
};

/**
 * Overall space efficiency calculation:
 * (Total Confirmed Booked Hours / Total Available Room Operating Capacity) * 100
 * Standard operating capacity assumes 12 hrs/day over 5 business days = 60 operating hrs/week per room.
 */
export const calculateSpaceEfficiency = (rooms = [], bookings = [], operatingHoursPerWeek = 60) => {
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return { pct: 0, formatted: "0.0%", totalBookedHours: 0, totalCapacityHours: 0 };
  }

  const availableRooms = rooms.filter((r) => r.status !== "MAINTENANCE").length;
  const totalCapacityHours = availableRooms * operatingHoursPerWeek;
  const totalBookedHours = calculateTotalHoursBooked(bookings);

  const efficiency = totalCapacityHours > 0 ? (totalBookedHours / totalCapacityHours) * 100 : 0;
  const pct = Math.min(100, Math.round(efficiency * 10) / 10);

  return {
    pct,
    formatted: `${pct.toFixed(1)}%`,
    totalBookedHours,
    totalCapacityHours,
  };
};

/**
 * Complex / Building space utilization:
 * Groups rooms by building and computes confirmed hours vs available operating capacity.
 */
export const calculateComplexUtilization = (rooms = [], bookings = [], operatingHoursPerWeek = 60) => {
  if (!Array.isArray(rooms) || rooms.length === 0) return [];

  const confirmedBookings = (bookings || []).filter((b) => b.status === "CONFIRMED");

  // Group rooms by building name
  const buildingMap = new Map();
  for (const room of rooms) {
    const bName = room.building || "Campus Main Space";
    if (!buildingMap.has(bName)) {
      buildingMap.set(bName, { name: bName, rooms: [], roomIds: new Set() });
    }
    const entry = buildingMap.get(bName);
    entry.rooms.push(room);
    entry.roomIds.add(room.id);
  }

  const result = [];
  for (const [name, entry] of buildingMap.entries()) {
    const totalRooms = entry.rooms.length;
    const availableRooms = entry.rooms.filter((r) => r.status !== "MAINTENANCE").length;

    // Filter bookings belonging to this building
    const bBookings = confirmedBookings.filter((b) => entry.roomIds.has(b.roomId));
    const totalHours = bBookings.reduce((sum, b) => sum + getBookingDurationHours(b), 0);

    const capacityHours = availableRooms * operatingHoursPerWeek;
    const pct = capacityHours > 0 ? Math.min(100, Math.round((totalHours / capacityHours) * 100)) : 0;

    result.push({
      name,
      pct,
      rooms: totalRooms,
      hours: Math.round(totalHours * 10) / 10,
    });
  }

  // Sort by hours descending, then rooms descending
  result.sort((a, b) => b.hours - a.hours || b.rooms - a.rooms);
  return result;
};

/**
 * Hourly occupancy curve:
 * Evaluates occupancy rate across campus operating hours (08:00 to 19:00).
 * A room is considered occupied in an hour slot [H:00 - (H+1):00] if
 * a confirmed booking satisfies: booking.startTime < slotEnd && booking.endTime > slotStart.
 */
export const calculateHourlyOccupancy = (rooms = [], bookings = []) => {
  const operatingHours = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  ];

  const totalAvailableRooms = (rooms || []).filter((r) => r.status !== "MAINTENANCE").length;
  const confirmedBookings = (bookings || []).filter((b) => b.status === "CONFIRMED");

  return operatingHours.map((hourStr) => {
    const slotStartMin = parseTimeToMinutes(hourStr);
    const slotEndMin = slotStartMin + 60; // 1-hour interval

    const activeInSlot = confirmedBookings.filter((b) => {
      const bStartMin = parseTimeToMinutes(b.startTime);
      const bEndMin = parseTimeToMinutes(b.endTime);
      return bStartMin < slotEndMin && bEndMin > slotStartMin;
    });

    const occupiedRoomIds = new Set(activeInSlot.map((b) => b.roomId));
    const occupiedCount = occupiedRoomIds.size;
    const rate = totalAvailableRooms > 0
      ? Math.min(100, Math.round((occupiedCount / totalAvailableRooms) * 100))
      : 0;

    return {
      hour: hourStr,
      rate,
      occupiedRooms: occupiedCount,
      totalRooms: totalAvailableRooms,
    };
  });
};

/**
 * Peak occupancy determination:
 * Finds the highest occupancy hour interval from the distribution.
 */
export const calculatePeakOccupancy = (hourlyDistribution = []) => {
  if (!hourlyDistribution || hourlyDistribution.length === 0) {
    return { peakRate: 0, peakWindow: "No data available", hasActivity: false };
  }

  let maxRate = 0;
  let peakHours = [];

  for (const item of hourlyDistribution) {
    if (item.rate > maxRate) {
      maxRate = item.rate;
      peakHours = [item.hour];
    } else if (item.rate === maxRate && maxRate > 0) {
      peakHours.push(item.hour);
    }
  }

  if (maxRate === 0) {
    return { peakRate: 0, peakWindow: "No peak pressure detected", hasActivity: false };
  }

  const firstHour = peakHours[0];
  const lastHour = peakHours[peakHours.length - 1];
  const lastHourEndNum = parseInt(lastHour.split(":")[0], 10) + 1;
  const lastHourEnd = `${lastHourEndNum.toString().padStart(2, "0")}:00`;
  const peakWindow = `${firstHour} – ${lastHourEnd}`;

  return {
    peakRate: maxRate,
    peakWindow,
    hasActivity: true,
  };
};

/**
 * No-Show telemetry check:
 * Inspects Booking schema support. Since check-in badge/no-show fields are not present
 * in the AWS DynamoDB schema, returns 0 with honest telemetry status.
 */
export const getNoShowsMetrics = () => {
  return {
    value: "0",
    unit: "slots",
    trend: "Telemetry pending check-in integration",
    trendPositive: true,
    available: false,
  };
};

export default {
  parseTimeToMinutes,
  getBookingDurationHours,
  calculateTotalHoursBooked,
  getBookingStatusCounts,
  calculateSpaceEfficiency,
  calculateComplexUtilization,
  calculateHourlyOccupancy,
  calculatePeakOccupancy,
  getNoShowsMetrics,
};
