export type VideoStatus = "uploaded" | "processing" | "analyzed" | "failed";

export interface Athlete {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Video {
  id: string;
  athlete_id: string;
  title: string;
  description: string | null;
  storage_url: string;
  status: VideoStatus;
  climb_grade: string | null;
  location: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface KeyMoment {
  timestamp_seconds: number;
  description: string;
}

export interface Analysis {
  id: string;
  video_id: string;
  movement_summary: string | null;
  footwork_score: number | null;
  body_position_score: number | null;
  balance_score: number | null;
  technique_tags: string[] | null;
  key_moments: KeyMoment[] | null;
  coach_notes: string | null;
  coach_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SimilarVideo {
  video_id: string;
  title: string;
  climb_grade: string | null;
  movement_summary: string | null;
  similarity: number;
}
