import { cloudinary } from "../../config/cloudinary";
import { ApiError } from "../../utils/api-error";
import { HTTP_STATUS } from "../../constants/http-status";

interface UploadedImage {
  imageUrl: string;
  publicId: string;
}
export async function uploadImage(
  file: Express.Multer.File,
  folder: string,
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `estateflow/${folder}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", {
            message: error.message,
            http_code: error.http_code,
          });

          reject(
            new ApiError(
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
              "Failed to upload image to Cloudinary.",
            ),
          );
          return;
        }

        if (!result) {
          reject(
            new ApiError(
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
              "Cloudinary returned no upload result.",
            ),
          );
          return;
        }

        resolve({
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.end(file.buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to delete image from Cloudinary.",
    );
  }
}

console.log({
  cloudNameLoaded: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  apiKeyLoaded: Boolean(process.env.CLOUDINARY_API_KEY),
  apiSecretLoaded: Boolean(process.env.CLOUDINARY_API_SECRET),
});

console.log("Cloudinary config:", cloudinary.config());
