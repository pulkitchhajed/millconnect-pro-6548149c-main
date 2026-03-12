import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useFavorites = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("*, fabrics(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useFavoriteIds = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorite-ids", user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();
      const { data, error } = await supabase
        .from("favorites")
        .select("fabric_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return new Set(data.map((f) => f.fabric_id));
    },
    enabled: !!user,
  });
};

export const useToggleFavorite = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fabricId, isFavorite }: { fabricId: string; isFavorite: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("fabric_id", fabricId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, fabric_id: fabricId });
        if (error) throw error;
      }
    },
    onSuccess: (_, { isFavorite }) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    },
    onError: () => toast.error("Failed to update favorites"),
  });
};
