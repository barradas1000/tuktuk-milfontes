export interface Conductor {
  id: string;
  conductor_id: string;
  is_active: boolean;
  session_start: string | null;
  created_at: string | null;
  name: string;
}