# TaskSync

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
│            Presentation Layer            │
│  Controllers • WebSocket • Middlewares  │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│           Application Layer              │
│    Use Cases • Services • DTOs          │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│             Domain Layer                 │
│   Entities • Interfaces • Events        │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│         Infrastructure Layer             │
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

## 📊 Monitoring & Observability

The project includes a complete observability stack:

- **Metrics**: Prometheus for application and infrastructure metrics
- **Dashboards**: Grafana with pre-configured dashboards
- **Logging**: Structured logging with Winston
- **Distributed Tracing**: Performance monitoring across services
- **Health Checks**: Application health monitoring

Start the monitoring stack:

```bash
docker compose -f docker/docker-compose.monitoring.yml up -d
```

Access Grafana at `http://localhost:3001` (admin/admin123).

## 🎨 Design System

TaskSync includes a comprehensive design system built with Storybook:

- **Components**: Reusable UI components with TypeScript
- **Design Tokens**: Consistent spacing, colors, typography
- **Documentation**: Interactive component documentation
- **Testing**: Visual regression testing

View the live Storybook: [TaskSync Design System](https://tasksync-storybook.vercel.app)

## 🔒 Security Features

- JWT-based authentication with refresh token rotation
- Password hashing with bcrypt (8 salt rounds)
- Input validation and sanitization with Zod
- Rate limiting and CORS protection
- Secure headers with Helmet.js
- File upload validation and restrictions

## 📈 API Documentation

The API is fully documented with Swagger/OpenAPI:

- **Local**: `http://localhost:3000/api/docs`
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

1. **Build the image**

   ```bash
   docker build -f apps/api/Dockerfile -t task-sync-api .
   ```

2. **Run with Docker Compose**
   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

### AWS Deployment

The project is configured for AWS deployment with:

- **EC2**: Auto Scaling Groups for the API
- **RDS**: PostgreSQL for primary data
- **DocumentDB**: MongoDB for analytics
- **ElastiCache**: Redis for caching
- **S3**: File storage
- **CloudFront**: CDN for static assets

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Extended from @typescript-eslint/recommended
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks for quality checks
- **Conventional Commits**: Semantic commit messages

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
