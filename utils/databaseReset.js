import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Note from '../models/note.js';
import connectDB from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const resetDatabase = async () => {
    try {
        // Connect to database if not already connected
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }

        console.log('Starting database reset...');

        // Delete all documents from the notes collection
        const deleteResult = await Note.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} documents from notes collection`);

        // Read sample data
        const sampleDataPath = path.join(__dirname, '../sample-data/notes-data.json');
        const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));

        // Transform the data to match our schema
        const transformedData = sampleData.map(note => ({
            title: note.title,
            content: note.content,
            tags: note.tags,
            // Convert MongoDB date format to JavaScript Date objects
            createdAt: new Date(note.createdAt.$date),
            updatedAt: new Date(note.updatedAt.$date)
        }));

        // Insert the sample data
        const insertResult = await Note.insertMany(transformedData);
        console.log(`Inserted ${insertResult.length} documents into notes collection`);

        return {
            success: true,
            deletedCount: deleteResult.deletedCount,
            insertedCount: insertResult.length
        };

    } catch (error) {
        console.error('Error resetting database:', error);
        throw error;
    }
};