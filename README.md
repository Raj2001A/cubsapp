# Employee Management System

A comprehensive employee management system for managing employees, documents, and company information.

## Features

- **Employee Management**: Add, edit, delete, and search employees
- **Document Management**: Upload, download, and manage employee documents with Backblaze B2 storage
- **Authentication**: Secure authentication with Firebase and JWT
- **Performance Monitoring**: Track API performance and system health
- **Responsive UI**: Mobile-friendly interface for both admin and employee views
- **Data Import/Export**: Import and export employee data from Excel files
- **Dashboard & Analytics**: Visualize employee data and document statistics

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- React Hook Form for form handling
- React Toastify for notifications

### Backend
- Node.js with Express
- TypeScript for type safety
- PostgreSQL (Neon) for database
- Backblaze B2 for document storage
- Firebase for authentication
- SendGrid for email notifications

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- PostgreSQL database (Neon)
- Backblaze B2 account
- Firebase project
- SendGrid account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/employee-management-system.git
cd employee-management-system
```

2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd employee-management-backend
npm install
```

3. Set up environment variables
   - Create a `.env` file in the root directory
   - Create a `.env` file in the `employee-management-backend` directory
   - Add the required environment variables (see `.env.new` for reference)

4. Set up the database
```bash
cd employee-management-backend
npm run setup-db
```

5. Start the development servers
```bash
# Start both frontend and backend
npm start

# Or start them separately
npm run dev        # Frontend
npm run backend    # Backend
```

## Project Structure

```
├── employee-management-backend/   # Backend code
│   ├── src/                       # Source code
│   │   ├── config/                # Configuration files
│   │   ├── middleware/            # Express middleware
│   │   ├── models/                # Database models
│   │   ├── routes/                # API routes
│   │   ├── scripts/               # Utility scripts
│   │   ├── services/              # Business logic
│   │   ├── tests/                 # Test files
│   │   ├── utils/                 # Utility functions
│   │   └── index.ts               # Entry point
│   ├── .env                       # Environment variables
│   └── package.json               # Dependencies
├── src/                           # Frontend code
│   ├── components/                # React components
│   ├── context/                   # React context providers
│   ├── pages/                     # Page components
│   ├── services/                  # API services
│   ├── styles/                    # CSS styles
│   ├── types/                     # TypeScript type definitions
│   ├── utils/                     # Utility functions
│   └── App.tsx                    # Main app component
├── .env                           # Environment variables
└── package.json                   # Dependencies
```

## API Documentation

See [API-DOCUMENTATION.md](employee-management-backend/API-DOCUMENTATION.md) for detailed API documentation.

## Testing

```bash
# Run all tests
cd employee-management-backend
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

## Performance Monitoring

The application includes built-in performance monitoring:

- **API Metrics**: Track response times, success rates, and request counts
- **System Monitoring**: Monitor CPU, memory, and system health
- **Error Tracking**: Comprehensive error logging and tracking

Access monitoring endpoints:
- `/api/monitoring/health`: Basic health check
- `/api/monitoring/metrics`: Detailed performance metrics (admin only)
- `/api/monitoring/summary`: Performance summary (admin only)
- `/api/monitoring/system`: System information (admin only)

## Security Features

- JWT authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- Secure document storage
- HTTPS support

## License

This project is licensed under the MIT License - see the LICENSE file for details.
