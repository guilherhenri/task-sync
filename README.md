# TaskSync

![TaskSync Cover](/cover.png)

![Node.js](https://img.shields.io/badge/Node.js-22-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![NestJS](https://img.shields.io/badge/NestJS-11-red) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-8-green) ![Redis](https://img.shields.io/badge/Redis-8-red) ![Docker](https://img.shields.io/badge/Docker-✓-blue) ![Coverage](https://img.shields.io/badge/coverage-80.7%25-brightgreen) ![Figma](https://img.shields.io/badge/Figma-✓-orange)
![Storybook](https://img.shields.io/badge/Storybook-9.1-pink)
![Design System](https://img.shields.io/badge/Design%20System-✓-purple)
![Grafana](https://img.shields.io/badge/Grafana-12-orange)
![Prometheus](https://img.shields.io/badge/Prometheus-✓-red)
![Observability](https://img.shields.io/badge/Observability-✓-blue)
![Monitoring](https://img.shields.io/badge/Monitoring-✓-green)

A collaborative real-time task management platform designed for efficient team coordination. TaskSync provides comprehensive project and task management capabilities with instant updates, intelligent notifications, and a robust role-based access system.

## 🚀 Features

### Authentication & User Management

- ✅ User registration and email verification
- ✅ JWT-based authentication (access + refresh tokens)
- ✅ Password recovery and reset
- ✅ Profile management with avatar upload
- ✅ Session management and token revocation

### Design System

- ✅ Comprehensive component library with Storybook
- ✅ Design tokens for consistent theming
- ✅ Responsive components with accessibility support
- ✅ Visual regression testing

### Planned Features (Coming Soon)

- 🔄 Real-time collaborative project management
- 🔄 Task assignment and tracking
- 🔄 WebSocket-based live updates
- 🔄 Advanced notification system
- 🔄 Role-based access control
- 🔄 File attachments and comments

## 🏗️ Architecture

TaskSync follows a **Clean Architecture** pattern with Domain-Driven Design principles:

```
┌─────────────────────────────────────────┐
│            Presentation Layer           │
│  Controllers • WebSocket • Middlewares  │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│           Application Layer             │
│    Use Cases • Services • DTOs          │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│             Domain Layer                │
│   Entities • Interfaces • Events        │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│         Infrastructure Layer            │
│ Repositories • Database • External APIs │
└─────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js with TypeScript 5.8
- **Framework**: NestJS 11 with modular architecture
- **Database**: PostgreSQL 17 with TypeORM, MongoDB 8 for analytics, Redis 8 for caching
- **Authentication**: JWT with refresh token rotation
- **Documentation**: Swagger/OpenAPI integration
- **Testing**: Jest (unit, integration, e2e)

### Frontend (Planned)

- **Framework**: React 19 with TypeScript
- **Communication**: Oval for end-to-end type safety
- **Styling**: SCSS with 7-1 architecture
- **Real-time**: Socket.io client

### Infrastructure

- **Containerization**: Docker with multi-stage builds
- **Cloud**: Render + Supabase
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Monitoring**: Prometheus + Grafana

## 🎨 Design System & Figma

TaskSync features a comprehensive design system built with modern accessibility standards and visual consistency in mind:

- **Color System**: Carefully crafted contrast ratios meeting WCAG guidelines
- **Typography**: Inter font family with optimized sizing scales
- **Components**: Reusable UI elements with multiple variants
- **Responsive Grids**: Mobile-first approach with tablet and desktop breakpoints
- **Motion Design**: Subtle animations enhancing user experience

The complete design system is available in Figma and implemented in Storybook:

- **Figma Project**: [TaskSync Design System](https://www.figma.com/design/V9WGY62qCWciEcJzWky9XW/TaskSync?node-id=256-84&t=2FnDbcN2Bj2cHQU9-1)
- **Live Storybook**: [TaskSync Components](https://tasksync-storybook.vercel.app)

## 🚦 Getting Started

### Prerequisites

- pnpm
- Docker and Docker Compose
- PostgreSQL, MongoDB, and Redis (via Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/guilherhenri/task-sync.git
   cd task-sync
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit the .env file with your configuration
   ```

4. **Start infrastructure services**
   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

The API will be available at `http://localhost:3333` with Swagger documentation at `/api/docs`.

### Available Scripts

```bash
# Development
pnpm dev                    # Start all services in development mode

# Testing
pnpm test                     # Run unit tests
pnpm test:cov                 # Run unit tests with coverage report
pnpm test:e2e                 # Run end-to-end tests
pnpm test:e2e:cov             # Run end-to-end tests with coverage report

# Database
pnpm migration:generate --filter=@task-sync/api  # Generate new migration
pnpm migration:run --filter=@task-sync/api       # Run migrations
pnpm seed:run --filter=@task-sync/api            # Seed database

# Build
pnpm build                                    # Build all packages
pnpm build --filter=@task-sync/api            # Build API only
pnpm build --filter=@task-sync/storybook      # Build Storybook

# Linting & Formatting
pnpm lint                 # Fix linting issues
pnpm format               # Format code with Prettier
```

## 📁 Project Structure

```
task-sync/
├── apps/
│   └── api/                      # Main API application
│       ├── src/
│       │   ├── core/             # Core framework utilities
│       │   ├── domain/           # Domain logic (Auth, Email)
│       │   │   ├── auth/         # Authentication domain
│       │   │   └── email/        # Email domain
│       │   └── infra/            # Infrastructure implementations
│       └── test/                 # Test utilities and factories
├── packages/
│   ├── api-types/                # Shared API type definitions
│   ├── design-tokens/            # Design system tokens
│   ├── email-templates/          # React Email templates
│   ├── icons/                    # Icon component library
│   ├── storybook/                # Component documentation
│   └── ui-components/            # Reusable UI components
├── config/                       # Shared configuration
└── docker/                       # Docker and monitoring setup
```

## 🧪 Testing Strategy

TaskSync maintains high code quality with comprehensive testing:

- **Unit Tests**: >80% coverage requirement using Jest
  - **Lines**: 80.7%
  - **Functions**: 72.98%
  - **Branches**: 68.56%
  - **Statements**: 81.15%
- **Integration Tests**: API endpoint testing with Supertest
- **E2E Tests**: Critical user flow testing
  - **Lines**: 83.22%
  - **Functions**: 79.68%
  - **Branches**: 63.44%
  - **Statements**: 83.3%
- **Visual Testing**: Storybook visual regression tests with Playwright

## 📊 Observability & Logging

The project includes a complete observability stack with structured logging and monitoring:

### Monitoring Stack

- **Metrics**: Prometheus for application and infrastructure metrics
- **Dashboards**: Grafana with pre-configured dashboards
- **Distributed Tracing**: Performance monitoring across services
- **Health Checks**: Application health monitoring

### Logging System

- **Structured Logging**: Winston with JSON formatting
- **Log Aggregation**: Vector + Elasticsearch + Kibana stack
- **Multiple Transports**: Console, file, and external logging support

### Setup

1. **Configure environment variables** (required for external logging):

   ```bash
   LOG_LEVEL=error
   LOG_ENABLE_CONSOLE=true
   LOG_ENABLE_FILE=false
   LOG_ENABLE_EXTERNAL=true
   VECTOR_ENDPOINT=http://vector:8080/logs
   ```

2. **Start the observability stack**:

   ```bash
   docker compose -f docker/docker-compose.observability.yml up -d
   ```

3. **Start the monitoring stack**:

   ```bash
   docker compose -f docker/docker-compose.monitoring.yml up -d
   ```

4. **Access monitoring tools**:
   - **Grafana**: `http://localhost:3001` (admin/admin123)
   - **Kibana**: `http://localhost:5601`
   - **Elasticsearch**: `http://localhost:9200`

## 🔒 Security Features

- JWT-based authentication with refresh token rotation
- Password hashing with bcrypt (8 salt rounds)
- Input validation and sanitization with Zod
- Rate limiting and CORS protection
- Secure headers with Helmet.js
- File upload validation and restrictions

## 📈 API Documentation

The API is fully documented with Swagger/OpenAPI:

- **Local**: `http://localhost:3333/api/docs`
- **Production**: `https://tasksync-api-i5r7.onrender.com`

### Current Endpoints

**Authentication**

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - Session termination
- `POST /api/v1/auth/forgot-password` - Password recovery
- `POST /api/v1/auth/reset-password` - Password reset

**Profile Management**

- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update user profile
- `POST /api/v1/profile/avatar` - Upload profile avatar
- `GET /api/v1/profile/avatar` - Get avatar URL

**Utilities**

- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Application metrics

## 🚀 Deployment

### Docker Deployment

1. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit the .env file with your configuration
   ```

2. **Build the image**

   ```bash
   docker build -f apps/api/Dockerfile -t task-sync-api .
   ```

3. **Run with Docker Compose**
   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

### Production Deployment

The project is configured for production deployment with:

- **Render**: API hosting with auto-deployment and databases
- **Supabase**: File storage
- **Vercel**: Storybook hosting
- **GitHub Actions**: Automated CI/CD pipeline

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) framework
- UI components inspired by modern design systems
- Clean Architecture principles by Robert C. Martin
- Domain-Driven Design by Eric Evans

---

**Status**: 🚧 In Development - Authentication and Design System Complete

**Next Milestone**: Project and Task Management Implementation
