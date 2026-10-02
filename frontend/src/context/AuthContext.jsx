import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Check existing live Cognito session on mount
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const profile = await authService.getCurrentUserProfile();
        if (mounted) {
          if (profile) {
            setCurrentUser(profile);
            setIsAuthenticated(true);
          } else {
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.warn("Auth check initialization:", err);
        if (mounted) {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Real Cognito Sign In
   */
  const login = async (email, password) => {
    try {
      const signInRes = await authService.signIn(email, password);

      if (signInRes.isSignedIn) {
        const profile = await authService.getCurrentUserProfile();
        setCurrentUser(profile);
        setIsAuthenticated(true);
        return { success: true, user: profile };
      }

      if (signInRes.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        return {
          success: false,
          requiresNewPassword: true,
          nextStep: signInRes.nextStep,
          email,
        };
      }

      if (signInRes.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
        return {
          success: false,
          requiresConfirmation: true,
          email,
          error: "Email verification is required before signing in.",
        };
      }

      return {
        success: false,
        nextStep: signInRes.nextStep,
        error: "Additional authentication steps required.",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to sign in. Please verify your credentials.",
      };
    }
  };

  /**
   * Confirm temporary password challenge with new permanent password
   */
  const confirmNewPassword = async (newPassword) => {
    try {
      const res = await authService.confirmSignIn(newPassword);

      if (res.isSignedIn || res.nextStep?.signInStep === "DONE") {
        const profile = await authService.getCurrentUserProfile();
        setCurrentUser(profile);
        setIsAuthenticated(true);
        return { success: true, user: profile };
      }

      if (res.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        return {
          success: false,
          requiresNewPassword: true,
          nextStep: res.nextStep,
          error: "Please enter a valid new password meeting security criteria.",
        };
      }

      return {
        success: false,
        nextStep: res.nextStep,
        error: "Further authentication steps required.",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to set new password. Please verify requirements and try again.",
      };
    }
  };

  /**
   * Real Cognito Sign Up (Student & Faculty only, Admin strictly forbidden)
   */
  const register = async (userData) => {
    try {
      const res = await authService.signUp({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role || "STUDENT",
        department: userData.department,
        idNumber: userData.idNumber,
      });

      return {
        success: true,
        isComplete: res.isSignUpComplete,
        nextStep: res.nextStep,
        email: userData.email,
        assignedRole: res.assignedRole,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Registration failed. Please check password requirements and try again.",
      };
    }
  };

  /**
   * Confirm email verification code
   */
  const verifyEmail = async (email, code) => {
    try {
      const res = await authService.confirmSignUp(email, code);
      return { success: true, isComplete: res.isSignUpComplete };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Invalid or expired verification code.",
      };
    }
  };

  /**
   * Resend signup verification code
   */
  const resendVerificationCode = async (email) => {
    try {
      await authService.resendSignUpCode(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Failed to resend code." };
    }
  };

  /**
   * Initiate forgot password flow
   */
  const forgotPassword = async (email) => {
    try {
      const res = await authService.resetPassword(email);
      return { success: true, nextStep: res.nextStep };
    } catch (error) {
      return { success: false, error: error.message || "Failed to request password reset." };
    }
  };

  /**
   * Confirm password reset
   */
  const confirmPasswordReset = async (email, code, newPassword) => {
    try {
      await authService.confirmResetPassword(email, code, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Failed to reset password." };
    }
  };

  /**
   * Real Cognito Sign Out
   */
  const logout = async () => {
    try {
      await authService.signOut();
    } catch (e) {
      console.warn("Cognito signout warning:", e);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Derive roles strictly from Cognito groups or user profile
  const groups = currentUser?.groups || [];
  const isAdmin = groups.includes("Admin") || currentUser?.role === "ADMIN";
  const isFaculty = groups.includes("Faculty") || currentUser?.role === "STAFF" || currentUser?.role === "FACULTY";
  const isStaff = isFaculty || isAdmin;
  const isStudent = (!isAdmin && !isFaculty) || groups.includes("Student") || currentUser?.role === "STUDENT";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoadingAuth,
        isAdmin,
        isStaff,
        isFaculty,
        isStudent,
        login,
        register,
        verifyEmail,
        resendVerificationCode,
        forgotPassword,
        confirmPasswordReset,
        confirmNewPassword,
        logout,
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

export default AuthContext;
