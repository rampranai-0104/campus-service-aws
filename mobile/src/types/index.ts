export type UserRole = 'Student' | 'Faculty' | 'Admin' | 'STUDENT' | 'STAFF' | 'ADMIN';

export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  studentOrStaffId: string;
  avatarUrl?: string;
  groups: string[];
  isAdmin: boolean;
  isStaff: boolean;
  isFaculty: boolean;
  isStudent: boolean;
}

export interface Room {
  id: string;
  roomNumber: string;
  code: string;
  name: string;
  building: string;
  campusSector?: string;
  floor: string;
  capacity: number;
  roomType: 'STUDY_POD' | 'LAB' | 'SEMINAR' | 'AUDITORIUM' | 'CONFERENCE';
  typeLabel: string;
  facilities: string[];
  status: 'AVAILABLE' | 'MAINTENANCE' | 'OCCUPIED';
  image: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  roomCode?: string;
  building: string;
  userId: string;
  userName: string;
  userRole: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  purpose: string;
  attendeeCount: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  keycardPin?: string;
  adminNotes?: string;
  syncState?: 'SYNCED' | 'PENDING_SYNC' | 'CONFLICT';
  syncError?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TicketCategory =
  | 'Facilities'
  | 'Equipment'
  | 'Maintenance'
  | 'Cleaning'
  | 'Electrical'
  | 'Network'
  | 'Other';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  roomId?: string;
  roomName?: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  adminResponse?: string;
  syncState?: 'SYNCED' | 'PENDING_SYNC';
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export type NetworkState = 'ONLINE' | 'OFFLINE' | 'SYNCING';

export interface QueuedAction {
  id: string;
  type: 'CREATE_BOOKING' | 'CANCEL_BOOKING' | 'CREATE_TICKET';
  payload: any;
  createdAt: string;
  attempts: number;
  error?: string;
}
