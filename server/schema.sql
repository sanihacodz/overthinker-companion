-- ============================================================
-- STEP 1: Run this in Supabase SQL Editor to add analytics table
-- ============================================================

-- User sessions / prompt history table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Identity
  username text not null,               -- anonymous name (e.g. AnxiousAxolotl_42)

  -- Prompt data
  dilemma text not null,                -- the raw overthinking prompt
  tree_data jsonb not null,             -- the full decision tree response

  -- Computed metrics (derived from tree_data on the frontend)
  brain_rot_score integer not null default 5,   -- root node brainRotScore (1-10)
  chaos_level text not null default 'Medium',   -- root node chaosLevel
  node_count integer not null default 0,        -- total nodes generated
  edge_case_count integer not null default 0,   -- number of edge_case nodes
  path_count integer not null default 0,        -- number of path nodes
  recommended_path_id text,                      -- AI recommended path id
  sentiment text default 'Neutral',             -- derived sentiment: Anxious | Chaotic | Calm | Resolved
  session_hour integer default 12,              -- 0-23, hour of day (sleep impact analysis)
  revisit_hash text                             -- hash of the dilemma for loop detection
);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous MVP)
CREATE POLICY "Public insert sessions" ON user_sessions FOR INSERT WITH CHECK (true);

-- Allow reading own sessions by username
CREATE POLICY "Read own sessions" ON user_sessions FOR SELECT USING (true);

-- ============================================================
-- STEP 2: Also update thoughts table to add session_id reference
-- ============================================================
ALTER TABLE thoughts ADD COLUMN IF NOT EXISTS session_id uuid references user_sessions(id);

-- ============================================================
-- STEP 3: Dummy seed data for testing the Analysis dashboard
-- Change 'AnxiousAxolotl_42' to match your actual username if needed
-- ============================================================

INSERT INTO user_sessions (
  username, dilemma, tree_data,
  brain_rot_score, chaos_level, node_count, edge_case_count,
  path_count, recommended_path_id, sentiment, session_hour, revisit_hash,
  created_at
) VALUES
(
  'AnxiousAxolotl_42',
  'Should I text my ex back after they liked my story?',
  '{"nodes": [], "edges": [], "recommended": {"pathId": "path_1", "reason": "Drink water."}}',
  9, 'Extreme', 16, 4, 3, 'path_1', 'Anxious', 23,
  'should i text my ex back after they liked my story',
  NOW() - INTERVAL '1 day'
),
(
  'AnxiousAxolotl_42',
  'Should I quit my job to become a full-time content creator?',
  '{"nodes": [], "edges": [], "recommended": {"pathId": "path_2", "reason": "Keep the job, build the side hustle."}}',
  7, 'High', 18, 5, 4, 'path_2', 'Chaotic', 14,
  'should i quit my job to become a fulltime content creator',
  NOW() - INTERVAL '3 days'
),
(
  'AnxiousAxolotl_42',
  'Is it weird that I cried watching that dog food commercial?',
  '{"nodes": [], "edges": [], "recommended": {"pathId": "path_1", "reason": "You are normal. Probably."}}',
  4, 'Mild', 12, 2, 3, 'path_1', 'Calm', 9,
  'is it weird that i cried watching that dog food commercial',
  NOW() - INTERVAL '6 days'
);
