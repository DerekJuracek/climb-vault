import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";

export const useVideos = (athleteId?: string) =>
  useQuery({
    queryKey: ["videos", athleteId],
    queryFn: () => api.listVideos(athleteId),
  });

export const useVideo = (id: string) =>
  useQuery({
    queryKey: ["video", id],
    queryFn: () => api.getVideo(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "uploaded" || status === "processing" ? 3000 : false;
    },
  });

export const useAnalysis = (videoId: string) =>
  useQuery({
    queryKey: ["analysis", videoId],
    queryFn: () => api.getAnalysis(videoId),
    retry: false,
  });

export const useSimilarVideos = (videoId: string) =>
  useQuery({
    queryKey: ["similar", videoId],
    queryFn: () => api.getSimilarVideos(videoId),
    enabled: !!videoId,
  });

export const useUploadVideo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ formData, onProgress }: { formData: FormData; onProgress?: (pct: number) => void }) =>
      api.uploadVideo(formData, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });
};

export const useUpdateCoachNotes = (videoId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ notes, coachId }: { notes: string; coachId?: string }) =>
      api.updateCoachNotes(videoId, notes, coachId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["analysis", videoId] }),
  });
};
