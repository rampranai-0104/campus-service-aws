import { generateClient } from "aws-amplify/api";
import { getCurrentUser, fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";

let apiClient = null;
const getClient = () => {
  if (!apiClient) {
    apiClient = generateClient();
  }
  return apiClient;
};

export const formatTicketForUI = (item) => ({
  id: item.id,
  userId: item.userId,
  userName: item.userName || "Campus Member",
  userRole: item.userRole || "STUDENT",
  roomId: item.roomId || null,
  roomName: item.roomName || "General Facility",
  category: item.category || "Facilities",
  subject: item.subject,
  description: item.description,
  priority: item.priority || "MEDIUM",
  status: item.status || "OPEN",
  adminResponse: item.adminResponse || "",
  createdAt: item.createdAt || new Date().toISOString(),
  updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
});

export const supportTicketService = {
  /**
   * Submit a new support ticket using live authenticated session
   */
  async createTicket({ roomId = "", roomName = "", category = "Facilities", subject, description, priority = "MEDIUM" }) {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("You must be logged in to submit a facilities support ticket.");
    }

    const session = await fetchAuthSession();
    const attributes = await fetchUserAttributes().catch(() => ({}));
    const groups = session?.tokens?.idToken?.payload?.["cognito:groups"] || [];
    const isAdmin = groups.includes("Admin");
    const isFaculty = groups.includes("Faculty");
    const userRole = isAdmin ? "Admin" : isFaculty ? "Faculty" : "Student";
    const userName = attributes.name || user.signInDetails?.loginId || user.username;
    const userId = user.userId || user.username;

    const client = getClient();
    const res = await client.models.SupportTicket.create({
      userId,
      userName,
      userRole,
      roomId: roomId || undefined,
      roomName: roomName || undefined,
      category,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      status: "OPEN",
    });

    if (res?.errors && res.errors.length > 0) {
      throw new Error(res.errors[0].message || "Failed to submit ticket.");
    }

    if (res?.data) {
      return formatTicketForUI(res.data);
    }

    throw new Error("Failed to create support ticket on AWS AppSync.");
  },

  /**
   * Fetch tickets for current user (or all tickets if Admin)
   */
  async getTickets(userId = null, isAdmin = false) {
    try {
      const client = getClient();
      let res;
      if (isAdmin) {
        res = await client.models.SupportTicket.list({ limit: 1000 });
      } else if (userId) {
        // AppSync owner authorization automatically scopes list() to owner
        res = await client.models.SupportTicket.list({ limit: 1000 });
      } else {
        return [];
      }

      if (Array.isArray(res?.data)) {
        return res.data
          .filter((t) => isAdmin || t.userId === userId)
          .map(formatTicketForUI)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return [];
    } catch (err) {
      console.warn("Failed to load tickets from AppSync:", err);
      return [];
    }
  },

  /**
   * Update ticket status and admin response (Admin only)
   */
  async updateTicketStatus(id, { status, adminResponse = "" }) {
    try {
      const client = getClient();
      const payload = { id, status };
      if (adminResponse !== undefined) {
        payload.adminResponse = adminResponse;
      }

      const res = await client.models.SupportTicket.update(payload);

      if (res?.data) {
        return {
          success: true,
          ticket: formatTicketForUI(res.data),
        };
      }

      throw new Error(res?.errors?.[0]?.message || "Failed to update ticket");
    } catch (err) {
      return {
        success: false,
        error: err.message || "Failed to update ticket",
      };
    }
  },

  /**
   * Real-time subscription to support ticket mutations
   */
  subscribeToTickets(onUpdate) {
    try {
      const client = getClient();
      const subCreate = client.models.SupportTicket.onCreate().subscribe({
        next: () => onUpdate(),
        error: (err) => console.warn("Ticket onCreate subscription error:", err),
      });
      const subUpdate = client.models.SupportTicket.onUpdate().subscribe({
        next: () => onUpdate(),
        error: (err) => console.warn("Ticket onUpdate subscription error:", err),
      });

      return () => {
        subCreate.unsubscribe();
        subUpdate.unsubscribe();
      };
    } catch (err) {
      console.warn("Failed to subscribe to SupportTicket:", err);
      return () => {};
    }
  },
};

export default supportTicketService;
