# VoteSecure — Online Voting System

A secure and comprehensive online voting application built with Next.js 16, Neon (PostgreSQL), and Tailwind CSS 4. This system facilitates the management of elections, voters, candidates, and secure ballot casting with CNIC-based voter verification.

## Features

### Admin Panel
- **Dashboard** — Overview of election statistics (total elections, voters, candidates, votes cast).
- **Election Management** — Create and manage elections with status tracking (Active, Inactive, Archived).
- **Voter Management** — Register and manage voters with identity details (CNIC, DOB, Photo).
- **Candidate Management** — Register candidates with party affiliation and assign them to elections and positions.
- **Position Management** — Define positions for each election (e.g., President, Vice President).

### Voter Portal
- **Secure Login** — Voter authentication using CNIC and Date of Birth.
- **Vote Casting** — Clean interface to cast votes for active elections.
- **Profile** — View voter details and voting status.
- **One Person, One Vote** — Database-level constraints prevent duplicate voting per position per election.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Database** | [Neon](https://neon.tech/) (PostgreSQL with pgcrypto) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) & [DaisyUI 5](https://daisyui.com/) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Authentication** | JWT (httpOnly cookies) & Bcrypt |
| **Linter** | [Biome](https://biomejs.dev/) |
| **Notifications** | React Hot Toast |

## Database Schema

The database uses PostgreSQL with the `pgcrypto` extension and the following tables:

| Table | Purpose |
|-------|---------|
| `admins` | System administrators (username + bcrypt password) |
| `elections` | Election events with status tracking |
| `positions` | Roles within an election (e.g., President) |
| `candidates` | Individuals running for positions, with party affiliation |
| `voters` | Registered voters with CNIC, DOB, photo, and status |
| `voter_elections` | Junction table tracking voter participation per election |
| `votes` | Cast ballots (voter_cnic, candidate_id, election_id, position) |

Key constraints include cascade deletes for referential integrity and a unique constraint ensuring one vote per voter per position per election.

## Getting Started

### Prerequisites
- Node.js (v18+)
- A [Neon](https://neon.tech/) PostgreSQL database

### Installation

1. **Clone the repository:**
   ```bash
   git clone (https://github.com/m-ather-47/votingsystem.git)
   cd votingsystem
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory:
   ```env
   NEON_DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Database Setup:**
   Run the schema and seed scripts against your Neon database:
   ```sql
   -- 1. Create tables and extensions
   -- Run database/schema.sql

   -- 2. (Optional) Insert demo data
   -- Run database/seed.sql
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

   The app redirects to the voter login page at [http://localhost:3000](http://localhost:3000).

### Demo Credentials

If you run the seed script, the following accounts are available:

**Admin:**
| Username | Password |
|----------|----------|
| admin | admin |

**Voters:**
| Name | CNIC | DOB |
|------|------|-----|
| Ali Raza | 3520212345671 | 2000-01-15 |
| Sara Khan | 3520276543219 | 2001-05-22 |

## Folder Structure

```
src/
├── app/
│   ├── (admin)/        # Admin routes (login, profile, manage elections/voters)
│   ├── (voter)/        # Voter routes (login, profile, vote casting)
│   ├── (root)/         # Public landing page
│   └── api/            # RESTful API routes
│       ├── auth/       #   Authentication (admin & voter login, logout)
│       ├── admin/      #   Admin CRUD (elections, voters, candidates, positions, stats)
│       ├── fetch/      #   Public data fetching
│       └── vote/       #   Vote submission
├── components/         # Reusable UI components (navbars, cards, management panels)
├── lib/                # Utilities (JWT helpers, demo user checks)
├── store/              # Zustand state stores
└── utils/              # Database clients (Neon query builder, Supabase)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Production build with Turbopack |
| `npm start` | Start production server |
| `npm run lint` | Run Biome linter |
