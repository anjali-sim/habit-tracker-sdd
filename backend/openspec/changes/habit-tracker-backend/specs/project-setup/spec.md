## ADDED Requirements

### Requirement: Project is initialized as a Node.js TypeScript application
The system SHALL be set up as a Node.js project using TypeScript, with `ts-node-dev` for development hot-reloading and a `tsconfig.json` configured for strict mode targeting Node.js.

#### Scenario: Development server starts
- **WHEN** developer runs `npm run dev`
- **THEN** the server starts on the configured PORT with hot-reload enabled

#### Scenario: Production build compiles
- **WHEN** developer runs `npm run build`
- **THEN** TypeScript compiles to the `dist/` directory without errors

### Requirement: Environment variables are loaded from .env
The system SHALL load all runtime configuration from a `.env` file using `dotenv`. A `.env.example` file SHALL be committed to the repository documenting all required variables. The actual `.env` file SHALL be excluded from version control.

#### Scenario: Server reads MONGODB_URI from environment
- **WHEN** the application starts
- **THEN** the MongoDB connection uses the value of `MONGODB_URI` from the environment

#### Scenario: .env.example documents all variables
- **WHEN** a developer clones the repository
- **THEN** `.env.example` contains all four required keys: `MONGODB_URI`, `PORT`, `NODE_ENV`, `CORS_ORIGIN`

### Requirement: Express app is configured with CORS
The system SHALL configure CORS middleware using the `CORS_ORIGIN` environment variable so that only the specified frontend origin can access the API.

#### Scenario: Requests from allowed origin succeed
- **WHEN** a request arrives from the origin matching `CORS_ORIGIN`
- **THEN** the response includes the correct `Access-Control-Allow-Origin` header

#### Scenario: Server listens on configured PORT
- **WHEN** the server starts
- **THEN** it listens on the port specified by the `PORT` environment variable (default 5000)

### Requirement: Global error handler middleware catches unhandled errors
The system SHALL include an Express error-handling middleware (`errorHandler`) registered after all routes. It SHALL return a JSON response with a `message` field and an appropriate HTTP status code.

#### Scenario: Unhandled error returns JSON
- **WHEN** a route throws an unhandled error
- **THEN** the error handler returns status 500 with `{ "message": "<error message>" }`

#### Scenario: Validation error returns 400
- **WHEN** a Zod validation error is thrown
- **THEN** the error handler returns status 400 with the validation error details

### Requirement: MongoDB connects on startup using Mongoose
The system SHALL establish a MongoDB connection via Mongoose when the server starts, using the `MONGODB_URI` environment variable. The server SHALL NOT begin accepting requests until the database connection is established.

#### Scenario: Successful database connection
- **WHEN** `MONGODB_URI` points to a running MongoDB instance
- **THEN** Mongoose connects and the server starts accepting requests

#### Scenario: Failed database connection halts startup
- **WHEN** `MONGODB_URI` is invalid or MongoDB is unreachable
- **THEN** the process exits with a non-zero code and logs the error
