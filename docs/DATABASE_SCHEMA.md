# Database Schema

## Supabase (PostgreSQL)

### `profile`
- `id`: uuid (primary key)
- `created_at`: timestamp
- `metadata`: jsonb

### `questions`
- `id`: bigint (primary key)
- `text`: text
- `difficulty_level`: integer
- `active`: boolean

### `responses`
- `id`: bigint (primary key)
- `profile_id`: uuid (foreign key)
- `question_id`: bigint (foreign key)
- `answer`: text
- `created_at`: timestamp

### `patterns`
- `id`: bigint (primary key)
- `profile_id`: uuid (foreign key)
- `action`: text
- `confidence`: float
