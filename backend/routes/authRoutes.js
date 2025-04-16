const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../Models/User');
const { SendVerificationcode } = require('../middleware/Email');

dotenv.config(); // Load environment variables from .env file
const router = express.Router();

// =============================
//          SIGN UP
// =============================
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
                errors: {
                    ...(!name && { name: 'Name is required' }),
                    ...(!email && { email: 'Email is required' }),
                    ...(!password && { password: 'Password is required' }),
                },
            });
        }

        // 2. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Registration failed',
                errors: {
                    email: 'Email already exists',
                },
            });
        }

        // 3. Check password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Registration failed',
                errors: {
                    password: 'Password must be at least 6 characters',
                },
            });
        }

        // 4. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Generate a 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 6. Create new user with verification code
        user = new User({
            name,
            email,
            password: hashedPassword,
            verificationCode,
            emailVerified: false,
        });

        // 7. Save user in DB
        await user.save();

        // 8. Send verification email with code
        SendVerificationcode(email, verificationCode);

        // 9. Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // 10. Send response
        res.status(201).json({
            message: 'User created successfully. Please verify your email.',
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================
//          LOGIN
// =============================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    try {
        // 2. Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // 3. Compare password with hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // 4. Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '60s' });
        console.log('Generated token:', token); // Debugging line
        // 5. Send response
        res.json({ token, userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================
//      VERIFY EMAIL CODE
// =============================
router.post('/verify', async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // 2. Check if code matches (with trimming and string conversion)
        const storedCode = String(user.verificationCode).trim();
        const submittedCode = String(verificationCode).trim();

        console.log('Stored verification code:', storedCode);
        console.log('Submitted verification code:', submittedCode);

        if (storedCode !== submittedCode) {
            return res.status(400).json({
                message: 'Invalid verification code',
                debug: {
                    storedCode: user.verificationCode,
                    submittedCode: verificationCode,
                },
            });
        }

        // 3. Clear verification code and mark as verified
        user.verificationCode = null;
        user.emailVerified = true;
        await user.save();

        // 4. Generate new JWT token
        const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // 5. Send response with token
        return res.status(200).json({
            message: 'Email verified successfully',
            token,
            userId: user._id,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// =============================
//      VALIDATE TOKEN
// =============================
router.get('/validate', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ valid: false, message: 'User not found' });
        }

        return res.json({ valid: true });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ valid: false, message: 'Token expired' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ valid: false, message: 'Invalid token' });
        }
        return res.status(500).json({ valid: false, message: 'Server error' });
    }
});

// =============================
//      RESEND VERIFICATION code
// =============================
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Find existing user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        // 2. Generate new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        await user.save();

        // 3. Send new verification email
        SendVerificationcode(email, verificationCode);

        // 4. Send response
        res.status(200).json({
            success: true,
            message: 'New verification code sent',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
