# Project Structure Templates

Complete examples of folder structures and README templates for AI navigation.

## Example 1: React/TypeScript Frontend Project

### Full Directory Structure

```
my-app/
├── README.md (root architecture doc)
├── src/
│   ├── components/
│   │   ├── README.md
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Form/
│   │       ├── README.md
│   │       ├── FormInput.tsx
│   │       └── FormSelect.tsx
│   ├── hooks/
│   │   ├── README.md
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts
│   │   └── useLocalStorage.ts
│   ├── api/
│   │   ├── README.md
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   └── users.ts
│   ├── pages/
│   │   ├── README.md
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   └── utils/
│       ├── README.md
│       ├── format.ts
│       └── validation.ts
```

### Root README.md Template

```markdown
# My App

## AI Navigation Convention

This project uses folder-level indexing:

- Each major folder has README.md describing its role and file list
- Source files include: `// 📁 Folder structure changed, update ./README.md`
- When adding/removing/renaming files, update the folder's README.md

## Tech Stack

- React 18.2 + TypeScript 5.0
- Build: Vite 5.0
- State: Zustand 4.4
- Styling: Tailwind CSS 3.3
- API: Axios 1.6

## Architecture

- `/src/components` - Reusable UI components
- `/src/hooks` - Custom React hooks
- `/src/api` - API request layer (all backend calls)
- `/src/pages` - Top-level page components
- `/src/utils` - Pure utility functions

## Key Design Decisions

- All API requests go through `/api/client.ts` for unified error handling
- Global state via Zustand, local state via useState
- Component styles use Tailwind utilities, complex styles use CSS modules
- File naming: PascalCase for components, camelCase for utilities
```

### Folder README Templates

**components/README.md:**

```markdown
## Components

Reusable UI components library.

**Base Components:**

- Button.tsx - Primary button, supports variants (primary/secondary/danger)
- Input.tsx - Text input with validation error display
- Modal.tsx - Overlay modal component using React Portal

**Form Components:**

- Form/ - Form-related components (inputs, selects, validation)

**Conventions:**

- All components accept className for style extension
- Use forwardRef for input components
```

**hooks/README.md:**

```markdown
## Hooks

Custom React hooks for shared logic.

- useAuth.ts - Authentication state (user, login, logout methods)
- useFetch.ts - Data fetching with loading/error/data states
- useLocalStorage.ts - Reactive wrapper for localStorage
- useDebounce.ts - Debounced value with configurable delay
```

**api/README.md:**

```markdown
## API

Backend communication layer.

**Core:**

- client.ts - Axios instance with base config and interceptors
- types.ts - TypeScript types for all API responses

**Endpoints:**

- auth.ts - Authentication endpoints (login, register, logout)
- users.ts - User CRUD operations
- posts.ts - Post management endpoints

**Convention:** All requests must use client.ts. Never create standalone axios instances.
```

**pages/README.md:**

```markdown
## Pages

Top-level route components.

- Home.tsx - Landing page (/)
- Login.tsx - Login page (/login)
- Dashboard.tsx - User dashboard (/dashboard)
- Profile.tsx - User profile page (/profile)

**Convention:** Pages compose components, shouldn't contain business logic.
```

**utils/README.md:**

```markdown
## Utils

Pure utility functions.

- format.ts - Data formatting (dates, numbers, currency)
- validation.ts - Input validation helpers
- helpers.ts - Miscellaneous utility functions

**Convention:** All functions must be pure (no side effects).
```

## Example 2: Node.js Backend API

### Full Directory Structure

```
api-server/
├── README.md
├── src/
│   ├── routes/
│   │   ├── README.md
│   │   ├── auth.routes.ts
│   │   └── user.routes.ts
│   ├── controllers/
│   │   ├── README.md
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── services/
│   │   ├── README.md
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   ├── models/
│   │   ├── README.md
│   │   ├── User.model.ts
│   │   └── Session.model.ts
│   ├── middleware/
│   │   ├── README.md
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   └── utils/
│       ├── README.md
│       ├── db.ts
│       └── logger.ts
```

### Root README.md

```markdown
# API Server

## AI Navigation Convention

[Same as frontend example]

## Tech Stack

- Node.js 20 + TypeScript 5.0
- Framework: Express 4.18
- Database: PostgreSQL 15 with Prisma ORM
- Auth: JWT with bcrypt

## Architecture (MVC Pattern)

- `/src/routes` - Express route definitions
- `/src/controllers` - Request handlers (thin layer)
- `/src/services` - Business logic
- `/src/models` - Database models (Prisma schema)
- `/src/middleware` - Express middleware
- `/src/utils` - Shared utilities

## Key Design Decisions

- Controllers only handle HTTP, services handle business logic
- All database access through Prisma ORM
- JWT tokens for authentication, stored in httpOnly cookies
- Validation via middleware before reaching controllers
```

### Folder README Templates

**routes/README.md:**

```markdown
## Routes

Express route definitions.

- auth.routes.ts - Authentication routes (/auth/\*)
- user.routes.ts - User management routes (/users/\*)
- post.routes.ts - Post endpoints (/posts/\*)

**Convention:** Routes only define paths and middleware, delegate to controllers.
```

**controllers/README.md:**

```markdown
## Controllers

HTTP request handlers (thin layer).

- auth.controller.ts - Handles auth requests, calls auth service
- user.controller.ts - Handles user CRUD, calls user service

**Convention:** Extract req data, call service, return response. No business logic here.
```

**services/README.md:**

```markdown
## Services

Business logic layer.

- auth.service.ts - Authentication logic (login, register, token generation)
- user.service.ts - User business logic (CRUD, validation)

**Convention:** Services contain all business logic, interact with database models.
```

**models/README.md:**

```markdown
## Models

Prisma database models and schemas.

- User.model.ts - User schema and helper methods
- Session.model.ts - Session tracking

**Convention:** Models defined in schema.prisma, this folder has helper methods.
```

**middleware/README.md:**

```markdown
## Middleware

Express middleware functions.

- auth.middleware.ts - JWT verification, attach user to request
- validation.middleware.ts - Request body validation with Zod
- error.middleware.ts - Global error handler

**Convention:** Middleware should be composable and reusable.
```

## File Header Template

Add to the top of each source file:

**TypeScript/JavaScript:**

```typescript
// 📁 Folder structure changed, update ./README.md
```

**Python:**

```python
# 📁 Folder structure changed, update ./README.md
```

**CSS/SCSS:**

```css
/* 📁 Folder structure changed, update ./README.md */
```

## Workflow Example: Adding New Feature

**User asks:** "Add a comment system for posts"

**AI should:**

1. **Check architecture:**
   - Read root README.md
   - Read relevant folder READMEs (api/, models/, etc.)

2. **Create files:**
   - `/src/api/comments.ts`
   - `/src/models/Comment.model.ts`
   - Add routes to existing files if appropriate

3. **Update indices:**
   - Update `/src/api/README.md` to include `comments.ts`
   - Update `/src/models/README.md` to include `Comment.model.ts`

4. **Add file headers:**
   - Include `// 📁 Folder structure changed, update ./README.md` at top of new files

## Tips for Success

1. **Start simple:** Don't create READMEs for all folders day one. Add as project grows.

2. **Update immediately:** When AI creates a file, have it update README in same interaction.

3. **Review weekly:** Check that READMEs match actual file structure.

4. **Be consistent:** Use same format across all folders.

5. **Train the AI:** First few times, explicitly say "and update the README". AI will learn.

6. **Don't overthink:** READMEs are navigation aids, not comprehensive docs.
