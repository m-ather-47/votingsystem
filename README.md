# Online Voting System

A secure and comprehensive online voting application built with Next.js, Neon (PostgreSQL), and Tailwind CSS. This system facilitates the management of elections, voters, candidates, and secure ballot casting.

## Features

### 🔐 Admin Panel
- **Dashboard:** Overview of election statistics.
- **Election Management:** Create and manage elections (Active, Inactive, Archived).
- **Voter Management:** Register and manage voters with biometric details (CNIC, DOB, Photo).
- **Candidate Management:** Register candidates and assign them to specific elections and positions.
- **Position Management:** Define positions for each election.

### 🗳️ Voter Portal
- **Secure Info:** Voter authentication using CNIC.
- **Vote Casting:** Simple interface to cast votes for active elections.
- **Profile:** View voter details and voting status.
- **One Person, One Vote:** Robust constraints to prevent duplicate voting for the same position.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Database:** [Neon](https://neon.tech/) (PostgreSQL)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Authentication:** Custom Auth (JWT & Bcrypt)
- **Notifications:** React Hot Toast

## Database Schema

The database is structured with the following key tables:
- `admins`: System administrators.
- `elections`: Election events with status tracking.
- `positions`: Roles available in an election (e.g., President, Secretary).
- `candidates`: Individuals running for positions.
- `voters`: Registered voters with CNIC and status.
- `votes`: Records of cast ballots.

## Getting Started

### Prerequisites
- Node.js installed
- A Neon database set up

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd votingsystem
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Neon connection string and JWT secret:
   ```env
   NEON_DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Database Setup:**
   Run the SQL script located in `database/schema.sql` against your Neon database to create the necessary tables and extensions.

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Folder Structure

```
src/
├── app/                # App Router pages and layouts
│   ├── (admin)/        # Admin protected routes
│   ├── (voter)/        # Voter protected routes
│   ├── api/            # Backend API routes
│   └── (root)/         # Public landing pages
├── components/         # Reusable UI components
├── lib/                # Utility libraries
├── store/              # Zustand state stores
├── utils/              # Helper functions & database client
└── ...
```
