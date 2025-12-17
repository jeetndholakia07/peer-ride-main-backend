import axios from "axios";

export async function getDistanceBetweenPoints(from, to) {
  try {
    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`; // OSRM expects lon,lat
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`;

    const { data } = await axios.get(url, {
      timeout: 5000 // optional timeout
    });

    if (!data.routes || data.routes.length === 0) return null;

    const distanceMeters = data.routes[0].distance; // in meters
    const durationSeconds = data.routes[0].duration; // in seconds

    return { distanceMeters, durationSeconds };
  } catch (err) {
    console.error("OSRM distance error:", err);
    return null;
  }
}