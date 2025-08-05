import request from 'supertest';
import express from 'express';
import noteRoute from '../../routes/noteRoute.js';
import Note from '../../models/note.js';

const app = express();
app.use(express.json());
app.use('/api/notes', noteRoute);

describe('Note Routes', () => {
    describe('GET /api/notes', () => {
        it('should return all notes', async () => {
            // Create test notes
            const note1 = new Note({
                title: 'Test Note 1',
                content: 'Test content 1',
                tags: ['test', 'example'],
            });
            const note2 = new Note({
                title: 'Test Note 2',
                content: 'Test content 2',
                tags: ['work'],
            });

            await note1.save();
            await note2.save();

            const response = await request(app).get('/api/notes').expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0].title).toBe('Test Note 1');
            expect(response.body[1].title).toBe('Test Note 2');
        });

        it('should return empty array when no notes exist', async () => {
            const response = await request(app).get('/api/notes').expect(200);

            expect(response.body).toHaveLength(0);
        });
    });

    describe('GET /api/notes/:id', () => {
        it('should return a specific note by ID', async () => {
            const note = new Note({
                title: 'Test Note',
                content: 'Test content',
                tags: ['test'],
            });
            const savedNote = await note.save();

            const response = await request(app)
                .get(`/api/notes/${savedNote._id}`)
                .expect(200);

            expect(response.body[0].title).toBe('Test Note');
            expect(response.body[0].content).toBe('Test content');
        });

        it('should return empty array for non-existent note ID', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/notes/${fakeId}`)
                .expect(200);

            expect(response.body).toHaveLength(0);
        });
    });

    describe('POST /api/notes', () => {
        it('should create a new note with valid data', async () => {
            const noteData = {
                title: 'New Test Note',
                content: 'New test content',
                tags: ['new', 'test'],
            };

            const response = await request(app)
                .post('/api/notes')
                .send(noteData)
                .expect(201);

            expect(response.body.title).toBe('New Test Note');
            expect(response.body.content).toBe('New test content');
            expect(response.body.tags).toEqual(['new', 'test']);
            expect(response.body._id).toBeDefined();
            expect(response.body.createdAt).toBeDefined();
            expect(response.body.updatedAt).toBeDefined();
        });

        it('should create a note without tags', async () => {
            const noteData = {
                title: 'Note without tags',
                content: 'Content without tags',
            };

            const response = await request(app)
                .post('/api/notes')
                .send(noteData)
                .expect(201);

            expect(response.body.title).toBe('Note without tags');
            expect(response.body.content).toBe('Content without tags');
            expect(response.body.tags).toEqual([]);
        });

        it('should sanitize HTML from title and content', async () => {
            const noteData = {
                title: '<script>alert("xss")</script>Test Title',
                content: '<p>Test content with <strong>HTML</strong></p>',
                tags: ['test'],
            };

            const response = await request(app)
                .post('/api/notes')
                .send(noteData)
                .expect(201);

            expect(response.body.title).toBe('Test Title');
            expect(response.body.content).toBe('Test content with HTML');
        });

        it('should filter profanity from content', async () => {
            const noteData = {
                title: 'Test Note',
                content: 'This is a damn word test',
                tags: ['test'],
            };

            const response = await request(app)
                .post('/api/notes')
                .send(noteData)
                .expect(201);

            // The bad-words library should filter "damn"
            expect(response.body.content).toBe('This is a **** word test');
        });

        it('should sanitize tags array', async () => {
            const noteData = {
                title: 'Test Note',
                content: 'Test content',
                tags: [
                    '<script>alert("xss")</script>test',
                    'normal',
                    '<p>html</p>',
                ],
            };

            const response = await request(app)
                .post('/api/notes')
                .send(noteData)
                .expect(201);

            expect(response.body.tags).toEqual(['test', 'normal', 'html']);
        });

        it('should filter out empty tags', async () => {
            const noteData = {
                title: 'Test Note',
                content: 'Test content',
                tags: ['valid', '', '   ', 'also-valid'],
            };

            const response = await request(app)
                .post('/api/notes')
                .send(noteData)
                .expect(201);

            // The filter(Boolean) should remove empty strings but keep whitespace-only strings
            expect(response.body.tags).toEqual(['valid', '   ', 'also-valid']);
        });
    });

    describe('PUT /api/notes/:id', () => {
        it('should update an existing note', async () => {
            const note = new Note({
                title: 'Original Title',
                content: 'Original content',
                tags: ['original'],
            });
            const savedNote = await note.save();

            const updateData = {
                title: 'Updated Title',
                content: 'Updated content',
                tags: ['updated'],
            };

            const response = await request(app)
                .put(`/api/notes/${savedNote._id}`)
                .send(updateData)
                .expect(200);

            expect(response.body.title).toBe('Updated Title');
            expect(response.body.content).toBe('Updated content');
            expect(response.body.tags).toEqual(['updated']);
            expect(response.body._id).toBe(savedNote._id.toString());
        });

        it('should update only provided fields', async () => {
            const note = new Note({
                title: 'Original Title',
                content: 'Original content',
                tags: ['original'],
            });
            const savedNote = await note.save();

            const updateData = {
                title: 'Updated Title',
            };

            const response = await request(app)
                .put(`/api/notes/${savedNote._id}`)
                .send(updateData)
                .expect(200);

            expect(response.body.title).toBe('Updated Title');
            expect(response.body.content).toBe('Original content');
            expect(response.body.tags).toEqual(['original']);
        });

        it('should return 404 for non-existent note', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const updateData = {
                title: 'Updated Title',
            };

            await request(app)
                .put(`/api/notes/${fakeId}`)
                .send(updateData)
                .expect(404);
        });

        it('should sanitize HTML from updated fields', async () => {
            const note = new Note({
                title: 'Original Title',
                content: 'Original content',
                tags: ['original'],
            });
            const savedNote = await note.save();

            const updateData = {
                title: '<script>alert("xss")</script>Updated Title',
                content: '<p>Updated content with <strong>HTML</strong></p>',
            };

            const response = await request(app)
                .put(`/api/notes/${savedNote._id}`)
                .send(updateData)
                .expect(200);

            expect(response.body.title).toBe('Updated Title');
            expect(response.body.content).toBe('Updated content with HTML');
        });
    });

    describe('DELETE /api/notes/:id', () => {
        it('should delete an existing note', async () => {
            const note = new Note({
                title: 'Note to delete',
                content: 'Content to delete',
                tags: ['delete'],
            });
            const savedNote = await note.save();

            const response = await request(app)
                .delete(`/api/notes/${savedNote._id}`)
                .expect(200);

            expect(response.body.message).toBe('Note deleted successfully');

            // Verify note is actually deleted
            const deletedNote = await Note.findById(savedNote._id);
            expect(deletedNote).toBeNull();
        });

        it('should return 404 for non-existent note', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            await request(app).delete(`/api/notes/${fakeId}`).expect(404);
        });
    });
});
