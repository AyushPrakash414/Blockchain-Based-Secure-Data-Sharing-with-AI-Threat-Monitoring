-- ============================================================
-- Supabase Schema: Blockchain Drive AI Threat Monitoring
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Access Logs Table
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT,
  action TEXT NOT NULL,
  result TEXT DEFAULT 'info',
  timestamp TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  risk_score FLOAT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  recommended_action TEXT DEFAULT 'Review activity',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Disable RLS (these are application logs, not user-private data)
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and reads (needed for anon key)
CREATE POLICY "Allow all access to access_logs" ON access_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to alerts" ON alerts
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Enable Realtime on both tables
ALTER PUBLICATION supabase_realtime ADD TABLE access_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_access_logs_wallet ON access_logs (wallet_address);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_wallet ON alerts (wallet_address);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts (created_at DESC);
