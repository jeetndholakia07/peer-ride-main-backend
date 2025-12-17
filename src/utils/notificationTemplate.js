export const notificationTemplates = {
    rideRequested: ({ passengerName, from, to, linkId }) => ({
        heading: "New Ride Request",
        message: `${passengerName} has requested a ride from ${from} to ${to}. Please review and respond.`,
        linkId
    }),

    rideAccepted: ({ driverName, from, to, linkId }) => ({
        heading: "Ride Request Accepted",
        message: `${driverName} has accepted your ride request from ${from} to ${to}. Get ready for your trip!`,
        linkId
    }),

    rideRejected: ({ driverName, from, to, linkId }) => ({
        heading: "Ride Request Rejected",
        message: `${driverName} has rejected your ride request from ${from} to ${to}. We apologize for the inconvenience.`,
        linkId
    }),

    rideCompleted: ({ driverName, from, to, linkId }) => ({
        heading: "Ride Completed",
        message: `Your ride journey with ${driverName} from ${from} to ${to} has been successfully completed. We hope you had a great experience!`,
        linkId
    }),

    driveCancelled: ({ driverName, from, to, linkId }) => ({
        heading: "Drive Cancelled",
        message: `${driverName} has cancelled the ride from ${from} to ${to}. We apologize for the inconvenience.`,
        linkId
    }),

    driverRating: ({ passengerName, rating, linkId }) => ({
        heading: "New Rating Received!",
        message: `${passengerName} rated you ${rating}★ for your recent ride. Keep up the great work!`,
        linkId
    }),

    generic: ({ title, body }) => ({
        heading: title,
        message: body,
    }),
};