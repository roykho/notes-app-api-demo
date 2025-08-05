# Notes API Demo

A robust RESTful API for managing notes with advanced security features, rate limiting, and automated database management. Built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Full CRUD Operations** - Create, Read, Update, Delete notes
- **Advanced Security** - XSS protection, content sanitization, and profanity filtering
- **Rate Limiting** - Multi-tier rate limiting for different operations
- **Tag-based Organization** - Flexible tagging system for note categorization
- **Automated Database Management** - Daily database reset with sample data via Vercel cron jobs
- **Comprehensive Testing** - Full test coverage with Vitest and Supertest
- **Production Ready** - Optimized for deployment on Vercel with serverless functions

## 🛠️ Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js 5** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **ES Modules** - Modern JavaScript module system

### Security & Validation
- **sanitize-html** - HTML sanitization to prevent XSS attacks
- **bad-words** - Profanity filtering for content moderation
- **express-rate-limit** - Rate limiting middleware
- **CORS** - Cross-Origin Resource Sharing support

### Testing & Development
- **Vitest** - Fast unit testing framework
- **Supertest** - HTTP assertion testing
- **mongodb-memory-server** - In-memory MongoDB for testing
- **Node.js Watch Mode** - Auto-restart on file changes

### Deployment & Infrastructure
- **Vercel** - Serverless deployment platform
- **Vercel Cron Jobs** - Automated database management
- **Environment Variables** - Secure configuration management

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** database (local or cloud instance like MongoDB Atlas)
- **Vercel CLI** (optional, for deployment)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/notes-db
PORT=8000
```

**For MongoDB Atlas:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/notes-db?retryWrites=true&w=majority
```

### 3. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:8000`

## 📜 Available Scripts

### Development Scripts

- **`npm run dev`** - Starts the development server with auto-restart
  - Uses Node.js watch mode for automatic restarts
  - Monitors file changes and restarts server
  - Perfect for development workflow

### Testing Scripts

- **`npm run test`** - Runs tests in watch mode
  - Starts Vitest in interactive mode
  - Watches for file changes and re-runs tests
  - Provides real-time feedback during development

- **`npm run test:run`** - Runs tests once and exits
  - Useful for CI/CD pipelines
  - No watch mode, runs all tests and terminates
  - Returns exit code for build processes

- **`npm run test:coverage`** - Runs tests with coverage report
  - Generates detailed coverage information
  - Shows which lines of code are tested
  - Useful for maintaining code quality

### Database Management Scripts

- **`npm run reset-db`** - Resets the database with sample data
  - Deletes all existing notes
  - Imports sample data from `sample-data/notes-data.json`
  - Useful for development and testing

## 🏗️ Project Structure

```
notes-api/
├── api/                    # API endpoints
│   └── reset-database.js   # Database reset endpoint
├── config/                 # Configuration files
│   └── db.js              # Database connection setup
├── middleware/             # Express middleware
│   └── errorHandler.js     # Global error handling
├── models/                 # Mongoose models
│   └── note.js            # Note schema and model
├── routes/                 # API routes
│   └── noteRoute.js       # Note CRUD operations
├── sample-data/            # Sample data for testing
│   └── notes-data.json    # Sample notes data
├── test/                   # Test files
│   ├── routes/            # Route tests
│   │   └── noteRoute.test.js
│   └── setup.js           # Test environment setup
├── utils/                  # Utility functions
│   └── databaseReset.js   # Database reset logic
├── server.js              # Main application entry point
├── vercel.json            # Vercel deployment configuration
└── test-reset.js          # Database reset utility
```

## 🌐 API Endpoints

### Notes API

- **GET `/api/notes`** - Get all notes
- **GET `/api/notes/:id`** - Get a specific note by ID
- **POST `/api/notes`** - Create a new note
- **PUT `/api/notes/:id`** - Update an existing note
- **DELETE `/api/notes/:id`** - Delete a note

### Database Management

- **POST `/api/reset-database`** - Reset database with sample data

### Request/Response Examples

#### Create Note
```bash
POST /api/notes
Content-Type: application/json

{
  "title": "My First Note",
  "content": "This is the content of my note",
  "tags": ["personal", "important"]
}
```

#### Response
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "My First Note",
  "content": "This is the content of my note",
  "tags": ["personal", "important"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔒 Security Features

### Content Sanitization
- **HTML Stripping**: All HTML tags are removed from input
- **XSS Prevention**: Content is sanitized before storage
- **Profanity Filtering**: Inappropriate content is automatically filtered

### Rate Limiting
- **General Limit**: 100 requests per 15 minutes per IP
- **Create Limit**: 5 note creations per minute per IP
- **Modify Limit**: 5 modifications per minute per IP

### Input Validation
- **Required Fields**: Title and content are mandatory
- **Data Types**: Proper validation for all input fields
- **Array Handling**: Safe processing of tag arrays

## 🧪 Testing

The project includes comprehensive testing setup:

- **Unit Tests**: Route testing with Supertest
- **Integration Tests**: Database integration testing
- **Coverage Reports**: Detailed test coverage analysis

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Test Environment
- **In-Memory MongoDB**: Uses mongodb-memory-server for isolated testing
- **Clean Database**: Each test runs with a fresh database state
- **Mock Data**: Sample data for consistent test results

## 🔧 Configuration

### Environment Variables
- **MONGO_URI**: MongoDB connection string
- **PORT**: Server port (default: 8000)

### Rate Limiting Configuration
- **General**: 100 requests per 15 minutes
- **Create**: 5 requests per minute
- **Modify**: 5 requests per minute

### CORS Configuration
- **Enabled**: Cross-origin requests allowed
- **Flexible**: Configurable for different origins

## 🚀 Deployment

### Vercel Deployment

The API is optimized for Vercel deployment with serverless functions:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variables**:
   - `MONGO_URI`: Your MongoDB connection string

### Cron Job Configuration

The API includes automated database management via Vercel cron jobs:

- **Schedule**: Daily at midnight UTC (`0 0 * * *`)
- **Function**: `/api/reset-database`
- **Purpose**: Maintains fresh sample data

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📊 Database Schema

### Note Model
```javascript
{
  title: String (required, trimmed),
  content: String (required),
  tags: [String] (optional, default: []),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-updated)
}
```

## 🔄 Automated Database Management

### Daily Reset Process
1. **Data Deletion**: All existing notes are removed
2. **Sample Import**: Fresh sample data is imported
3. **Data Validation**: All imported data is validated
4. **Logging**: Process is logged for monitoring

### Manual Reset
```bash
npm run reset-db
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Roy Ho** - Developer and maintainer of this project.
