import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { bookingConflictHandler } from './data/booking-conflict/resource';

/**
 * CampusRoom Backend Architecture Definition
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
export const backend = defineBackend({
  auth,
  data,
  storage,
  bookingConflictHandler,
});

// Grant the booking conflict Lambda function permissions to query and write to the Booking DynamoDB table
const bookingTable = backend.data.resources.tables['Booking'];
bookingTable.grantReadWriteData(backend.bookingConflictHandler.resources.lambda);

// Grant query permissions on the Booking table's secondary indexes (including bookingsByRoomAndDate)
backend.bookingConflictHandler.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Query'],
    resources: [`${bookingTable.tableArn}/index/*`],
  })
);

backend.bookingConflictHandler.addEnvironment(
  'BOOKING_TABLE_NAME',
  bookingTable.tableName
);

// Grant read permissions on Room DynamoDB table to enforce maintenance checks
const roomTable = backend.data.resources.tables['Room'];
roomTable.grantReadData(backend.bookingConflictHandler.resources.lambda);

backend.bookingConflictHandler.addEnvironment(
  'ROOM_TABLE_NAME',
  roomTable.tableName
);

