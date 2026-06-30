import { createSupabaseClient } from "./client";

export type TrainingRecord = {
  id: number;
  title: string;
  description: string;
  category: string;
  video_url: string;
  resource_url: string;
  duration_minutes: number;
  is_published: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type TrainingRow = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  video_url: string | null;
  resource_url: string | null;
  duration_minutes: number | null;
  is_published: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TrainingFormValues = {
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  resourceUrl: string;
  durationMinutes: number;
  isPublished: boolean;
};

function mapRowToTraining(row: TrainingRow): TrainingRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    category: row.category ?? "General",
    video_url: row.video_url ?? "",
    resource_url: row.resource_url ?? "",
    duration_minutes: row.duration_minutes ?? 0,
    is_published: Boolean(row.is_published),
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

function mapValuesToRow(values: TrainingFormValues) {
  return {
    title: values.title,
    description: values.description || null,
    category: values.category,
    video_url: values.videoUrl || null,
    resource_url: values.resourceUrl || null,
    duration_minutes: values.durationMinutes,
    is_published: values.isPublished,
  };
}

export async function fetchTrainingsFromSupabase() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as TrainingRow[] | null)?.map(mapRowToTraining) ?? [];
}

export async function createTrainingInSupabase(values: TrainingFormValues) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("trainings")
    .insert(mapValuesToRow(values))
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToTraining(data as TrainingRow);
}

export async function updateTrainingInSupabase(id: number, values: TrainingFormValues) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("trainings")
    .update(mapValuesToRow(values))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToTraining(data as TrainingRow);
}

export async function deleteTrainingFromSupabase(id: number) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("trainings").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
