import cloudinary from "cloudinary";
import cloudinaryConfig from "../config/cloudinary.js";
cloudinaryConfig();

const getProfileImg = async (publicId, format, isUpdated) => {
    if (!publicId) return null;
    if (!isUpdated) {
        return cloudinary.v2.url(publicId, {
            width: 300,
            height: 300,
            format: format,
            version: Date.now(),
        });
    }

    const cloudinaryRes = await cloudinary.v2.api.resource(publicId, {
        type: "private",
        resource_type: "image",
    });
    const version = cloudinaryRes.version;

    const signedUrl = cloudinary.v2.url(publicId, {
        type: "private",
        sign_url: true,
        secure: true,
        format,
        version: version || Date.now()
    });

    return signedUrl;
};

export default getProfileImg;