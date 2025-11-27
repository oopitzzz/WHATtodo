# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WHATtodo** is an authentication-based todo management application with a Node.js/Express backend and PostgreSQL database.

- **Purpose**: Task management with user authentication, trash/restoration, and calendar integration
- **Technology Stack**:
  - Backend: Node.js + Express 5.x
  - Database: PostgreSQL (Supabase)
  - Authentication: JWT + bcrypt
  - Testing: Jest + Supertest
  - Frontend: OpenAPI mock server (currently in development)

## Architecture Overview

### Backend Structure

```
backend/
├── index.js                 # Express app entry point
├── _lib/                    # Shared utilities and middleware
│   ├── db.js               # PostgreSQL connection pool
│   ├── middleware/         # Express middleware (auth, CORS, logging, error handling)
│   ├── repositories/       # Data access layer (userRepository, todoRepository, etc.)
│   ├── services/           # Business logic layer (authService, todoService, etc.)
│   └── utils/              # Utilities (bcrypt, JWT, scheduler)
├── auth/                    # Authentication endpoints (signup, login, logout, refresh)
├── todos/                   # Todo CRUD routes and logic
├── trash/                   # Trash/restoration routes
├── users/                   # User profile routes
├── calendar/                # Calendar-related routes
└── node_modules/
```

### Key Architecture Patterns

1. **Three-Layer Architecture**:
   - **Routes** (in `auth/`, `todos/`, etc.): HTTP request/response handling
   - **Services** (in `_lib/services/`): Business logic and validation
   - **Repositories** (in `_lib/repositories/`): Database access (one repository per domain)

2. **Middleware Pipeline**:
   - CORS middleware applied globally
   - JSON body parsing
   - Logger middleware for request tracking
   - Auth middleware on protected routes
   - Error handler middleware at the end

3. **Database Access**:
   - All database queries go through repositories
   - Repositories use PostgreSQL connection pool in `_lib/db.js`
   - Services call repositories; routes call services

4. **Error Handling**:
   - All route handlers wrap async code in try/catch
   - Errors are passed to `next()` for centralized error handling
   - Error handler middleware logs and responds with appropriate HTTP status codes

### Testing Architecture

- Unit tests: Service layer and utility functions (`*.test.js` files)
- Integration tests: Complete request/response flows (`integration.test.js`)
- Tests use **Jest** with **Supertest** for HTTP testing
- Repositories can be mocked via `__setRepository()` helper pattern (see `todoService.test.js`)

## Development Commands

### Backend

```bash
cd backend

# Development (with auto-reload)
npm run dev

# Production
npm start

# Run all tests
npm test

# Run specific test file
npm test -- todos.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should create"
```

### Frontend

```bash
cd frontend

# Development (OpenAPI mock server)
npm run dev

# Production
npm start
```

## Key Implementation Patterns

### Creating a New Service

1. Create `_lib/services/featureService.js` with business logic
2. Use dependency injection pattern: export a function that accepts repository instances
3. Add unit tests in `featureService.test.js`
4. Create corresponding repository in `_lib/repositories/`

Example (from `todoService.js`):
```javascript
let todoRepository = require('../repositories/todoRepository');

function setRepository(repo) {
  todoRepository = repo;
}

async function createTodo(userId, { title, dueDate }) {
  // validation
  // call repository
  // return result
}

module.exports = {
  createTodo,
  getTodos,
  __setRepository: setRepository
};
```

### Creating a New Route

1. Create a route builder function that accepts dependency injections
2. Use the default exports from services/middleware
3. Export both the builder and default router

Example (from `todos/index.js`):
```javascript
function buildTodoRouter({ authMiddleware = defaultAuthMiddleware, todoService = defaultTodoService } = {}) {
  const router = express.Router();
  router.use(authMiddleware);

  router.get('/', async (req, res, next) => {
    try {
      const todos = await todoService.getTodos(req.user.userId, filters);
      res.json({ data: todos });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = buildTodoRouter;
module.exports.default = buildTodoRouter();
```

### Database Connection

All database operations go through the pool in `_lib/db.js`:
```javascript
const { pool } = require('../_lib/db');
const result = await pool.query('SELECT * FROM todos WHERE user_id = $1', [userId]);
```

## Testing Guidelines

- Use **Jest** for all tests
- Mock external dependencies (repositories, services)
- Use Supertest for HTTP endpoint testing
- Test error cases and validation logic
- Test names should be descriptive: "should create todo with valid title"

Example test structure:
```javascript
describe('todoService.createTodo', () => {
  it('should create todo with valid title', async () => {
    const mockRepo = { create: jest.fn().mockResolvedValue({ id: 1 }) };
    todoService.__setRepository(mockRepo);
    const result = await todoService.createTodo(1, { title: 'Test' });
    expect(result.id).toBe(1);
  });
});
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Todos
- `GET /api/todos` - List user's todos (with filtering/pagination)
- `POST /api/todos` - Create new todo
- `GET /api/todos/:id` - Get specific todo
- `PUT /api/todos/:id` - Update todo
- `PATCH /api/todos/:id/complete` - Mark as complete
- `PATCH /api/todos/:id/restore` - Restore deleted todo
- `DELETE /api/todos/:id` - Delete todo

### Other
- `GET /api/trash` - View deleted todos
- `GET /api/users` - Get user profile
- `GET /api/calendar` - Calendar operations
- `GET /api/docs` - Swagger API documentation

## Important Files and Their Roles

| File | Purpose |
|------|---------|
| `backend/_lib/db.js` | PostgreSQL connection pool configuration |
| `backend/_lib/middleware/auth.js` | JWT verification middleware |
| `backend/_lib/services/authService.js` | User signup/login logic |
| `backend/_lib/services/todoService.js` | Todo CRUD business logic |
| `backend/_lib/repositories/todoRepository.js` | Todo database queries |
| `backend/index.js` | Express app setup and route mounting |

## Environment Setup

Required environment variables in `.env`:
- `POSTGRES_CONNECTION_STRING` - PostgreSQL connection URI
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT signing
- `NODE_ENV` - Development or production

The `.env` file is gitignored and should not be committed.

## Recent Implementation (BE-12, BE-13, BE-14, BE-15)

- **BE-12**: Todo API endpoints with full CRUD, complete/restore/delete operations
- **BE-13**: Trash API for managing deleted todos
- **BE-14**: User profile endpoints
- **BE-15**: Calendar integration with public holidays API

See `docs/execution_plan.md` for detailed progress and remaining tasks.

## Notes for Future Development

1. All new code should follow the three-layer pattern (route → service → repository)
2. Use dependency injection for testability
3. Wrap async route handlers in try/catch and pass errors to next()
4. Add tests for any new service or significant route logic
5. Validate inputs at the route level or service level consistently
6. Document any new API endpoints in Swagger spec (`swagger-ko.json`)
