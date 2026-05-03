import type { ReadingResult, DrawnCard } from "@tarot-saju/shared";
import { supabase } from "./supabase";
import { THEMES } from "../data/themes";

export interface SharedReading {
  id: string;
  themeId: string;
  themeTitle: string;
  cards: DrawnCard[];
  interpretation: string;
  summary: string;
  createdAt: string;
}

export async function saveSharedReading(
  result: ReadingResult,
): Promise<string> {
  const theme = THEMES.find((t) => t.id === result.request.themeId);

  const { data, error } = await supabase
    .from("shared_readings")
    .insert({
      theme_id: result.request.themeId,
      theme_title: theme?.title ?? "",
      cards: result.request.cards,
      interpretation: result.interpretation,
      summary: result.summary,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return data.id;
}

export async function getSharedReading(
  shareId: string,
): Promise<SharedReading | null> {
  const { data, error } = await supabase
    .from("shared_readings")
    .select("*")
    .eq("id", shareId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    themeId: data.theme_id,
    themeTitle: data.theme_title,
    cards: data.cards,
    interpretation: data.interpretation,
    summary: data.summary,
    createdAt: data.created_at,
  };
}
