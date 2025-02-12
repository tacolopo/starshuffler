import rateLimit from 'express-rate-limit';

export const withdrawalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000000, // Set to a very high number effectively disabling it
    message: 'Too many withdrawal attempts, please try again later'
}); 