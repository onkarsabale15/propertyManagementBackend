const { rateLimit } = require("express-rate-limit");

const createRateLimiter = (maxRequests) => {
  const rateLimiter = rateLimit({
    max: maxRequests,
    windowMs: 60 * 60 * 1000,
    message: `Too many requests from this IP address, please try after one hour.`
  });
  return rateLimiter;
};

module.exports = createRateLimiter;