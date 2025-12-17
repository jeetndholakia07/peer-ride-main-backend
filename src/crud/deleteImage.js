import cloudinary from "cloudinary";
import cloudinaryConfig from "../config/cloudinary.js";
cloudinaryConfig();

const deleteImage = async (publicId) => {
    await cloudinary.v2.uploader.destroy(publicId)
        .catch((err) => console.error("Error deleting cloudinary image:", err));
}

export default deleteImage;