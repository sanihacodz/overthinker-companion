-- Copy and paste this into the Supabase SQL Editor

-- 1. Create the thoughts table
CREATE TABLE thoughts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author text not null,
  dilemma text not null,
  tree_data jsonb not null,
  vibe_check text not null,
  upvotes integer default 0 not null
);

-- 2. Create Row Level Security (RLS) policies
-- Enable RLS
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the community feed (Public read access)
CREATE POLICY "Public read access"
  ON thoughts
  FOR SELECT
  USING (true);

-- Allow anyone to insert a new thought (Public insert access for MVP)
CREATE POLICY "Public insert access"
  ON thoughts
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to upvote (Public update access for the 'upvotes' column)
CREATE POLICY "Public upvote access"
  ON thoughts
  FOR UPDATE
  USING (true);
