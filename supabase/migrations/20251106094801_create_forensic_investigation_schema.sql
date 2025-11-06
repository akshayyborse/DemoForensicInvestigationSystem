/*
  # Forensic Investigation System Schema

  ## Overview
  This migration creates a comprehensive forensic investigation database with support for:
  - Event logging and tracking
  - Natural language query history
  - Event correlation and timeline generation
  - Automated forensic report generation

  ## New Tables

  ### `forensic_events`
  Stores all security and system events for forensic analysis
  - `id` (uuid, primary key) - Unique event identifier
  - `event_type` (text) - Type of event (login, file_access, network, etc.)
  - `timestamp` (timestamptz) - When the event occurred
  - `user_id` (text) - User associated with the event
  - `ip_address` (text) - IP address of the event source
  - `country` (text) - Country of origin
  - `action` (text) - Action performed
  - `resource` (text) - Resource accessed or affected
  - `status` (text) - Event status (success, failed, blocked)
  - `metadata` (jsonb) - Additional event details
  - `created_at` (timestamptz) - Record creation timestamp

  ### `investigations`
  Tracks forensic investigations
  - `id` (uuid, primary key) - Investigation identifier
  - `title` (text) - Investigation title
  - `description` (text) - Investigation description
  - `status` (text) - Investigation status (open, in_progress, closed)
  - `investigator` (text) - Lead investigator name
  - `created_at` (timestamptz) - Investigation start date
  - `updated_at` (timestamptz) - Last update timestamp
  - `findings` (jsonb) - Investigation findings and notes

  ### `queries`
  Stores natural language queries and their SQL translations
  - `id` (uuid, primary key) - Query identifier
  - `investigation_id` (uuid, foreign key) - Associated investigation
  - `natural_language` (text) - Original natural language query
  - `sql_query` (text) - Translated SQL query
  - `results_count` (integer) - Number of results returned
  - `created_at` (timestamptz) - Query execution timestamp

  ### `timelines`
  Correlated event timelines for investigations
  - `id` (uuid, primary key) - Timeline identifier
  - `investigation_id` (uuid, foreign key) - Associated investigation
  - `title` (text) - Timeline title
  - `event_ids` (uuid[]) - Array of correlated event IDs
  - `narrative` (text) - Auto-generated narrative summary
  - `created_at` (timestamptz) - Timeline creation timestamp

  ### `reports`
  Generated forensic reports
  - `id` (uuid, primary key) - Report identifier
  - `investigation_id` (uuid, foreign key) - Associated investigation
  - `format` (text) - Report format (legal, technical, executive)
  - `content` (text) - Full report content
  - `methodology` (text) - Methodologies used
  - `evidence_integrity` (text) - Evidence integrity summary
  - `generated_at` (timestamptz) - Report generation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Public access policies for demonstration purposes
  - In production, restrict to authenticated investigators only

  ## Indexes
  - Performance indexes on frequently queried columns
  - Time-based indexes for temporal queries
  - GiST index on metadata JSONB for fast JSON queries
*/

-- Create forensic_events table
CREATE TABLE IF NOT EXISTS forensic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  user_id text,
  ip_address text,
  country text,
  action text NOT NULL,
  resource text,
  status text DEFAULT 'success',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create investigations table
CREATE TABLE IF NOT EXISTS investigations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'open',
  investigator text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  findings jsonb DEFAULT '{}'::jsonb
);

-- Create queries table
CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid REFERENCES investigations(id) ON DELETE CASCADE,
  natural_language text NOT NULL,
  sql_query text NOT NULL,
  results_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create timelines table
CREATE TABLE IF NOT EXISTS timelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid REFERENCES investigations(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_ids uuid[] DEFAULT ARRAY[]::uuid[],
  narrative text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid REFERENCES investigations(id) ON DELETE CASCADE,
  format text DEFAULT 'legal',
  content text NOT NULL,
  methodology text DEFAULT '',
  evidence_integrity text DEFAULT '',
  generated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forensic_events_timestamp ON forensic_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_forensic_events_type ON forensic_events(event_type);
CREATE INDEX IF NOT EXISTS idx_forensic_events_status ON forensic_events(status);
CREATE INDEX IF NOT EXISTS idx_forensic_events_country ON forensic_events(country);
CREATE INDEX IF NOT EXISTS idx_forensic_events_ip ON forensic_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_forensic_events_metadata ON forensic_events USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations(status);
CREATE INDEX IF NOT EXISTS idx_queries_investigation ON queries(investigation_id);
CREATE INDEX IF NOT EXISTS idx_timelines_investigation ON timelines(investigation_id);
CREATE INDEX IF NOT EXISTS idx_reports_investigation ON reports(investigation_id);

-- Enable Row Level Security
ALTER TABLE forensic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Public can view forensic events"
  ON forensic_events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert forensic events"
  ON forensic_events FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view investigations"
  ON investigations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can create investigations"
  ON investigations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update investigations"
  ON investigations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view queries"
  ON queries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can create queries"
  ON queries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view timelines"
  ON timelines FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can create timelines"
  ON timelines FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view reports"
  ON reports FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can create reports"
  ON reports FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert sample forensic events for demonstration
INSERT INTO forensic_events (event_type, timestamp, user_id, ip_address, country, action, resource, status, metadata)
VALUES
  ('login', now() - interval '3 hours', 'user_001', '185.220.101.5', 'Russia', 'login_attempt', '/admin', 'success', '{"browser": "Firefox", "os": "Linux"}'),
  ('file_access', now() - interval '2 hours 55 minutes', 'user_001', '185.220.101.5', 'Russia', 'file_download', '/confidential/reports.zip', 'success', '{"file_size": "45MB"}'),
  ('login', now() - interval '2 hours 30 minutes', 'user_002', '45.142.213.20', 'Netherlands', 'login_attempt', '/admin', 'failed', '{"reason": "invalid_password"}'),
  ('network', now() - interval '2 hours', 'user_003', '192.168.1.100', 'US', 'data_transfer', '/api/export', 'success', '{"bytes_sent": 1048576}'),
  ('login', now() - interval '1 hour', 'admin', '203.0.113.50', 'US', 'login_attempt', '/admin', 'success', '{"mfa": "enabled"}'),
  ('file_access', now() - interval '30 minutes', 'user_004', '198.51.100.25', 'Canada', 'file_read', '/public/docs.pdf', 'success', '{}')
ON CONFLICT DO NOTHING;