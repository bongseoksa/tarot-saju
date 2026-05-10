import { supabase } from "@/lib/supabase";
import type { DrawnCard } from "@tarot-saju/shared";

export interface SharedReading {
  id: string;
  theme_id: string;
  theme_title: string;
  cards: DrawnCard[];
  interpretation: string;
  summary: string;
  created_at: string;
  expires_at: string;
}

/** Save a reading result for sharing. Returns the share ID. */
export async function saveSharedReading(data: {
  themeId: string;
  themeTitle: string;
  cards: DrawnCard[];
  interpretation: string;
  summary: string;
}): Promise<string> {
  const { data: result, error } = await supabase
    .from("shared_readings")
    .insert({
      theme_id: data.themeId,
      theme_title: data.themeTitle,
      cards: data.cards,
      interpretation: data.interpretation,
      summary: data.summary,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to save shared reading: ${error.message}`);
  return result.id;
}

/** Fetch a shared reading by ID. Returns null if not found or expired. */
export async function getSharedReading(
  shareId: string,
): Promise<SharedReading | null> {
  const { data, error } = await supabase
    .from("shared_readings")
    .select("*")
    .eq("id", shareId)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error) return null;
  return data as SharedReading;
}
