import React, { useState, useEffect } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { BookingProvider } from "./context/BookingContext";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import OfflineBanner from "./components/layout/OfflineBanner";
import ToastContainer from "./components/common/Toast";

import DashboardPage from "./pages/DashboardPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailsPage from "./pages/RoomDetailsPage";
import CalendarPage from "./pages/CalendarPage";
import QuickBookPage from "./pages/QuickBookPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import RoomManagementPage from "./pages/RoomManagementPage";
import BookingRequestsPage from "./pages/BookingRequestsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const ADMIN_PATHS = ["admin", "admin-dashboard", "room-management", "booking-requests", "analytics"];

const normalizePath = (pathname) => {
  const clean = (pathname || "").replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();
  if (!clean) return "dashboard";
  if (clean === "admin-dashboard") return "admin";
  return clean;
};

const AppContent = () => {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated, isAdmin, isLoadingAuth, currentUser } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (isAuthenticated && (currentPath === "login" || currentPath === "register")) {
      const dest = isAdmin ? "admin" : "dashboard";
      setCurrentPath(dest);
      const targetUrl = dest === "dashboard" ? "/" : `/${dest}`;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState(null, "", targetUrl);
      }
    }
  }, [isAuthenticated, currentPath, isAdmin]);

  const handleNavigate = (path) => {
    setCurrentPath(path);
    const targetUrl = path === "dashboard" ? "/" : `/${path}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, "", targetUrl);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    handleNavigate("room-details");
  };

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    handleNavigate("booking-details");
  };

  // Auth loading state
  if (isLoadingAuth) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--surface)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "3px solid #e2e8f0",
              borderTopColor: "var(--primary-container)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ fontSize: "13px", color: "var(--on-surface-variant)", fontWeight: "600" }}>
            Connecting to AWS Cognito...
          </span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Unauthenticated view: all routes require authentication except register
  if (!isAuthenticated) {
    if (currentPath === "register") {
      return (
        <div className="auth-layout" style={{ minHeight: "100vh", backgroundColor: "var(--surface)" }}>
          <RegisterPage onNavigate={handleNavigate} />
          <ToastContainer />
        </div>
      );
    }
    return (
      <div className="auth-layout" style={{ minHeight: "100vh", backgroundColor: "var(--surface)" }}>
        <LoginPage onNavigate={handleNavigate} />
        <ToastContainer />
      </div>
    );
  }

  const renderCurrentPage = () => {
    // Route Protection: Inaccessible to non-admin users even via manual navigation
    if (ADMIN_PATHS.includes(currentPath) && !isAdmin) {
      return (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            maxWidth: "520px",
            margin: "60px auto",
            backgroundColor: "var(--surface-container-lowest)",
            borderRadius: "20px",
            boxShadow: "var(--shadow-md)",
            border: "1px solid #e2e8f0",
          }}
          className="animate-fade-in"
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--error-container)",
              color: "var(--error)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "30px" }}>
              lock
            </span>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--on-surface)", margin: "0 0 8px" }}>
            Administrative Access Restricted
          </h2>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", lineHeight: "1.5", margin: "0 0 20px" }}>
            This page requires membership in the verified <strong>Admin</strong> Cognito group. Your account (
            {currentUser?.email || "Current User"}) is classified as {currentUser?.roleLabel || "Student/Faculty"} and does not have administrative privileges.
          </p>
          <button onClick={() => handleNavigate("dashboard")} className="btn-primary" style={{ margin: "0 auto" }}>
            Return to Dashboard
          </button>
        </div>
      );
    }

    switch (currentPath) {
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigate} onSelectRoom={handleSelectRoom} />;
      case "rooms":
        return <RoomsPage onSelectRoom={handleSelectRoom} onNavigate={handleNavigate} />;
      case "room-details":
        return (
          <RoomDetailsPage
            room={selectedRoom}
            onBack={() => handleNavigate("rooms")}
            onNavigate={handleNavigate}
          />
        );
      case "calendar":
        return <CalendarPage />;
      case "quick-book":
        return <QuickBookPage onNavigate={handleNavigate} />;
      case "my-bookings":
        return <MyBookingsPage onNavigate={handleNavigate} onSelectBooking={handleSelectBooking} />;
      case "booking-details":
        return (
          <BookingDetailsPage
            booking={selectedBooking}
            onBack={() => handleNavigate("my-bookings")}
            onNavigate={handleNavigate}
          />
        );
      case "notifications":
        return <NotificationsPage />;
      case "admin":
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      case "room-management":
        return <RoomManagementPage onSelectRoom={handleSelectRoom} />;
      case "booking-requests":
        return <BookingRequestsPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "settings":
        return <SettingsPage />;
      case "help":
        return <HelpSupportPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} onSelectRoom={handleSelectRoom} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activePath={currentPath}
        onNavigate={handleNavigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="main-content-wrapper">
        <Header
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onNavigate={handleNavigate}
        />

        <main className="page-container">
          <OfflineBanner />
          {renderCurrentPage()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
