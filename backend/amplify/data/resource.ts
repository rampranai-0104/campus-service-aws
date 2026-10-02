import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { bookingConflictHandler } from './booking-conflict/resource';

/**
 * CampusRoom Data Architecture Definition
 * Models: UserProfile, Room, Booking, Notification
 * Custom Mutation: createBookingWithConflictCheck (Atomic Server-Side Conflict Engine)
 * Powered by AWS AppSync GraphQL and Amazon DynamoDB
 */
const schema = a.schema({
  UserRole: a.enum(['Student', 'Faculty', 'Admin']),
  RoomStatus: a.enum(['AVAILABLE', 'MAINTENANCE', 'INACTIVE']),
  BookingStatus: a.enum([
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'REJECTED',
    'CONFLICT',
  ]),

  BookingResult: a.customType({
    success: a.boolean().required(),
    bookingId: a.string(),
    roomId: a.string(),
    date: a.string(),
    startTime: a.string(),
    endTime: a.string(),
    status: a.string(),
    message: a.string().required(),
    errorCode: a.string(),
    conflictingBookingId: a.string(),
  }),

  UserProfile: a
    .model({
      userId: a.string().required(),
      name: a.string().required(),
      email: a.string().required(),
      role: a.ref('UserRole').required(),
      department: a.string(),
      phone: a.string(),
      bookings: a.hasMany('Booking', 'userId'),
    })
    .secondaryIndexes((index) => [
      index('userId'),
    ])
    .authorization((allow) => [
      allow.ownerDefinedIn('userId'),
      allow.group('Admin'),
    ]),

  Room: a
    .model({
      roomNumber: a.string().required(),
      name: a.string().required(),
      building: a.string().required(),
      floor: a.string(),
      capacity: a.integer().required(),
      description: a.string(),
      facilities: a.string().array(),
      image: a.string(),
      status: a.ref('RoomStatus').required(),
      bookings: a.hasMany('Booking', 'roomId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('Admin'),
    ]),

  Booking: a
    .model({
      roomId: a.id().required(),
      room: a.belongsTo('Room', 'roomId'),
      userId: a.string().required(),
      user: a.belongsTo('UserProfile', 'userId'),
      userName: a.string().required(),
      userRole: a.string().required(),
      date: a.date().required(),
      startTime: a.string().required(),
      endTime: a.string().required(),
      purpose: a.string().required(),
      status: a.ref('BookingStatus').required(),
    })
    .secondaryIndexes((index) => [
      index('roomId').sortKeys(['date']).name('bookingsByRoomAndDate'),
      index('userId').sortKeys(['date']),
    ])
    .authorization((allow) => [
      allow.ownerDefinedIn('userId'),
      allow.group('Admin'),
    ]),

  Notification: a
    .model({
      userId: a.string().required(),
      title: a.string().required(),
      message: a.string().required(),
      type: a.string().required(),
      read: a.boolean().default(false),
    })
    .secondaryIndexes((index) => [
      index('userId'),
    ])
    .authorization((allow) => [
      allow.ownerDefinedIn('userId'),
      allow.group('Admin'),
    ]),

  createBookingWithConflictCheck: a
    .mutation()
    .arguments({
      roomId: a.id().required(),
      date: a.date().required(),
      startTime: a.string().required(),
      endTime: a.string().required(),
      purpose: a.string().required(),
    })
    .returns(a.ref('BookingResult'))
    .authorization((allow) => [
      allow.authenticated(),
    ])
    .handler(a.handler.function(bookingConflictHandler)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
