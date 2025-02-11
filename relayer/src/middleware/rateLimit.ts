import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const withdrawalLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 withdrawals per window
    message: 'Too many withdrawal attempts, please try again later'
}); 