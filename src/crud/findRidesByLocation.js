import Drive from "../models/Drive.js";
import { getDistanceBetweenPoints } from "../maps/osrm.js";

export async function findRidesByLocation({
  fromCoords,
  toCoords,
  fromAddress,
  toAddress,
  seats,
  startOfDay,
  endOfDay,
  radiusKm = 10,
  page = 1,
  limit = 5,
}) {
  const skip = (page - 1) * limit;

  const formatResponse = (rides) => {
    return rides.map(r => {
      return {
        ...r,
        vehicleDetails: r.vehicleDetails?.vehicleDetails,
      };
    });
  };

  let query = {
    driveStatus: { $nin: ["completed", "cancelled"] },
    seatsAvailable: { $gte: seats },
    departureTime: { $gte: startOfDay, $lte: endOfDay },
  };

  if (fromAddress)
    query["from.address"] = { $regex: fromAddress, $options: "i" };
  if (toAddress) query["to.address"] = { $regex: toAddress, $options: "i" };

  // Try by address first
  let rides = await Drive.find(query)
    .populate("driver", "username")
    .populate({
      path: "vehicleDetails",
      select: "vehicleDetails"
    })
    .lean()
    .sort({ departureTime: 1 })
    .skip(skip)
    .limit(limit);

  if (rides.length > 0) {
    const res = formatResponse(rides);
    return res;
  }

  // Geo search using destination (toCoords)
  if (toCoords) {
    const geoQuery = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [toCoords.lng, toCoords.lat] },
          distanceField: "distanceToDestination",
          maxDistance: radiusKm * 1000, // meters
          spherical: true,
          key: "to.location",
          query: {
            driveStatus: { $nin: ["completed", "cancelled"] },
            seatsAvailable: { $gte: seats },
            departureTime: { $gte: startOfDay, $lte: endOfDay },
          },
        },
      },
      { $sort: { departureTime: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "driver",
          foreignField: "_id",
          as: "driver",
        },
      },
      { $unwind: "$driver" },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleDetails",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      { $unwind: "$vehicleDetails" }
    ];

    rides = await Drive.aggregate(geoQuery);
    if (rides.length > 0) return formatResponse(rides);
  }

  // Fallback — use OSRM distance if none found within radius
  const buffer = limit * 5;
  const cursor = Drive.find({
    driveStatus: { $nin: ["completed", "cancelled"] },
    seatsAvailable: { $gte: seats },
    departureTime: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate("driver", "username")
    .populate({
      path: "vehicleDetails",
      select: "vehicleDetails"
    })
    .lean()
    .sort({ departureTime: 1 })
    .cursor();

  const ridesWithinDistance = [];
  for await (const ride of cursor) {
    if (!ride.to?.location?.coordinates) continue; // use destination coords

    const distanceData = await getDistanceBetweenPoints(
      { lat: toCoords.lat, lng: toCoords.lng },
      { lat: ride.to.location.coordinates[1], lng: ride.to.location.coordinates[0] }
    );

    if (distanceData && distanceData.distanceMeters / 1000 <= radiusKm) {
      ridesWithinDistance.push({
        ...ride.toObject(),
        distanceToDestination: distanceData.distanceMeters,
      });
      if (ridesWithinDistance.length >= skip + limit + buffer) break;
    }
  }

  return ridesWithinDistance.slice(skip, skip + limit);
}