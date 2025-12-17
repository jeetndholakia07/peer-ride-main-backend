import cloudinary from "cloudinary";
import cloudinaryConfig from "../config/cloudinary.js";

cloudinaryConfig();

const addVerifiedBadge = async (publicId) => {
    try {
        const verifiedIcon = process.env.DEFAULT_TICK_PUBLICID;
        const result = await cloudinary.v2.uploader.explicit(publicId, {
            type: "private",
            eager: [
                {
                    width: 300,
                    height: 300,
                    crop: "fill",
                    overlay: verifiedIcon,
                    gravity: "north_east",
                    x: 30,
                    y: 15,
                    width: 70,
                    height: 70,
                    crop: "scale"
                },
            ],
            eager_async: false,
        });
        return result;
    } catch (err) {
        console.error("Error adding verified badge to Cloudinary:", err);
        return null;
    }
}
export default addVerifiedBadge;