# Twin-AI Architecture

## Overview
The Twin-AI system is built with a modern, scalable architecture designed for high performance and advanced computational fundamentals.

## Components
- **Web**: React-based frontend with Vite, TypeScript, and Tailwind CSS.
- **Mobile**: React Native/Expo app with offline-first SQLite database.
- **Shared**: Core algorithms including Time-Aware, Resource-Aware, and Uncertainty-Quantification principles.
- **Supabase**: Backend-as-a-Service for authentication, real-time database, and edge functions.

## Data Flow
1. User interacts with Web or Mobile apps.
2. Apps communicate with Supabase for data persistence.
3. Advanced algorithms in `shared/` process data for patterns, resource optimization, and time-sensitive tasks.
4. Mobile app syncs with Supabase when online, using the offline SQLite buffer.
