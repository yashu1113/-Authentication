const User = require('../Models/User');
const cloudinary = require('../middleware/cloudinaryConfig');

const uploadProfileImage = async (req, res) => {
    try {
        console.log('uploadProfileImage called for user id:', req.user.id);
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Wrap upload_stream in a Promise to await it
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: 'profile_images' }, async (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
                stream.end(req.file.buffer);
            });
        };

        const result = await uploadToCloudinary();

        // Update user's document in MongoDB with Cloudinary URL
        const user = await User.findByIdAndUpdate(req.user.id, { profileImage: result.secure_url }, { new: true });

        res.status(200).json({
            message: 'Image uploaded successfully',
            imagePath: user.profileImage,
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { uploadProfileImage };
