 # CampusRoom — Campus Space Booking & Management System

[![AWS Amplify Gen 2](https://img.shields.io/badge/AWS_Amplify-Gen_2-FF9900?logo=aws-amplify&logoColor=white)](https://aws.amazon.com/amplify/)
[![AWS AppSync](https://img.shields.io/badge/AWS_AppSync-GraphQL-E7157B?logo=graphql&logoColor=white)](https://aws.amazon.com/appsync/)
[![Amazon Cognito](https://img.shields.io/badge/Amazon_Cognito-Authentication-232F3E?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/cognito/)
[![Amazon DynamoDB](https://img.shields.io/badge/Amazon_DynamoDB-Serverless_NoSQL-4053D6?logo=amazon-dynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_57-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![EAS Build](https://img.shields.io/badge/EAS_Build-Android_APK-000000?logo=expo&logoColor=white)](https://expo.dev/eas)

## Overview

**CampusRoom** is a full-stack campus space booking and facility management platform designed for universities and educational institutions.

The platform enables students, faculty, and administrators to discover available campus spaces, manage reservations, prevent scheduling conflicts, report facility issues, and monitor room utilization through web and mobile applications.

The system is built using a **serverless AWS architecture** with a modern React web application and an offline-first React Native mobile application.

### Key Capabilities

- Secure authentication and role-based access control
- Real-time room availability and reservation management
- Server-side booking conflict detection
- Administrative booking approval and rejection
- Room maintenance and reassignment workflows
- Facility support ticket management
- Real-time notifications and status updates
- Room utilization and operational analytics
- Offline-first mobile booking and ticket workflows
- Automatic synchronization after network recovery
- Standalone Android APK distribution using Expo EAS

### Project Information

| Property | Details |
| :--- | :--- |
| **Project Name** | CampusRoom |
| **Team** | `Y24-SAA-Team338` |
| **Repository** | `rampranai-0104/campus-service-aws` |
| **Primary Use Case** | Campus room, laboratory, auditorium, seminar hall, and study-space management |
| **Platforms** | Web + Android Mobile |
| **Backend** | AWS Serverless Architecture |

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Users & Roles](#users--roles)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Architecture](#database-architecture)
6. [Booking Management](#booking-management)
7. [Conflict Detection](#conflict-detection)
8. [Room Maintenance](#room-maintenance)
9. [Support Ticket System](#support-ticket-system)
10. [Authentication & Security](#authentication--security)
11. [Web Application](#web-application)
12. [Mobile Application](#mobile-application)
13. [Offline-First Architecture](#offline-first-architecture)
14. [GraphQL API](#graphql-api)
15. [Project Structure](#project-structure)
16. [Local Development](#local-development)
17. [Deployment](#deployment)
18. [Testing](#testing)
19. [Troubleshooting](#troubleshooting)
20. [Demonstration Workflow](#demonstration-workflow)
21. [Future Enhancements](#future-enhancements)

---

# Problem Statement

Traditional campus room-booking systems often rely on manual registers, spreadsheets, or disconnected communication channels. These approaches can result in:

- Double-booked rooms and scheduling conflicts
- Unauthorized reservations
- Limited visibility into room availability
- Delayed maintenance reporting
- Difficulty managing reservations across different user roles
- Poor reliability during unstable campus network conditions

**CampusRoom** addresses these challenges through a centralized digital platform that provides secure booking, real-time availability, automated conflict detection, facility management, analytics, and offline-first mobile functionality.

---

# Users & Roles

CampusRoom supports three primary user roles.

### Student

Students can:

- Browse available rooms
- View room facilities and capacity
- Create reservations
- View booking history
- Cancel bookings
- Receive notifications
- Submit facility support tickets
- Use offline booking functionality through the mobile application

### Faculty / Staff

Faculty and staff can:

- Reserve seminar halls and laboratories
- View room availability
- Manage their bookings
- Receive booking notifications
- Report facility and equipment issues

### Administrator

Administrators can:

- Approve or reject booking requests
- Create and manage rooms
- Reassign reservations
- Manage room maintenance status
- Manage support tickets
- Monitor room utilization
- Access administrative analytics
- Manage user roles and permissions

---

# Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Web application development |
| **Vite 8** | Frontend development and build tooling |
| **React Native** | Mobile application development |
| **Expo SDK 57** | Mobile development framework |
| **Expo Router** | Mobile navigation |
| **TypeScript** | Type-safe backend and mobile development |
| **AWS Amplify Gen 2** | Infrastructure and backend resource management |
| **Amazon Cognito** | Authentication and authorization |
| **AWS AppSync** | GraphQL API |
| **Amazon DynamoDB** | Serverless NoSQL database |
| **AWS Lambda** | Serverless backend logic |
| **Amazon S3** | Room image and asset storage |
| **Expo EAS** | Android APK builds |
| **AsyncStorage** | Local mobile persistence |
| **NetInfo** | Network connectivity detection |

---

# System Architecture

CampusRoom follows a serverless cloud architecture.

```mermaid
flowchart TD

    subgraph Clients["Client Applications"]
        Web["React Web Application"]
        Mobile["React Native Mobile Application"]
    end

    subgraph AWS["AWS Cloud"]
        Cognito["Amazon Cognito"]
        AppSync["AWS AppSync GraphQL"]
        Lambda["AWS Lambda"]
        DynamoDB["Amazon DynamoDB"]
        S3["Amazon S3"]
    end

    Web --> Cognito
    Mobile --> Cognito

    Web --> AppSync
    Mobile --> AppSync

    AppSync --> DynamoDB
    AppSync --> Lambda
    Lambda --> DynamoDB

    Web --> S3
    Mobile --> S3
