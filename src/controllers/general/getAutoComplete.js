import { photonAutocomplete } from "../../maps/autocomplete.js";

const getAutocomplete = async (req, res) => {
    try {
        const { query, lang = "en", limit = 7 } = req.query;
        const queryText = query?.trim();
        if (!queryText) {
            return res.status(400).json({ message: "Query parameter is required" });
        }
        const results = await photonAutocomplete(queryText, lang, limit);
        res.status(200).json(results);
    } catch (err) {
        console.error("Autocomplete controller error:", err.message);
        if (err.isAxiosError) {
            return res.status(502).json({ message: "Failed to fetch suggestions from Photon" });
        }
        res.status(500).json({ message: "Server error" });
    }
};

export default getAutocomplete;
