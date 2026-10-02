import { defineFunction } from '@aws-amplify/backend';

/**
 * Lambda function resource for validating and creating bookings with
 * atomic interval overlap and collision prevention.
 */
export const bookingConflictHandler = defineFunction({
  name: 'booking-conflict-handler',
  entry: './handler.ts',
  resourceGroupName: 'data',
});
