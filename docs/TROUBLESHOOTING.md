# Troubleshooting Guide

## Database Connection Issues
- **Error**: `Missing Supabase credentials`
- **Fix**: Ensure `web/.env` is correctly populated with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Scheduler Failures
- **Error**: `InfeasibleScheduleError`
- **Fix**: The task exceeds the defined resource budget. Increase the budget or optimize the task's complexity.

## Build Errors
- **Error**: `Module not found`
- **Fix**: Run `pnpm install` at the root directory to ensure all workspace dependencies are resolved.

## Sync Issues
- **Problem**: Mobile app not syncing with backend.
- **Fix**: Check internet connectivity and verify WAL mode is enabled in the mobile DB settings.
