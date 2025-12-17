import cloudinary from "cloudinary";
import { slugify } from "../utils/format.js";
import cloudinaryConfig from "../config/cloudinary.js";
cloudinaryConfig();

const uploadVerifiedImage = async (filePath, folder, name) => {
    const formattedName = slugify(name);
    const result = await cloudinary.v2.uploader.upload(filePath, {
        public_id: `${folder}/${formattedName}`,
        type: "private",
        overwrite: true,
        resource_type: "image",
        transformation: [
            { width: 300, height: 300, crop: "thumb", quality: "auto" },
            { overlay: "icons/verified", width: 50, height: 50, gravity: "north_east", x: 5, y: 5, crop: "scale" }
        ]
    }).catch((err) => console.error("Error uploading collegeID to cloudinary:", err));

    return result;
}
export default uploadVerifiedImage;