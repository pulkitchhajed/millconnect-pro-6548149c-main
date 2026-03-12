import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Fabric {
  id: string;
  name: string;
  type: string;
  description: string;
  colors: string;
  min_order: number;
  price_per_meter: number;
  unit: string;
  available: boolean;
  image_url: string | null;
  gsm: number | null;
  weave: string | null;
  width: string | null;
  composition: string | null;
  finish: string | null;
  shrinkage: string | null;
  created_at: string;
  updated_at: string;
}

export interface FabricImage {
  id: string;
  fabric_id: string;
  image_url: string;
  sort_order: number;
}

export const useFabrics = () => {
  return useQuery({
    queryKey: ["fabrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fabrics")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Fabric[];
    },
  });
};

export const useFabric = (id: string | undefined) => {
  return useQuery({
    queryKey: ["fabric", id],
    queryFn: async () => {
      if (!id) throw new Error("No fabric id");
      const { data, error } = await supabase
        .from("fabrics")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Fabric;
    },
    enabled: !!id,
  });
};

export const useFabricImages = (fabricId: string | undefined) => {
  return useQuery({
    queryKey: ["fabric-images", fabricId],
    queryFn: async () => {
      if (!fabricId) return [];
      const { data, error } = await supabase
        .from("fabric_images")
        .select("*")
        .eq("fabric_id", fabricId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as FabricImage[];
    },
    enabled: !!fabricId,
  });
};
