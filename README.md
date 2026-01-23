# Twin-AI Enhanced - Your Personal Digital Twin

## 🚀 Overview
Twin-AI Enhanced is a production-ready system for building personal digital twins. It leverages advanced computational principles to provide a high-performance, secure, and resource-aware experience.

## ✨ Key Enhancements
- **Monorepo Architecture**: Clean separation of `web`, `mobile`, `shared` logic, and `supabase` backend.
- **Production-Ready Services**:
    - **Auth**: CSRF protection, session management, and rate limiting.
    - **Database**: Multi-level caching, connection pooling, and circuit breakers.
    - **Mobile**: Offline-first SQLite with WAL mode and sync capabilities.
- **Computational Fundamentals**:
    - **Time-Aware**: Anytime algorithms for progressive refinement.
    - **Resource-Aware**: Multi-objective scheduler for optimizing CPU, energy, and memory.
    - **Uncertainty-Quantification**: Wilson Score confidence intervals for behavioral patterns.
    - **Adversarial-First**: Constant-time cryptographic hash maps and differential privacy.

## 📦 Project Structure
```
twin-ai-enhanced/
├── web/          # React + Vite + TypeScript frontend
├── mobile/       # React Native + Expo mobile app
├── shared/       # Shared business logic and RL systems
│   └── algorithms/ # Advanced computational principles
├── supabase/     # Backend migrations and functions
├── tests/        # Comprehensive unit, integration, and performance tests
└── docs/         # Detailed architecture and API documentation
```

## 🛠️ Getting Started
1. **Install Dependencies**: `pnpm install`
2. **Setup Environment**: Copy `web/.env.example` to `web/.env` and fill in Supabase credentials.
3. **Initialize Database**: `npm run db:init`
4. **Run Development**:
    - Web: `npm run dev`
    - Test: `npm test`

## 📚 Documentation
See the `docs/` folder for:
- `ARCHITECTURE.md`: System design and data flow.
- `ALGORITHMS.md`: Core computational principles.
- `API.md`: Service and API references.
- `SETUP.md`: Step-by-step assembly and deployment.

## 📜 License
ISC License
