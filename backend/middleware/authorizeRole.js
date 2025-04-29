const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log('Authorization header missing');
        return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('JWT verification error:', err.message);
            return res.sendStatus(403);
        }
        console.log('JWT verified, decoded token:', decoded);
        req.user = decoded;
        next();
    });
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log('Authorizing roles:', roles, 'User role:', req.user.role);
        if (!roles.includes(req.user.role)) {
            console.log('Access denied for role:', req.user.role);
            return res.status(403).json({ message: 'Access denied' });
        }
        console.log('Access granted for role:', req.user.role);
        next();
    };
};
