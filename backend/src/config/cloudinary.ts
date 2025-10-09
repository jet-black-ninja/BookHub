import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Custom storage engine for Cloudinary
const storage = multer.memoryStorage();

// Create multer upload middleware
export const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (_req, file, cb) => {
		// Check if file is an image
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed!'));
		}
	},
});

// Helper function to upload image to cloudinary
export const uploadToCloudinary = async (
	buffer: Buffer,
	originalName: string
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: 'library-books',
				allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
				transformation: [
					{ width: 400, height: 600, crop: 'fill' },
					{ quality: 'auto' },
				],
				public_id: `${Date.now()}-${originalName.split('.')[0]}`,
			},
			(error, result) => {
				if (error) {
					reject(
						new Error(`Cloudinary upload failed: ${error.message}`)
					);
				} else {
					resolve(result!.secure_url);
				}
			}
		);

		const stream = Readable.from(buffer);
		stream.pipe(uploadStream);
	});
};

// Helper function to upload review image to cloudinary
export const uploadReviewImageToCloudinary = async (
	buffer: Buffer,
	originalName: string
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: 'library-reviews',
				allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
				transformation: [
					{ width: 800, height: 600, crop: 'limit' },
					{ quality: 'auto' },
				],
				public_id: `review-${Date.now()}-${originalName.split('.')[0]}`,
			},
			(error, result) => {
				if (error) {
					reject(
						new Error(`Cloudinary upload failed: ${error.message}`)
					);
				} else {
					resolve(result!.secure_url);
				}
			}
		);

		const stream = Readable.from(buffer);
		stream.pipe(uploadStream);
	});
};

// Helper function to delete image from cloudinary
export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
	try {
		// Extract public_id from cloudinary URL
		const urlParts = imageUrl.split('/');
		const publicIdWithExtension = urlParts[urlParts.length - 1];
		const publicId = `library-books/${publicIdWithExtension.split('.')[0]}`;

		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		console.error('Error deleting image from cloudinary:', error);
		// Don't throw error as this shouldn't block the main operation
	}
};

// Helper function to delete review image from cloudinary
export const deleteReviewImageFromCloudinary = async (
	imageUrl: string
): Promise<void> => {
	try {
		// Extract public_id from cloudinary URL
		const urlParts = imageUrl.split('/');
		const publicIdWithExtension = urlParts[urlParts.length - 1];
		const publicId = `library-reviews/${publicIdWithExtension.split('.')[0]}`;

		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		console.error('Error deleting review image from cloudinary:', error);
		// Don't throw error as this shouldn't block the main operation
	}
};

export default cloudinary;
