import multer from "multer";
import { ApiError } from "../utils/api-error";
import { HTTP_STATUS } from "../constants/http-status";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Only JPEG, PNG, and WebP images are allowed.",
        ),
      );
      return;
    }

    callback(null, true);
  },
});

export const uploadImages = upload.array("images", MAX_FILES);
