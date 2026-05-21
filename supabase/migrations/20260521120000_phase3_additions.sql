-- Phase 3: subscription tracking + points RPC

-- Add subscription expiry to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS toss_billing_key TEXT;

-- Point system tables
CREATE TABLE IF NOT EXISTS user_points (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS point_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_points_self" ON user_points
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "point_logs_self" ON point_logs
  FOR SELECT USING (auth.uid() = user_id);

-- RPC: atomically add points and log the change
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_delta INTEGER,
  p_reason TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_points (user_id, total_points, updated_at)
    VALUES (p_user_id, GREATEST(0, p_delta), NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET total_points = GREATEST(0, user_points.total_points + p_delta),
        updated_at = NOW();

  INSERT INTO point_logs (user_id, delta, reason)
    VALUES (p_user_id, p_delta, p_reason);
END;
$$;

-- Index for cleanup-expired query
CREATE INDEX IF NOT EXISTS idx_users_tier_expires
  ON users (tier, subscription_expires_at)
  WHERE tier = 'pro';
