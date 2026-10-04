-- Maintenance issues may be reported through informal channels.
-- Support requests may not have clear statuses.
-- Administrators may not have centralized visibility.

### Connectivity Problems

Campus users may sometimes experience:

- Weak Wi-Fi
- Temporary network failures
- Unstable mobile connectivity

A booking system that completely depends on continuous connectivity can therefore provide a poor user experience.

---

# 🎯 Project Objectives

CampusRoom is designed with the following objectives:

1. Provide centralized campus room management.
2. Simplify room reservation.
3. Prevent double bookings.
4. Provide secure authentication.
5. Implement role-based authorization.
6. Provide real-time updates.
7. Manage room maintenance.
8. Provide facility support tickets.
9. Provide administrative analytics.
10. Support selected mobile workflows offline.
11. Synchronize offline actions when connectivity returns.
12. Provide a scalable serverless architecture.

---

# 💡 Proposed Solution

CampusRoom combines a modern web application, mobile application, and AWS serverless backend.

```text
                    CAMPUSROOM
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
     Web Platform                 Mobile Platform
          │                             │
          └──────────────┬──────────────┘
                         │
                         ▼
                 AWS AppSync
                 GraphQL API
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
      DynamoDB        Lambda           S3
          │
          ▼
      Cognito
