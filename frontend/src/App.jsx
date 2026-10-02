import React, { useState } from "react";
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

const AppContent = () => {
  const [currentPath, setCurrentPath] = useState("dashboard");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleNavigate = (path) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setCurrentPath("room-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    setCurrentPath("booking-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auth pages view
  if (currentPath === "login") {
    return (
      <div className="auth-layout" style={{ minHeight: "100vh", backgroundColor: "var(--surface)" }}>
        <LoginPage onNavigate={handleNavigate} />
        <ToastContainer />
      </div>
    );
  }

  if (currentPath === "register") {
    return (
      <div className="auth-layout" style={{ minHeight: "100vh", backgroundColor: "var(--surface)" }}>
        <RegisterPage onNavigate={handleNavigate} />
        <ToastContainer />
      </div>
    );
  }

  const renderCurrentPage = () => {
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
