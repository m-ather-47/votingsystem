-- Database schema for Online Voting System (Supabase/Postgres)

-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

-- Admins
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  created_at timestamptz not null default now()
);

-- Elections
create table if not exists elections (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  status text not null default 'Active' check (status in ('Active','Inactive','Archived')),
  created_at timestamptz not null default now()
);

-- Positions
create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references elections(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint uniq_position_per_election unique (election_id, name)
);

-- Voters
create table if not exists voters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnic text unique not null,
  dob date not null,
  photo text,
  status text not null default 'Active' check (status in ('Not Voted','Voted','Inactive','Active')),
  created_at timestamptz not null default now()
);

-- Voter election status
create table if not exists voter_elections (
  id uuid primary key default gen_random_uuid(),
  voter_cnic text not null references voters(cnic) on delete cascade,
  election_id uuid not null references elections(id) on delete cascade,
  status text not null default 'Not Voted' check (status in ('Not Voted','Voted')),
  voted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint uniq_voter_election unique (voter_cnic, election_id)
);

-- Candidates
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  party text not null,
  position text not null,
  election_id uuid references elections(id) on delete set null,
  position_id uuid references positions(id) on delete set null,
  photo text,
  created_at timestamptz not null default now()
);

-- Votes
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  voter_cnic text not null,
  candidate_id uuid not null references candidates(id) on delete cascade,
  election_id uuid references elections(id) on delete set null,
  position text not null,
  created_at timestamptz not null default now(),
  constraint fk_votes_voter_cnic foreign key (voter_cnic) references voters(cnic) on delete cascade,
  constraint uniq_vote_per_position unique (voter_cnic, election_id, position)
);
