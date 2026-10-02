import { defineFunction } from '@aws-amplify/backend';

/**
 * Post-confirmation Lambda trigger to automatically assign
 * verified users to the appropriate Cognito group (Student or Faculty),
 * while strictly blocking any self-assignment to the Admin group.
 */
export const postConfirmation = defineFunction({
  name: 'auth-post-confirmation',
  entry: './handler.ts',
  resourceGroupName: 'auth',
});
