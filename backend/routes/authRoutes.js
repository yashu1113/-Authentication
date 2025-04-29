const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../Models/User');
const { SendVerificationcode } = require('../middleware/Email');
const { verifyToken, authorizeRoles } = require('../middleware/authorizeRole');
const upload = require('../middleware/upload'); // import upload middleware
const { uploadProfileImage } = require('../Controller/userController');

dotenv.config(); // Load environment variables
const router = express.Router();

// Get all users (admin, backenduser, user)
router.get('/', verifyToken, authorizeRoles('admin', 'backenduser', 'user'), async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Upload profile image
router.post('/upload-profile-image', verifyToken, authorizeRoles('user', 'admin', 'backenduser'), upload.single('profileImage'), uploadProfileImage);

// Get current user profile (name, email, profileImage)
router.get('/current-user', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Directly return what is in DB (no fs check needed)
        res.json({
            name: user.name,
            email: user.email,
            profileImage: user.profileImage || '',
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new user (admin only)
router.post('/', verifyToken, authorizeRoles('admin'), async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
});

router.put('/:id', verifyToken, async (req, res) => {
    // Only verifyToken middleware to ensure user is logged in and token is valid
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

// Delete a user (admin only)
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
});

// Get paginated list of users (admin only)
router.get('/allusers', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const users = await User.find({}, 'name email role').skip(skip).limit(limit);

        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            users,
            totalUsers,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error('Pagination error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================
//          SIGN UP
// =============================
router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

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
            isAdmin: false,
            role: role || 'user', //default role
            profileImage: '',
        });

        // 7. Save user in DB
        await user.save();

        // 8. Send verification email with code
        SendVerificationcode(email, verificationCode);

        // 9. Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '60s' });

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

        // 4. Assign role based on email
        let role = user.role;
        if (email === 'yashchodhari4301@gmail.com') {
            role = 'admin';
        }

        // 5. Generate JWT token with assigned role
        const token = jwt.sign({ id: user._id, email: user.email, name: user.name, role: role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated token:', token); // Debugging line
        // 6. Send response
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

        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(401).json({ valid: false, message: 'Email not verified' });
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
