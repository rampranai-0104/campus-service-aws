# 🏫 CampusRoom

## Smart Campus Space Booking & Facility Management Platform

> A centralized, secure, real-time, and offline-capable platform for managing campus rooms, reservations, maintenance, support requests, and facility utilization.

---

<p align="center">

![AWS](https://img.shields.io/badge/AWS-Serverless-FF9900?logo=amazon-aws&logoColor=white)
![Amplify](https://img.shields.io/badge/AWS-Amplify_Gen_2-FF9900?logo=aws-amplify&logoColor=white)
![AppSync](https://img.shields.io/badge/AWS-AppSync-E7157B?logo=graphql&logoColor=white)
![Cognito](https://img.shields.io/badge/AWS-Cognito-232F3E?logo=amazon-aws&logoColor=white)
![DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-4053D6?logo=amazon-dynamodb&logoColor=white)
![Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900?logo=aws-lambda&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-Expo-000020?logo=expo&logoColor=white)

</p>

---

# 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Project Objectives](#-project-objectives)
- [Proposed Solution](#-proposed-solution)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Functional Modules](#-functional-modules)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Application Architecture](#-application-architecture)
- [Data Flow](#-data-flow)
- [Database Design](#-database-design)
- [Authentication & Authorization](#-authentication--authorization)
- [Booking Management](#-booking-management)
- [Conflict Detection](#-conflict-detection)
- [Room Maintenance](#-room-maintenance)
- [Support Ticket System](#-support-ticket-system)
- [Notification System](#-notification-system)
- [Offline-First Mobile Architecture](#-offline-first-mobile-architecture)
- [Synchronization Strategy](#-synchronization-strategy)
- [Web Application](#-web-application)
- [Mobile Application](#-mobile-application)
- [Admin Dashboard](#-admin-dashboard)
- [GraphQL API](#-graphql-api)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Project](#-running-the-project)
- [AWS Deployment](#-aws-deployment)
- [Android APK](#-android-apk)
- [Testing](#-testing)
- [Security](#-security)
- [Error Handling](#-error-handling)
- [Troubleshooting](#-troubleshooting)
- [Demonstration Workflow](#-demonstration-workflow)
- [Future Enhancements](#-future-enhancements)
- [Team](#-team)

---

# 🚀 Project Overview

**CampusRoom** is a full-stack campus space booking and facility management platform designed to simplify the management of university and college facilities.

The system provides a single platform through which students, faculty, and administrators can interact with campus spaces.

Users can search for rooms, check availability, make reservations, track bookings, and report facility issues.

Administrators can manage rooms, approve reservations, handle maintenance, manage support tickets, and monitor utilization.

The platform is available through:

- 🌐 Web application
- 📱 Android mobile application
- ☁️ Serverless AWS backend

---

# ❗ Problem Statement

Many educational institutions still depend on manual or disconnected processes for managing campus rooms.

These approaches can create several operational problems:

### Booking Problems

- Multiple users may attempt to reserve the same room.
- Room availability may not be updated immediately.
- Manual booking records are difficult to maintain.
- Users may not know whether a room is available.

### Administration Problems

- Administrators need to manually verify reservations.
- Room maintenance information may not be communicated efficiently.
- Reassigning rooms can be difficult.

### Facility Management Problems

- Maintenance issues may be reported through informal channels.
- Support requests may not have clear statuses.
- Administrators may not have centralized visibility.

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
