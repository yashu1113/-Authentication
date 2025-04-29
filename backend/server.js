const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: './.env' });

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(` Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Serve uploads folder statically
// app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Configure CORS with frontend origin
app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Log the MongoDB URI specifically
console.log('MongoDB URI:', process.env.MONGO_URI);
const authRoutes = require('./routes/authRoutes'); // Import auth routes
app.use('/api/auth', authRoutes);

// Connect to MongoDB with improved error handling
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log(' Connected to MongoDB successfully');
    })
    .catch((err) => {
        console.error(' MongoDB connection error:', err.message);
        process.exit(1); // Exit process on connection failure
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});
