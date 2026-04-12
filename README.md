# BosYerVarMi — Flexible Reservation & Capacity Management Platform

A production-grade, mobile-friendly platform for managing resources, slots, and bookings across various industries. Built with a generic architecture to support lessons, cafes, coworking spaces, and more.

## tech Stack

- **Monorepo**: npm Workspaces
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Auth**: JWT-based (HTTP-only cookies)
- **Validation**: Zod
- **State Mgmt**: Zustand

## Key Features

- **Generic Resource Model**: Define any reservable entity (Lesson, Table, Room).
- **Concurrency Safe**: PostgreSQL transactions with 'FOR UPDATE' row-level locking to prevent overbooking.
- **Mobile-First UI**: Responsive design from 360px up to desktop.
- **Role-Based Access**: Multi-tenant support for Organizations, Branches, and Roles.
- **Waitlist Support**: Auto-promotion for full slots upon cancellation.

## Getting Started

### Prerequisites

- Node.js (v20+)
- PostgreSQL

### Installation

1. Clone the repository
2. Install dependencies (root):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Set up environment variables (`apps/server/.env`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/remotely"
   JWT_SECRET="your-secret"
   CLIENT_URL="http://localhost:5173"
   ```
4. Initialize the database:
   ```bash
   npm run prisma:migrate --workspace=@remotely/server
   npm run seed --workspace=@remotely/server
   ```
5. Run development server:
   ```bash
   npm run dev
   ```

## Architecture

- `apps/server`: Express.js backend with controllers, services, and middleware.
- `apps/web`: Vite/React frontend with Tailwind and shadcn/ui.
- `packages/shared`: Shared types, enums, and Zod validation schemas.

## How to Extend

To add a new business type (e.g., "Cinema Seats"):
1. Create a new `ResourceType` for the organization.
2. Define `Resource` instances with specific capacities.
3. Configure `BookingPolicy` for specific rules (e.g., max seats per user).
4. (Optional) Customize the `metadata` JSON field in `Reservation` for business-specific data.

## License

MIT
