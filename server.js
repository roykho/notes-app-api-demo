import express from 'express';
import errorHandler from './middleware/errorHandler.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import notesRouter from './routes/noteRoute.js';

dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 8000;

// Trust first proxy - required for Vercel and other reverse proxies
app.set('trust proxy', 1);

// Rate limiting configuration
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limit for POST requests (creating notes)
const createNoteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 10 note creations per minute
    message: {
        error: 'Too many note creation requests. Please wait a minute before creating more notes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method !== 'POST', // Only apply to POST requests
});

// Stricter rate limit for PUT/DELETE requests (modifying notes)
const modifyNoteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 20 modifications per minute
    message: {
        error: 'Too many note modification requests. Please wait a minute before making more changes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !['PUT', 'DELETE'].includes(req.method), // Only apply to PUT and DELETE requests
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to the notes API
app.use('/api/notes', generalLimiter);
app.use('/api/notes', createNoteLimiter);
app.use('/api/notes', modifyNoteLimiter);

app.use('/api/notes', notesRouter);

app.use((req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Express connected at: ${PORT}`);
});
