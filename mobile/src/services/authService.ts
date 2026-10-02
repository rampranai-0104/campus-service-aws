import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession as amplifyFetchAuthSession,
  fetchUserAttributes as amplifyFetchUserAttributes,
} from 'aws-amplify/auth';
import { UserProfile, UserRole } from '../types';

export const authService = {
  /**
   * Sign in with university email and password using live Cognito User Pool
   */
  async signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const res = await amplifySignIn({
      username: cleanEmail,
      password,
    });
    return res;
  },

  /**
   * Sign out from Cognito session
   */
  async signOut() {
    await amplifySignOut();
  },

  /**
   * Retrieve current authenticated user profile with Cognito groups and roles
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const user = await amplifyGetCurrentUser();
      if (!user) return null;

      const [session, attributes] = await Promise.all([
        amplifyFetchAuthSession(),
        amplifyFetchUserAttributes().catch(() => ({} as Record<string, string>)),
      ]);

      const idToken = session.tokens?.idToken;
      const groups = (idToken?.payload?.['cognito:groups'] as string[]) || [];

      const isAdmin = groups.includes('Admin');
      const isFaculty = groups.includes('Faculty');
      const isStudent = groups.includes('Student') || (!isAdmin && !isFaculty);

      let role: UserRole = 'Student';
      let roleLabel = 'University Student';

      if (isAdmin) {
        role = 'Admin';
        roleLabel = 'Facility Administrator';
      } else if (isFaculty) {
        role = 'Faculty';
        roleLabel = 'Faculty Member';
      } else {
        role = 'Student';
        roleLabel = 'University Student';
      }

      const email = attributes.email || user.signInDetails?.loginId || user.username;
      const name =
        attributes.name ||
        email
          .split('@')[0]
          .replace('.', ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

      const avatarUrl = isAdmin
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
        : isFaculty
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcWR-fkRv-h1CNbotkRRWFNn_co3Jt2dTdHeLkiZScvrE47XXKoBexskdVhmupKj3hCCwl6EkmmsS6xHXsNopXP4E3yk4UTAC2hBlHd0fFU1R313_tw7dcpW-qKUPkLMp2HNE9VccxdI2ORknjryaDlpWNfwgkYp6YPddOL92jRltcklCsS20eqPLdNdVgP67mbDC7_u0V-HPDXU_j5aj5Yk1yA9Xo5zkeUeHMpPwSWR1mxqemSWXB8w'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';

      const customAttrs = attributes as Record<string, any>;
      const department =
        customAttrs['custom:department'] ||
        (isAdmin
          ? 'Facilities & Operations'
          : isFaculty
          ? 'Academic Faculty'
          : 'Undergraduate Studies');

      const studentOrStaffId =
        customAttrs['custom:id_number'] ||
        `${isAdmin ? 'ADM' : isFaculty ? 'FAC' : 'STU'}-${(
          user.userId ||
          user.username ||
          '00000'
        )
          .slice(-5)
          .toUpperCase()}`;

      return {
        id: user.userId || user.username,
        userId: user.userId || user.username,
        username: user.username,
        name,
        email,
        role,
        roleLabel,
        department,
        studentOrStaffId,
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

  /**
   * Check if a valid authenticated Cognito session currently exists
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await amplifyFetchAuthSession();
      return Boolean(session.tokens?.idToken);
    } catch {
      return false;
    }
  },
};
