import type { AppSyncResolverHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

interface CreateBookingArguments {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
}

interface BookingResult {
  success: boolean;
  bookingId?: string;
  roomId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  message: string;
  errorCode?: string;
  conflictingBookingId?: string;
}

interface ExistingBookingRecord {
  id: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
}

/**
 * AppSync Custom Mutation Handler for atomic, server-side room booking conflict resolution.
 * 
 * Flow:
 * 1. Verify caller authorization identity via AppSync Cognito claims.
 * 2. Validate booking time range (HH:mm format, startTime < endTime).
 * 3. Query DynamoDB using the 'bookingsByRoomAndDate' GSI for the requested room and date.
 * 4. Filter out CANCELLED and REJECTED bookings.
 * 5. Run interval overlap check: existingStart < newEnd && existingEnd > newStart.
 * 6. Atomically persist confirmed booking via DynamoDB TransactWriteItems.
 */
export const handler: AppSyncResolverHandler<
  CreateBookingArguments,
  BookingResult
> = async (event) => {
  // 1. Authorization Verification
  const identity = event.identity as Record<string, any> | undefined;
  if (!identity || (!identity.sub && !identity.username)) {
    return {
      success: false,
      message: 'Unauthorized: A valid authenticated session is required to reserve a campus space.',
      errorCode: 'UNAUTHORIZED',
    };
  }

  const userId = (identity.sub || identity.username) as string;
  const claims = (identity.claims || {}) as Record<string, any>;
  const userName = (claims.name || identity.username || 'Campus Member') as string;

  // Determine user role from verified Cognito groups
  const groups: string[] = claims['cognito:groups'] || [];
  let userRole = 'Student';
  if (groups.includes('Admin')) {
    userRole = 'Admin';
  } else if (groups.includes('Faculty')) {
    userRole = 'Faculty';
  }

  // 2. Input Validation
  const { roomId, date, startTime, endTime, purpose } = event.arguments;

  if (!roomId || !date || !startTime || !endTime || !purpose) {
    return {
      success: false,
      message: 'Invalid input: roomId, date, startTime, endTime, and purpose are all required.',
      errorCode: 'INVALID_INPUT',
    };
  }

  // Time format: HH:mm (24-hour)
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return {
      success: false,
      message: `Invalid time format. Times must use HH:mm 24-hour syntax (e.g. "09:30", "15:00"). Received startTime: "${startTime}", endTime: "${endTime}".`,
      errorCode: 'INVALID_TIME_RANGE',
    };
  }

  // Range validation: startTime must precede endTime
  if (startTime >= endTime) {
    return {
      success: false,
      message: `Invalid time range: startTime ("${startTime}") must be strictly before endTime ("${endTime}").`,
      errorCode: 'INVALID_TIME_RANGE',
    };
  }

  // Date format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return {
      success: false,
      message: `Invalid date format: Date must follow YYYY-MM-DD syntax. Received: "${date}".`,
      errorCode: 'INVALID_DATE',
    };
  }

  const bookingTableName = process.env.BOOKING_TABLE_NAME || 'Booking';
  const roomTableName = process.env.ROOM_TABLE_NAME || 'Room';
  const indexName = 'bookingsByRoomAndDate';

  try {
    // 3. Verify Room status - Maintenance check
    const roomResponse = await ddbDocClient.send(
      new GetCommand({
        TableName: roomTableName,
        Key: { id: roomId },
      })
    );

    const roomItem = roomResponse.Item;
    if (roomItem && roomItem.status === 'MAINTENANCE') {
      return {
        success: false,
        message: `Space Unavailable: "${roomItem.name || 'This space'}" is currently under maintenance and cannot be reserved.`,
        errorCode: 'ROOM_UNDER_MAINTENANCE',
      };
    }

    // 4. Query existing bookings for this room & date using secondary index
    const queryResponse = await ddbDocClient.send(
      new QueryCommand({
        TableName: bookingTableName,
        IndexName: indexName,
        KeyConditionExpression: 'roomId = :roomId AND #bookingDate = :bookingDate',
        ExpressionAttributeNames: {
          '#bookingDate': 'date',
        },
        ExpressionAttributeValues: {
          ':roomId': roomId,
          ':bookingDate': date,
        },
      })
    );

    const existingBookings = (queryResponse.Items || []) as ExistingBookingRecord[];

    // 4. Ignore CANCELLED and REJECTED bookings
    const activeBookings = existingBookings.filter(
      (booking) => booking.status !== 'CANCELLED' && booking.status !== 'REJECTED'
    );

    // 5. Interval Overlap Formula: existingStart < newEnd && existingEnd > newStart
    const conflictingBooking = activeBookings.find((existing) => {
      return existing.startTime < endTime && existing.endTime > startTime;
    });

    if (conflictingBooking) {
      return {
        success: false,
        message: `Booking Conflict: Room is already reserved for "${conflictingBooking.purpose}" from ${conflictingBooking.startTime} to ${conflictingBooking.endTime}.`,
        errorCode: 'CONFLICT',
        conflictingBookingId: conflictingBooking.id,
      };
    }

    const initialStatus = userRole === 'Admin' ? 'CONFIRMED' : 'PENDING';

    // 6. Atomically persist booking
    const bookingId = randomUUID();
    const timestamp = new Date().toISOString();

    const newBookingItem = {
      id: bookingId,
      roomId,
      userId,
      userName,
      userRole,
      date,
      startTime,
      endTime,
      purpose,
      status: initialStatus,
      createdAt: timestamp,
      updatedAt: timestamp,
      __typename: 'Booking',
    };

    await ddbDocClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: bookingTableName,
              Item: newBookingItem,
              ConditionExpression: 'attribute_not_exists(id)',
            },
          },
        ],
      })
    );

    return {
      success: true,
      bookingId,
      roomId,
      date,
      startTime,
      endTime,
      status: initialStatus,
      message: initialStatus === 'CONFIRMED'
        ? 'Room booking successfully confirmed. No schedule collision detected.'
        : 'Room reservation request submitted. Awaiting administrative review.',
    };
  } catch (error: any) {
    console.error('[BOOKING CONFLICT ERROR] Execution failed:', error);
    return {
      success: false,
      message: `Failed to process room reservation: ${error.message || 'Internal error'}`,
      errorCode: 'INTERNAL_ERROR',
    };
  }
};
