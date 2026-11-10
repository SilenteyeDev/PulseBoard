# PulseBoard

**A modern full-stack SaaS analytics dashboard built with React, TypeScript, Vite, Tailwind CSS, Express and Supabase.**

PulseBoard is a SaaS analytics dashboard designed to provide a centralized view of business performance, revenue metrics, customer accounts, acquisition sources, workspace activity and security settings.

The application combines a responsive React frontend with an Express API and Supabase-backed data storage.

## Features

- **Analytics Dashboard:** Revenue metrics, growth trends, acquisition sources and business performance indicators.
- **Account Management:** Search and view customer accounts, ARR, subscription plans and seats.
- **Workspace Management:** View workspace users, roles and account statuses.
- **Authentication:** Supabase Auth integration with email/password authentication and persistent sessions.
- **Security Settings:** Workspace security configuration interface for SSO, MFA and session settings.
- **Notifications:** View notifications and manage read status.
- **Responsive Interface:** Dashboard layouts designed for desktop and mobile screens.
- **Backend API:** Express API with request validation, security headers, compression and CORS configuration.
- **Database Integration:** Supabase PostgreSQL database for persistent application data.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 8 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js 22, Express 5 |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Validation | Zod |
| Security | Helmet, CORS |
| Development | ESLint, TSX, Concurrently |
| Deployment | Docker, Node.js |

## Project Structure

```text
PulseBoard/
├── public/                 # Static assets
├── server/
│   ├── database.ts         # Supabase database operations
│   ├── index.ts            # Express API server
│   └── types.ts            # Backend types
├── src/
│   ├── api/                # Frontend API integration
│   ├── assets/             # Images and assets
│   ├── components/
│   │   ├── auth/           # Authentication interface
│   │   ├── overview/       # Dashboard components
│   │   ├── shell/          # Navigation and layout
│   │   └── ui/             # Reusable UI components
│   ├── data/               # Demo and supporting data
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and integrations
│   ├── theme/              # Theme configuration
│   └── App.tsx
├── supabase/
│   └── schema.sql          # Database schema
├── .env.example
├── Dockerfile
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 22
- npm
- A Supabase account and project

### 1. Clone the repository

```bash
git clone https://github.com/SilenteyeDev/PulseBoard.git
cd PulseBoard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file from the example.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Update `.env` with your own Supabase project credentials.

```env
# Frontend configuration
VITE_API_BASE_URL=http://localhost:8787
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key

# Backend configuration
PORT=8787
ALLOWED_ORIGIN=http://localhost:5173
REQUIRE_AUTH=false

# Server-only Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVER_KEY=your-server-only-key
```

**Security:** Never commit `.env` or expose `SUPABASE_SERVER_KEY` to frontend code. The `.env.example` file contains placeholders and can safely be committed.

### 4. Configure Supabase

1. Create a Supabase project.
2. Enable Email/Password authentication.
3. Copy your project URL and publishable/anon key into the environment variables.
4. Configure the appropriate authentication redirect URLs.
5. Open the Supabase SQL Editor.
6. Execute the SQL in `supabase/schema.sql`.
7. Configure your server-side Supabase credentials.

The database schema creates the tables required by the dashboard.

Populate the tables with your own data to display business metrics and workspace information.

### 5. Start the development environment

```bash
npm run dev
```

This starts the frontend and backend concurrently.

| Service | Local URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8787 |
| API Health | http://localhost:8787/api/health |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend and backend |
| `npm run dev:web` | Start Vite development server |
| `npm run dev:api` | Start Express API |
| `npm run build` | Type-check and build frontend |
| `npm run build:api` | Compile backend |
| `npm run build:all` | Build frontend and backend |
| `npm start` | Start compiled production server |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview frontend production build |

Run `npm run build:all` before starting the compiled application with `npm start`.

## API Documentation

The Express server exposes the following endpoints.

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API health check |

### Dashboard and Accounts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Retrieve dashboard metrics and data |
| GET | `/api/accounts?q=` | Search customer accounts |

### Workspace Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Retrieve workspace users |
| PATCH | `/api/users/:id` | Update user role or status |

### Security Settings

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/security` | Retrieve workspace security settings |
| PATCH | `/api/security` | Update workspace security settings |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Retrieve notifications |
| POST | `/api/notifications/:id/read` | Mark a notification as read |
| POST | `/api/notifications/read-all` | Mark all notifications as read |

**Authentication:** The health endpoint is publicly accessible. Other API routes require a valid Supabase bearer token when API authentication is enabled.

Protected requests should include:

```http
Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN
```

## Database Schema

PulseBoard uses Supabase PostgreSQL for dashboard data.

The application reads from the following tables:

| Table | Purpose |
|---|---|
| `dashboard_metrics` | KPI values and performance indicators |
| `revenue_snapshots` | Monthly revenue and churn data |
| `acquisition_sources` | Customer acquisition statistics |
| `accounts` | Customer account information |
| `workspace_users` | Workspace user records |
| `activity_events` | Recent workspace activity |
| `security_settings` | Workspace security configuration |
| `notifications` | Workspace notifications |

Refer to `supabase/schema.sql` for the database schema.

Empty tables may produce empty states rather than populated business metrics.

## Production Build

Build the frontend and backend:

```bash
npm run build:all
```

The build generates:

- `dist/` – Frontend production assets.
- `dist-server/` – Compiled Express backend.

Start the compiled application:

```bash
npm start
```

The production Express server serves the frontend and API on port `8787`.

Configure production environment variables before starting the application. The server requires Supabase configuration and enables API authentication in production.

## Docker Deployment

PulseBoard includes a multi-stage Dockerfile.

Build the image:

```bash
docker build -t pulseboard .
```

Run the container with the required environment variables:

```bash
docker run -d \
  --name pulseboard \
  -p 8787:8787 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_SERVER_KEY=your-server-only-key \
  -e ALLOWED_ORIGIN=http://localhost:8787 \
  pulseboard
```

For PowerShell, the equivalent command is:

```powershell
docker run -d --name pulseboard -p 8787:8787 `
  -e SUPABASE_URL="https://your-project.supabase.co" `
  -e SUPABASE_SERVER_KEY="your-server-only-key" `
  -e ALLOWED_ORIGIN="http://localhost:8787" `
  pulseboard
```

The Docker image:

- Uses Node.js 22 Alpine.
- Builds the frontend and backend in a separate build stage.
- Installs production dependencies in the runtime stage.
- Runs as a non-root user.
- Exposes port `8787`.
- Serves the compiled frontend and API from the Express server.

Never commit production credentials or put server-only secrets in Docker build arguments or frontend environment variables.

## Security Considerations

PulseBoard includes several baseline security measures:

- Helmet security headers.
- Configurable CORS origin.
- Zod request validation.
- Supabase bearer-token validation.
- Environment-based secret management.
- Non-root Docker runtime.

**Production hardening still required:**

- Implement role-based authorization for sensitive operations.
- Enforce appropriate database permissions and Row Level Security.
- Add API rate limiting.
- Review input validation and error handling.
- Configure HTTPS and secure deployment settings.
- Verify that workspace security settings are actually enforced.

Authentication alone does not provide complete authorization.

## Roadmap

Potential improvements include:

- Role-based access control (RBAC).
- Advanced analytics and reporting.
- Exportable reports.
- Improved notification management.
- Audit logs and activity tracking.
- Advanced workspace security.
- Automated testing.
- Production deployment and monitoring.

## License

No open-source license has currently been specified. All rights are reserved unless a license is added to this repository.

---

**Built with React, TypeScript, Vite and Supabase.**

GitHub: [@SilenteyeDev](https://github.com/SilenteyeDev)