# CampusRoom — AWS Amplify Full-Stack Architecture Documentation

## Overview
**CampusRoom** is a production-quality campus room booking and space allocation system built on AWS Amplify. This document outlines the Phase 1 web application implementation and backend schema, designed to be 100% reusable by the Phase 2 React Native mobile application.

---

## 1. Cloud Architecture

```
┌─────────────────────────┐         ┌────────────────────────┐
│  React Web Application  │         │  React Native (Phase2) │
│  (Desktop & Tablet UI)  │         │  (Offline-First Client)│
└────────────┬────────────┘         └───────────┬────────────┘
             │                                  │
             ▼                                  ▼
      ┌────────────────────────────────────────────────┐
      │             AWS Amplify Client SDK             │
      │   (Cognito Auth, AppSync Client & DataStore)   │
      └───────────────────────┬────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌──────────────┐ ┌──────────────┐ ┌─────────────┐
      │Amazon Cognito│ │ AWS AppSync  │ │  Amazon S3  │
      │ (User Pools  │ │  (GraphQL    │ │(Room Assets │
      │  & Groups)   │ │  API Gateway)│ │  & Photos)  │
      └──────────────┘ └──────┬───────┘ └─────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Amazon DynamoDB  │
                     │  (Room, Booking, │
                     │   Notification)  │
                     └──────────────────┘
```

### Key Services
1. **Amazon Cognito**:
   - Manages user registration, email verification, JWT session tokens, and Role-Based Access Control (RBAC).
   - Roles / Cognito User Groups:
     - `Student`: Read-only for restricted halls, instant reservation for study pods and small labs.
     - `Staff`: Faculty researchers with priority reservation windows and seminar hall booking permissions.
     - `Admin`: Campus operations and facilities directors with approval, maintenance toggle, and room CRUD authority.
2. **AWS AppSync / GraphQL**:
   - Manages real-time queries, mutations, and subscriptions.
   - Built-in conflict detection (Optimistic Concurrency Control) for collaborative room booking without double-booking collisions.
3. **Amazon DynamoDB**:
   - High-performance NoSQL tables (`User`, `Room`, `Booking`, `Notification`) with Global Secondary Indexes (`byUser`, `byRoom`, `byDate`).
4. **Amazon S3**:
   - Secure cloud bucket for room images, floor plans, and digital badges.
5. **AWS Amplify Hosting**:
   - Global CDN hosting for high availability, zero cold-starts, and continuous deployment from Git.

---

## 2. GraphQL Schema Design (`src/aws/schema.graphql`)

To avoid the project bottleneck: **"GraphQL schema changes cause data migration problems"**:
- The schema is designed additively.
- Required fields are strictly specified upfront.
- Fields use standardized AWS scalar types (`AWSDateTime`, `AWSDate`, `AWSTime`, `ID`).
- Relations use `@hasMany` and `@belongsTo` directives with explicit secondary indexes (`@index(name: "byUser")`, `@index(name: "byRoom")`).
- Future mobile synchronization relies on AppSync delta sync and conflict resolution timestamps (`_version`, `_lastChangedAt`, `_deleted`).

```graphql
enum RoomStatus {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
  DISABLED
}

enum RoomType {
  STUDY_POD
  LAB
  SEMINAR
  AUDITORIUM
  CONFERENCE
}

enum BookingStatus {
  CONFIRMED
  PENDING
  CANCELLED
  COMPLETED
  CONFLICT
}

enum UserRole {
  STUDENT
  STAFF
  ADMIN
}

type User @model @auth(rules: [
  { allow: owner, operations: [create, read, update] },
  { allow: groups, groups: ["Admin"], operations: [create, read, update, delete] },
  { allow: private, operations: [read] }
]) {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  department: String
  avatarUrl: String
  studentOrStaffId: String
  bookings: [Booking] @hasMany(indexName: "byUser", fields: ["id"])
  notifications: [Notification] @hasMany(indexName: "byUser", fields: ["id"])
}

type Room @model @auth(rules: [
  { allow: groups, groups: ["Admin"], operations: [create, read, update, delete] },
  { allow: private, operations: [read] },
  { allow: public, operations: [read] }
]) {
  id: ID!
  code: String!
  name: String!
  building: String!
  campusSector: String
  floor: String!
  capacity: Int!
  roomType: RoomType!
  facilities: [String]!
  image: String
  status: RoomStatus!
  custodian: String
  instantBookable: Boolean
  bookings: [Booking] @hasMany(indexName: "byRoom", fields: ["id"])
}

type Booking @model @auth(rules: [
  { allow: owner, operations: [create, read, update, delete] },
  { allow: groups, groups: ["Admin"], operations: [create, read, update, delete] },
  { allow: private, operations: [read] }
]) {
  id: ID!
  userId: ID! @index(name: "byUser")
  user: User @belongsTo(fields: ["userId"])
  roomId: ID! @index(name: "byRoom")
  room: Room @belongsTo(fields: ["roomId"])
  roomName: String!
  building: String!
  date: AWSDate!
  startTime: AWSTime!
  endTime: AWSTime!
  purpose: String!
  attendeeCount: Int!
  status: BookingStatus!
  keycardPin: String
  qrPassCode: String
  adminNotes: String
}
```

---

## 3. Real-Time Collision Engine
Before a booking is committed, the service checks:
$$\text{Existing Booking: } [S_A, E_A) \quad\text{vs}\quad \text{New Booking: } [S_B, E_B)$$
A collision is triggered if:
$$S_A < E_B \quad\text{and}\quad E_A > S_B$$
for any reservation with identical `roomId` and `date` that is not `CANCELLED`.
Users see real-time UI feedback ("Slot Available - No conflict detected" vs "Collision Warning").

---

## 4. Offline Simulation & Phase 2 Mobile Readiness
- The web app includes an **Amplify DataStore Offline Simulation Toggle** in the top navigation and dashboard.
- When toggled, writes are saved to an optimistic local queue and marked `PENDING_LOCAL`.
- When reconnected, writes are reconciled and marked `SYNCED`.
- In Phase 2, the React Native client will reuse this exact backend schema and data contracts using native SQLite / AsyncStorage DataStore synchronization.
