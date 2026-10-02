// AppSync GraphQL Operations for CampusRoom

export const listRoomsQuery = /* GraphQL */ `
  query ListRooms($filter: ModelRoomFilterInput, $limit: Int) {
    listRooms(filter: $filter, limit: $limit) {
      items {
        id
        code
        name
        building
        campusSector
        floor
        capacity
        roomType
        facilities
        image
        status
        custodian
        instantBookable
      }
    }
  }
`;

export const getRoomQuery = /* GraphQL */ `
  query GetRoom($id: ID!) {
    getRoom(id: $id) {
      id
      code
      name
      building
      campusSector
      floor
      capacity
      roomType
      facilities
      image
      status
      custodian
      instantBookable
      bookings {
        items {
          id
          date
          startTime
          endTime
          purpose
          status
        }
      }
    }
  }
`;

export const listBookingsQuery = /* GraphQL */ `
  query ListBookings($filter: ModelBookingFilterInput, $limit: Int) {
    listBookings(filter: $filter, limit: $limit) {
      items {
        id
        userId
        roomId
        roomName
        building
        date
        startTime
        endTime
        purpose
        attendeeCount
        status
        keycardPin
        qrPassCode
        adminNotes
        createdAt
      }
    }
  }
`;

export const createBookingMutation = /* GraphQL */ `
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      userId
      roomId
      roomName
      building
      date
      startTime
      endTime
      purpose
      attendeeCount
      status
      keycardPin
      qrPassCode
      createdAt
    }
  }
`;

export const updateBookingMutation = /* GraphQL */ `
  mutation UpdateBooking($input: UpdateBookingInput!) {
    updateBooking(input: $input) {
      id
      status
      adminNotes
      updatedAt
    }
  }
`;

export const cancelBookingMutation = /* GraphQL */ `
  mutation CancelBooking($input: DeleteBookingInput!) {
    deleteBooking(input: $input) {
      id
      status
    }
  }
`;

export const createRoomMutation = /* GraphQL */ `
  mutation CreateRoom($input: CreateRoomInput!) {
    createRoom(input: $input) {
      id
      code
      name
      building
      floor
      capacity
      roomType
      facilities
      image
      status
    }
  }
`;

export const updateRoomMutation = /* GraphQL */ `
  mutation UpdateRoom($input: UpdateRoomInput!) {
    updateRoom(input: $input) {
      id
      name
      building
      floor
      capacity
      roomType
      facilities
      status
      image
    }
  }
`;
