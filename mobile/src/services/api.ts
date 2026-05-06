import axios from "axios";
import type { Athlete, Video, Analysis, SimilarVideo } from "@/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

const client = axios.create({ baseURL: BASE_URL, timeout: 60_000 });

// Athletes
export const createAthlete = (data: { name: string; email: string }) =>
  client.post<Athlete>("/athletes/", data).then((r) => r.data);

export const listAthletes = () =>
  client.get<Athlete[]>("/athletes/").then((r) => r.data);

export const getAthlete = (id: string) =>
  client.get<Athlete>(`/athletes/${id}`).then((r) => r.data);

// Videos
export const uploadVideo = (
  formData: FormData,
  onProgress?: (pct: number) => void
) =>
  client
    .post<Video>("/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    })
    .then((r) => r.data);

export const listVideos = (athlete_id?: string) =>
  client
    .get<Video[]>("/videos/", { params: athlete_id ? { athlete_id } : undefined })
    .then((r) => r.data);

export const getVideo = (id: string) =>
  client.get<Video>(`/videos/${id}`).then((r) => r.data);

// Analysis
export const getAnalysis = (videoId: string) =>
  client.get<Analysis>(`/analysis/${videoId}`).then((r) => r.data);

export const updateCoachNotes = (videoId: string, coach_notes: string, coach_id?: string) =>
  client
    .patch<Analysis>(`/analysis/${videoId}/coach-notes`, { coach_notes, coach_id })
    .then((r) => r.data);

export const getSimilarVideos = (videoId: string, limit = 5) =>
  client
    .get<SimilarVideo[]>(`/analysis/${videoId}/similar`, { params: { limit } })
    .then((r) => r.data);
