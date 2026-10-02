import React, { createContext, useContext, useState, useEffect } from "react";
import { initialUsers } from "../aws/mockData";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default to Dr. Sarah Chen (Staff/Faculty) as shown in Stitch screens
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("campusroom_active_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return initialUsers[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("campusroom_active_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("campusroom_active_user");
    }
  }, [currentUser]);

  const login = async (email, password) => {
    // Simulated Cognito authentication
    await new Promise((r) => setTimeout(r, 400));
    const matched = initialUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      setIsAuthenticated(true);
      return { success: true, user: matched };
    }
    // Generic fallback for custom email
    const fallbackUser = {
      id: `usr-${Date.now()}`,
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: email.includes("admin") ? "ADMIN" : email.includes("staff") ? "STAFF" : "STUDENT",
      roleLabel: email.includes("admin") ? "System Admin" : email.includes("staff") ? "Staff Member" : "University Student",
      department: "Campus Academic Community",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    };
    setCurrentUser(fallbackUser);
    setIsAuthenticated(true);
    return { success: true, user: fallbackUser };
  };

  const register = async (userData) => {
    await new Promise((r) => setTimeout(r, 450));
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || "STUDENT",
      roleLabel: userData.role === "ADMIN" ? "Administrator" : userData.role === "STAFF" ? "Faculty Staff" : "Undergraduate Student",
      department: userData.department || "Academic Department",
      studentOrStaffId: userData.idNumber || `ID-${Math.floor(10000 + Math.random() * 90000)}`,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    };
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setIsAuthenticated(false);
    // Switch to null or unauthenticated state
  };

  const switchUser = (roleOrUser) => {
    if (typeof roleOrUser === "string") {
      const found = initialUsers.find((u) => u.role === roleOrUser.toUpperCase());
      if (found) {
        setCurrentUser(found);
        setIsAuthenticated(true);
      }
    } else if (roleOrUser) {
      setCurrentUser(roleOrUser);
      setIsAuthenticated(true);
    }
  };

  const isAdmin = currentUser?.role === "ADMIN";
  const isStaff = currentUser?.role === "STAFF";
  const isStudent = currentUser?.role === "STUDENT";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        isStaff,
        isStudent,
        login,
        register,
        logout,
        switchUser,
        availableUsers: initialUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
