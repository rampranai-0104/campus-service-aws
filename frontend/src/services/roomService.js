import { generateClient } from "aws-amplify/api";
import { uploadData, getUrl } from "aws-amplify/storage";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";

let apiClient = null;
const getClient = () => {
  if (!apiClient) {
    apiClient = generateClient();
  }
  return apiClient;
};

/**
 * Resolve display URL for room images.
 * If path starts with 'room-images/', generate pre-signed URL from S3.
 * Otherwise, return URL directly.
 */
export const resolveRoomImageUrl = async (imageRef) => {
  if (!imageRef) {
    return "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80";
  }
  if (imageRef.startsWith("room-images/")) {
    try {
      const res = await getUrl({ path: imageRef });
      return res.url.toString();
    } catch (e) {
      console.warn("Could not retrieve S3 image url for", imageRef, e);
      return "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80";
    }
  }
  return imageRef;
};

/**
 * Format raw AppSync Room item into frontend UI representation
 */
export const formatRoomForUI = async (item) => {
  const resolvedImage = await resolveRoomImageUrl(item.image);
  const capacity = Number(item.capacity) || 16;

  let roomType = "LAB";
  let typeLabel = "Computing Lab";
  if (capacity >= 100) {
    roomType = "AUDITORIUM";
    typeLabel = "Lecture Auditorium";
  } else if (capacity >= 30) {
    roomType = "SEMINAR";
    typeLabel = "Seminar Hall";
  } else if (capacity <= 8) {
    roomType = "STUDY_POD";
    typeLabel = "Study Pod";
  }

  return {
    id: item.id,
    code: item.roomNumber || `RM-${item.id.slice(-4)}`,
    roomNumber: item.roomNumber || `RM-${item.id.slice(-4)}`,
    name: item.name || `Room ${item.roomNumber}`,
    building: item.building || "Campus Main Complex",
    campusSector: item.building?.includes("Science") ? "North Campus" : "Central Campus",
    floor: item.floor || "Floor 2",
    capacity,
    roomType,
    typeLabel,
    facilities: Array.isArray(item.facilities) && item.facilities.length > 0
      ? item.facilities
      : ["High-Speed Wi-Fi 6E", "Digital Display", "Whiteboard"],
    status: item.status || "AVAILABLE",
    custodian: "Campus Facilities Director",
    instantBookable: capacity < 60,
    image: resolvedImage,
    rawImageRef: item.image,
    description: item.description || "Modern university learning and collaboration space.",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const roomService = {
  /**
   * Fetch all rooms from AppSync with diagnostic logging & pagination
   */
  async getRooms() {
    let authUser;
    let authRole;
    let hasValidSession;

    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      const idToken = session?.tokens?.idToken;
      hasValidSession = Boolean(idToken);
      const groups = idToken?.payload?.["cognito:groups"] || [];
      authRole = Array.isArray(groups) && groups.length > 0 ? groups.join(", ") : "Authenticated (No Group)";
      authUser = user?.signInDetails?.loginId || user?.username || user?.userId || "Authenticated User";
    } catch {
      authUser = "None (Unauthenticated)";
      authRole = "None";
      hasValidSession = false;
    }

    console.log("[DIAGNOSTIC] ==================== AppSync Room Query ====================");
    console.log("[DIAGNOSTIC] Authenticated User:", authUser);
    console.log("[DIAGNOSTIC] User Role/Groups:", authRole);
    console.log("[DIAGNOSTIC] Has Valid Cognito Session:", hasValidSession);

    try {
      const client = getClient();
      console.log("[DIAGNOSTIC] Calling client.models.Room.list()...");

      let allItems = [];
      let nextToken = null;
      let page = 0;
      let appSyncErrors = [];

      do {
        page++;
        const res = await client.models.Room.list({
          nextToken: nextToken || undefined,
        });

        console.log(`[DIAGNOSTIC] Raw AppSync Room.list() page ${page} response:`, {
          dataCount: res?.data?.length,
          hasErrors: Boolean(res?.errors && res.errors.length > 0),
          errors: res?.errors,
          nextToken: res?.nextToken,
        });

        if (res?.errors && res.errors.length > 0) {
          appSyncErrors.push(...res.errors);
          console.warn(`[DIAGNOSTIC] AppSync returned ${res.errors.length} error(s) on page ${page}:`, res.errors);
        }

        if (Array.isArray(res?.data)) {
          allItems = allItems.concat(res.data);
        }

        nextToken = res?.nextToken;
      } while (nextToken);

      console.log("[DIAGNOSTIC] Number of rooms returned by AppSync:", allItems.length);
      console.log(
        "[DIAGNOSTIC] Room numbers returned:",
        allItems.map((r) => r.roomNumber || r.name || r.id)
      );

      if (appSyncErrors.length > 0) {
        console.warn("[DIAGNOSTIC] AppSync authorization/error response:", appSyncErrors);
      }
      console.log("[DIAGNOSTIC] ==============================================================");

      // If rooms are returned by AppSync, always format and use them
      if (allItems.length > 0) {
        const formatted = await Promise.all(allItems.map(formatRoomForUI));
        return formatted;
      }

      // AppSync returned 0 items
      return [];
    } catch (error) {
      console.error("[DIAGNOSTIC] AppSync Room.list() exception / authorization failure:", error);
      throw error;
    }
  },

  /**
   * Fetch a single room by ID
   */
  async getRoomById(id) {
    try {
      const client = getClient();
      const res = await client.models.Room.get({ id });
      if (res?.data) {
        return await formatRoomForUI(res.data);
      }
    } catch (e) {
      console.warn("AppSync Room.get() failed:", e);
    }
    return null;
  },

  /**
   * Upload an image to Amazon S3 storage
   * Path: room-images/<filename>
   */
  async uploadImage(file) {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `room-images/${Date.now()}-${cleanFileName}`;

    await uploadData({
      path,
      data: file,
      options: {
        contentType: file.type || "image/jpeg",
      },
    }).result;

    const urlRes = await getUrl({ path });
    return {
      path,
      url: urlRes.url.toString(),
    };
  },

  /**
   * Create a new room in AppSync (Admin only)
   */
  async createRoom(roomData) {
    const client = getClient();
    const input = {
      roomNumber: roomData.code || roomData.roomNumber || `RM-${Math.floor(100 + Math.random() * 900)}`,
      name: roomData.name,
      building: roomData.building,
      floor: roomData.floor || "Floor 1",
      capacity: parseInt(roomData.capacity, 10) || 10,
      description: roomData.description || "",
      facilities: roomData.facilities || ["Wi-Fi 6E", "Whiteboard"],
      image: roomData.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      status: roomData.status || "AVAILABLE",
    };

    const res = await client.models.Room.create(input);
    if (res?.data) {
      return await formatRoomForUI(res.data);
    }
    throw new Error(res?.errors?.[0]?.message || "Failed to create room in AppSync");
  },

  /**
   * Update an existing room in AppSync (Admin only)
   */
  async updateRoom(id, updates) {
    const client = getClient();
    const input = { id };

    if (updates.name !== undefined) input.name = updates.name;
    if (updates.code !== undefined || updates.roomNumber !== undefined) {
      input.roomNumber = updates.code || updates.roomNumber;
    }
    if (updates.building !== undefined) input.building = updates.building;
    if (updates.floor !== undefined) input.floor = updates.floor;
    if (updates.capacity !== undefined) input.capacity = parseInt(updates.capacity, 10);
    if (updates.description !== undefined) input.description = updates.description;
    if (updates.facilities !== undefined) input.facilities = updates.facilities;
    if (updates.image !== undefined) input.image = updates.image;
    if (updates.status !== undefined) input.status = updates.status;

    const res = await client.models.Room.update(input);
    if (res?.data) {
      return await formatRoomForUI(res.data);
    }
    throw new Error(res?.errors?.[0]?.message || "Failed to update room in AppSync");
  },

  /**
   * Toggle room maintenance state (Admin only)
   */
  async toggleRoomMaintenance(roomId, currentStatus) {
    const nextStatus = currentStatus === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
    return await this.updateRoom(roomId, { status: nextStatus });
  },

  /**
   * Seed initial rooms to AppSync if table is empty (invoked by Admin)
   */
  async seedInitialRoomsIfEmpty() {
    // Rooms are managed through AppSync directly. No-op.
    return;
  },
};

export default roomService;
