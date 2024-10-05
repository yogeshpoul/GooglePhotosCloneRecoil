const jwt = require("jsonwebtoken");
require('dotenv').config();

const authMiddleware = (request, response, next) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(403).json({});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        request.userId = decoded.userId;//assigns the userId from the decoded token to request.userId:

        next();
    } catch (err) {
        return response.status(403).json({});
    }
    
};

module.exports = {
    authMiddleware
}