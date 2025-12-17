import axios from "axios";

const cache = new Map();

async function geocodeAddress(address) {
  if (!address) return null;

  const key = address.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key);

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

    const { data } = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "YourAppName/1.0 (your@email.com)" // Required by Nominatim
      },
      timeout: 5000
    });

    if (!Array.isArray(data) || data.length === 0) return null;

    const coords = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
    cache.set(key, coords);
    return coords;

  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
}

async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`;

    const { data } = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "YourAppName/1.0 (your@email.com)"
      },
      timeout: 5000
    });

    return data?.display_name || null;

  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return null;
  }
}

async function fetchRoute(from, to) {
  try {
    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    const { data } = await axios.get(url, { timeout: 5000 });

    const geometry = data?.routes?.[0]?.geometry?.coordinates;
    if (!geometry) return null;

    // Convert [lon, lat] -> [lat, lon]
    const line = geometry.map(c => [c[1], c[0]]);
    return line;

  } catch (err) {
    console.error("OSRM fetch route failed:", err);
    return null;
  }
}

export { geocodeAddress, reverseGeocode, fetchRoute }