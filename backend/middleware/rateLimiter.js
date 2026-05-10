const rateLimit = require('express-rate-limit');
exports.aiLimiter = rateLimit({ windowMs: 60*1000, max: 20, message: { message: 'Too many AI requests.' } });
exports.apiLimiter = rateLimit({ windowMs: 15*60*1000, max: 300, message: { message: 'Too many requests.' } });
