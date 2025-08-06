import express from 'express';
import Note from '../models/note.js';
import sanitizeHtml from 'sanitize-html';
import { Filter } from 'bad-words';
import { cacheMiddleware, invalidateCache, invalidateNoteCache } from '../middleware/cacheMiddleware.js';

const router = express.Router();

router.get('/', cacheMiddleware(300), async (req, res, next) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', cacheMiddleware(300), async (req, res, next) => {
    try {
        const { id } = req.params;
        const note = await Note.find({ _id: id });
        res.json(note);
    } catch (err) {
        next(err);
    }
});

router.post('/', invalidateCache(), async (req, res, next) => {
    try {
        const { title, content, tags } = req.body;

        const filter = new Filter();

        // Sanitize title and content to strip all HTML and prevent XSS
        const sanitizedTitle = filter.clean(sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} }));
        const sanitizedContent = filter.clean(sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }));

        let sanitizedTags = [];
        if (Array.isArray(tags)) {
            sanitizedTags = tags.map(tag =>
                typeof tag === 'string'
                    ? filter.clean(sanitizeHtml(tag, { allowedTags: [], allowedAttributes: {} }))
                    : ''
            ).filter(Boolean);
        }

        const note = new Note({
            title: sanitizedTitle,
            content: sanitizedContent,
            tags: sanitizedTags
        });
        const savedNote = await note.save();
        res.status(201).json(savedNote);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', invalidateNoteCache(), async (req, res, next) => {
    try {
        const { id } = req.params;
        const filter = new Filter();

        // Only update fields that are present in the request body
        const updateFields = {};

        if (req.body.title !== undefined) {
            // Sanitize title to strip all HTML and prevent XSS
            updateFields.title = filter.clean(sanitizeHtml(req.body.title, { allowedTags: [], allowedAttributes: {} }));
        }

        if (req.body.content !== undefined) {
            // Sanitize content to strip all HTML and prevent XSS
            updateFields.content = filter.clean(sanitizeHtml(req.body.content, { allowedTags: [], allowedAttributes: {} }));
        }

        if (req.body.tags !== undefined) {
            // Sanitize tags array
            let sanitizedTags = [];
            if (Array.isArray(req.body.tags)) {
                sanitizedTags = req.body.tags.map(tag =>
                    typeof tag === 'string'
                        ? filter.clean(sanitizeHtml(tag, { allowedTags: [], allowedAttributes: {} }))
                        : ''
                ).filter(Boolean);
            }
            updateFields.tags = sanitizedTags;
        }

        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            res.status(404);
            throw new Error('Note not found');
        }

        res.json(updatedNote);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', invalidateNoteCache(), async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedNote = await Note.findByIdAndDelete(id);

        if (!deletedNote) {
            res.status(404);
            throw new Error('Note not found');
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        next(err);
    }
});

export default router;
