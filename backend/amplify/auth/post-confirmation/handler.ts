import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({});

/**
 * Cognito Post-Confirmation Trigger Handler
 * 
 * Enforces role-based group assignment:
 * - Assigns verified users to 'Faculty' if requested role is FACULTY / STAFF.
 * - Assigns verified users to 'Student' for general signups.
 * - CRITICAL: Explicitly blocks and rejects any attempt to self-assign the 'Admin' role.
 *   Attempts are logged and safely reassigned to 'Student'.
 * - Relies exclusively on Cognito groups for downstream AWS authorization.
 */
export const handler: PostConfirmationTriggerHandler = async (event) => {
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
    return event;
  }

  const { userPoolId, userName } = event;
  const userAttributes = event.request.userAttributes || {};
  const requestedRole = (userAttributes['custom:role'] || '').trim().toUpperCase();

  let targetGroup = 'Student';

  if (requestedRole === 'FACULTY' || requestedRole === 'STAFF') {
    targetGroup = 'Faculty';
  } else if (requestedRole === 'ADMIN') {
    // SECURITY ENFORCEMENT: Never allow public self-assignment of Admin group.
    console.warn(
      `[SECURITY AUDIT] Blocked attempt by user "${userName}" (${userAttributes.email}) to self-assign Admin group! Falling back to Student group.`
    );
    targetGroup = 'Student';
  } else {
    targetGroup = 'Student';
  }

  try {
    await cognitoClient.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: userName,
        GroupName: targetGroup,
      })
    );
    console.info(
      `[AUTH] Assigned confirmed user "${userName}" (${userAttributes.email}) to Cognito group: "${targetGroup}"`
    );
  } catch (error) {
    console.error(
      `[AUTH ERROR] Failed to assign user "${userName}" to Cognito group "${targetGroup}":`,
      error
    );
    throw error;
  }

  return event;
};
