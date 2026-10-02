import { defineStorage } from '@aws-amplify/backend';

/**
 * Storage configuration for CampusRoom room media and imagery.
 * 
 * Access control policies:
 * - Administrators can upload, update, and delete room images ('room-images/*')
 * - Authenticated users (Students, Faculty, Admins) can read room images
 */
export const storage = defineStorage({
  name: 'roomImages',
  access: (allow) => ({
    'room-images/*': [
      allow.groups(['Admin']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
  }),
});
