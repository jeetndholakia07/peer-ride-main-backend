import cloudinary from "cloudinary";
import addVerifiedBadge from "../crud/addVerifiedBadge.js";
import cloudinaryConfig from "../config/cloudinary.js";

cloudinaryConfig();

const uploadProfileImageWithBadge = async (publicId, isUpdated) => {
    try {
        const result = await addVerifiedBadge(publicId);

        if (result.eager && result.eager.length > 0) {
            let finalUrl = result.eager[0].secure_url;

            const uploadOptions = {
                public_id: publicId,
                overwrite: true,
                resource_type: "image",
            };

            if (isUpdated) {
                uploadOptions.type = "private";
            }
            const overwrite = await cloudinary.v2.uploader.upload(finalUrl, uploadOptions);

            return overwrite;
        } else {
            throw new Error("Verified badge generation failed.");
        }
    } catch (error) {
        console.error("Error uploading profile image with badge:", error);
        throw new Error("Cloudinary upload failed.");
    }
};

export default uploadProfileImageWithBadge;