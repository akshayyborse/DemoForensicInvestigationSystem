import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ForensicEvent {
  id: string;
  event_type: string;
  timestamp: string;
  user_id: string | null;
  ip_address: string | null;
  country: string | null;
  action: string;
  resource: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Investigation {
  id: string;
  title: string;
  description: string;
  status: string;
  investigator: string;
  created_at: string;
  updated_at: string;
  findings: Record<string, unknown>;
}

export interface Query {
  id: string;
  investigation_id: string | null;
  natural_language: string;
  sql_query: string;
  results_count: number;
  created_at: string;
}

export interface Timeline {
  id: string;
  investigation_id: string | null;
  title: string;
  event_ids: string[];
  narrative: string;
  created_at: string;
}

export interface Report {
  id: string;
  investigation_id: string | null;
  format: string;
  content: string;
  methodology: string;
  evidence_integrity: string;
  generated_at: string;
}
