import axios from "axios";

export async function photonAutocomplete(query, lang = "en", limit = 5) {
    if (!query) return [];

    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=${lang}&limit=${limit}`;

    try {
        const { data } = await axios.get(url, { headers: { Accept: "application/json" } });

        if (!data.features || !Array.isArray(data.features)) return [];

        return data.features.map(f => {
            const addressParts = [
                f.properties.name,
                f.properties.city,
                f.properties.state,
                f.properties.country
            ].filter(Boolean);
            return {
                address: addressParts.join(", "),
                lat: f.geometry.coordinates[1],
                lng: f.geometry.coordinates[0],
                state: f.properties.state
            };
        });
    } catch (err) {
        console.error("Photon autocomplete error:", err);
        return [];
    }
}
