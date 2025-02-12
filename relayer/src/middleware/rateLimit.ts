import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';
import type { RedisReply } from 'rate-limit-redis';

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const withdrawalLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args: [command: string, ...args: string[]]) => redis.call(...args) as Promise<RedisReply>,
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 withdrawals per window
    message: 'Too many withdrawal attempts, please try again later'
}); 