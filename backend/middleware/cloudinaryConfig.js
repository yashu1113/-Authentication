const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: 'dc3hrpc0j',
    api_key: '248266925315451',
    api_secret: 'SFWU8a5OJ1pmfuZaiva6DC863VI',
    secure: true,
});

module.exports = cloudinary;
