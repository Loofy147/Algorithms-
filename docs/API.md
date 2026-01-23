# API Reference

## Authentication Service
- `signUp(data)`: Creates a new user.
- `signIn(email, password, csrfToken)`: Authenticates a user.
- `signOut()`: Logs out the current user.

## Database Service
- `getProfile(id)`: Fetches user profile with caching.
- `getQuestions(options)`: Fetches optimized questions.
- `submitResponse(response)`: Submits user answers with optimistic updates.
- `getPatterns(id)`: Returns uncertainty-aware behavioral patterns.
- `batchInsert(table, records)`: Resource-aware batch database insertion.

## Resource Scheduler (Jail-Info API)
- `POST /api/v1/schedule`: Optimizes a list of tasks based on provided budgets.
