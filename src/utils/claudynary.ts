import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import * as streamifier from "streamifier";

import { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } from "../config";

cloudinary.config({
  api_key: CLOUDINARY_KEY || "",
  api_secret: CLOUDINARY_SECRET || "",
  cloud_name: CLOUDINARY_NAME || "",
});

export function cloudinaryUpload(
  file: Express.Multer.File
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      (err, res: UploadApiResponse) => {
        if (err) return reject(err);

        resolve(res);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
}

export function extractPublicIdFromUrl(url: string) {
  try {
    const urlParts = url.split("/");
    const publicId = urlParts[urlParts.length - 1].split(".")[0];

    return publicId;
  } catch (err) {
    throw err;
  }
}

export async function cloudinaryRemove(secure_url: string) {
  try {
    const publicId = extractPublicIdFromUrl(secure_url);

    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    throw err;
  }
}
