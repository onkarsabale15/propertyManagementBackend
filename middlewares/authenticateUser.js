const env = require('dotenv');
env.config();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET_KEY;

// Middleware for user authentication and authorization
const authenticateUser = async (req, res, next) => {
  try {
    // Extract the token from the authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    // If no token is present, return an error response
    if (!token) {
      return res.status(401).json({ status: false, message: 'User must be logged in to perform this action.', action: '/login' });
    }
    // Verify the token using the JWT library and the secret key
    const decoded = jwt.verify(token, SECRET_KEY);
    // Retrieve user information from the database using the decoded user ID
    const user = await User.findById(decoded.userExists._id);
    // If the user is not found, return an error response
    if (!user) {
      return res.status(401).json({ status: false, message: 'User not found. Please log in.', action: '/login' });
    }
    // // Check if the user's role is included in the allowed roles
    // if (!roles.includes(user.role)) {
    //   return res.status(403).json({ status: 'Unauthorized', message: 'Unauthorized to access the route', action: '/' });
    // }

    // Attach the user information to the request object for further use in the route
    req.user = user;

    // Move to the next middleware or route handler
    next();
  } catch (error) {
    // console.log(error)
    // Handle JWT verification errors, distinguish between expired and invalid token
    const errorMessage = error.name === 'TokenExpiredError'
      ? 'Token has expired. Please log in again.'
      : 'Invalid token. Please log in again.';

    // Return an error response with the appropriate message
    res.status(401).json({ status: false, message: errorMessage, action: 'login' });
  }
};

// Export the authenticateUser middleware
module.exports = authenticateUser;