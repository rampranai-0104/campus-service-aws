import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendSignUpCode,
  confirmSignIn as amplifyConfirmSignIn,
  signOut as amplifySignOut,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession as amplifyFetchAuthSession,
  fetchUserAttributes as amplifyFetchUserAttributes,
} from "aws-amplify/auth";

/**
 * AWS Amplify Cognito Authentication Service Layer
 * Enforces:
 * - Student and Faculty self-signup
 * - Strict prohibition of public Admin self-assignment
 * - Cognito groups for downstream role determination (Admin, Faculty, Student)
 */
export const authService = {
  /**
   * Register a new user with Cognito
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.password
   * @param {string} params.name
   * @param {string} params.role 'STUDENT' or 'FACULTY' / 'STAFF'
   * @param {string} [params.department]
   * @param {string} [params.idNumber]
   */
  async signUp({ email, password, name, role = "STUDENT", _department = "", _idNumber = "" }) {
    const normalizedRole = role.toUpperCase();

    // SECURITY ENFORCEMENT: Never permit Admin self-signup from public frontend
    if (normalizedRole === "ADMIN") {
      throw new Error("Administrative accounts cannot be self-registered. Please contact Campus Facilities.");
    }

    const assignedRole = normalizedRole === "STAFF" || normalizedRole === "FACULTY" ? "FACULTY" : "STUDENT";

    const attributes = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      "custom:role": assignedRole,
    };

    const res = await amplifySignUp({
      username: email.trim().toLowerCase(),
      password,
      options: {
        userAttributes: attributes,
        autoSignIn: false,
      },
    });

    return {
      isSignUpComplete: res.isSignUpComplete,
      userId: res.userId,
      nextStep: res.nextStep,
      assignedRole,
    };
  },

  /**
   * Confirm sign up with email verification code
   */
  async confirmSignUp(email, confirmationCode) {
    const res = await amplifyConfirmSignUp({
      username: email.trim().toLowerCase(),
      confirmationCode: confirmationCode.trim(),
    });
    return res;
  },

  /**
   * Resend signup verification code
   */
  async resendSignUpCode(email) {
    const res = await amplifyResendSignUpCode({
      username: email.trim().toLowerCase(),
    });
    return res;
  },

  /**
   * Sign in with university email and password
   */
  async signIn(email, password) {
    const res = await amplifySignIn({
      username: email.trim().toLowerCase(),
      password,
    });
    return res;
  },

  /**
   * Confirm sign-in with challenge response (e.g. temporary password first login)
   * @param {string} newPassword
   */
  async confirmSignIn(newPassword) {
    const res = await amplifyConfirmSignIn({
      challengeResponse: newPassword,
    });
    return res;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    await amplifySignOut();
  },

  /**
   * Initiate forgot password flow
   */
  async resetPassword(email) {
    const res = await amplifyResetPassword({
      username: email.trim().toLowerCase(),
    });
    return res;
  },

  /**
   * Confirm password reset with code and new password
   */
  async confirmResetPassword(email, confirmationCode, newPassword) {
    await amplifyConfirmResetPassword({
      username: email.trim().toLowerCase(),
      confirmationCode: confirmationCode.trim(),
      newPassword,
    });
  },

  /**
   * Get low-level current authenticated Cognito user
   */
  async getCurrentUser() {
    try {
      return await amplifyGetCurrentUser();
    } catch {
      return null;
    }
  },

  /**
   * Fetch current session tokens and groups
   */
  async fetchSession() {
    try {
      return await amplifyFetchAuthSession();
    } catch {
      return null;
    }
  },

  /**
   * Fetch Cognito User Attributes
   */
  async fetchAttributes() {
    try {
      return await amplifyFetchUserAttributes();
    } catch {
      return {};
    }
  },

  /**
   * Get the full verified profile of current authenticated user,
   * detecting roles strictly from Cognito Groups.
   */
  async getCurrentUserProfile() {
    try {
      const user = await amplifyGetCurrentUser();
      if (!user) return null;

      const [session, attributes] = await Promise.all([
        amplifyFetchAuthSession(),
        amplifyFetchUserAttributes().catch(() => ({})),
      ]);

      const groups = session.tokens?.idToken?.payload?.["cognito:groups"] || [];
      const isAdmin = groups.includes("Admin");
      const isFaculty = groups.includes("Faculty");
      const isStudent = groups.includes("Student") || (!isAdmin && !isFaculty);

      let role = "STUDENT";
      let roleLabel = "University Student";

      if (isAdmin) {
        role = "ADMIN";
        roleLabel = "Facility Administrator";
      } else if (isFaculty) {
        role = "STAFF";
        roleLabel = "Faculty Researcher";
      } else {
        role = "STUDENT";
        roleLabel = "University Student";
      }

      const email = attributes.email || user.signInDetails?.loginId || user.username;
      const name = attributes.name || email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());

      // Use a consistent avatar based on role
      const avatarUrl = isAdmin
        ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
        : isFaculty
        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDcWR-fkRv-h1CNbotkRRWFNn_co3Jt2dTdHeLkiZScvrE47XXKoBexskdVhmupKj3hCCwl6EkmmsS6xHXsNopXP4E3yk4UTAC2hBlHd0fFU1R313_tw7dcpW-qKUPkLMp2HNE9VccxdI2ORknjryaDlpWNfwgkYp6YPddOL92jRltcklCsS20eqPLdNdVgP67mbDC7_u0V-HPDXU_j5aj5Yk1yA9Xo5zkeUeHMpPwSWR1mxqemSWXB8w"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80";

      return {
        id: user.userId || user.username,
        userId: user.userId || user.username,
        username: user.username,
        name,
        email,
        role,
        roleLabel,
        department: attributes["custom:department"] || (isAdmin ? "Facilities & Operations" : isFaculty ? "Academic Faculty" : "Undergraduate Studies"),
        studentOrStaffId: attributes["custom:id_number"] || `${isAdmin ? "ADM" : isFaculty ? "FAC" : "STU"}-${(user.userId || user.username || "00000").slice(-5).toUpperCase()}`,
        avatarUrl,
        groups,
        isAdmin,
        isStaff: isFaculty || isAdmin,
        isFaculty,
        isStudent,
      };
    } catch {
      return null;
    }
  },
};

export default authService;
