import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from './post-confirmation/resource';

/**
 * CampusRoom Authentication configuration using Amazon Cognito.
 *
 * Requirements:
 * - Email as login identifier
 * - Email verification required (code-based verification)
 * - Three authorization groups with defined precedence:
 *   - Admin: Protected group for facilities and system administrators.
 *            Must not be freely selectable by public users during signup.
 *   - Faculty: Academic faculty and researchers.
 *   - Student: Undergraduate and postgraduate students.
 * - Cognito postConfirmation Lambda trigger for verified group assignment.
 * - Compatible with custom React login/signup and password reset flows.
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Welcome to CampusRoom - Verify your email',
      verificationEmailBody: (createCode) =>
        `Your CampusRoom verification code is ${createCode()}. Use this code to verify your account and complete your campus registration.`,
    },
  },
  groups: ['Admin', 'Faculty', 'Student'],
  triggers: {
    postConfirmation,
  },
  access: (allow) => [
    allow.resource(postConfirmation).to(['addUserToGroup']),
  ],
  userAttributes: {
    fullname: {
      mutable: true,
      required: false,
    },
    phoneNumber: {
      mutable: true,
      required: false,
    },
    'custom:role': {
      dataType: 'String',
      mutable: true,
    },
  },
});
