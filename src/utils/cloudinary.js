import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file, folder = 'contact-avatars') => {
  try {
    if (!file) {
      return null;
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'auto',
      use_filename: true,
    });

    return result.secure_url;
  } catch (error) {
    throw error;
  }
};

export const deleteFromCloudinary = async (photoUrl) => {
  try {
    if (!photoUrl) {
      return;
    }

    const publicId = photoUrl
      .split('/')
      .slice(-2)
      .join('/')
      .split('.')[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw error;
  }
};
