import { createSupabaseClient } from "./client";

export type DailyTaskRecord = {
  id: number;
  title: string;
  description: string;
  task_type: string;
  task_date: string;
  is_completed: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type DailyTaskRow = {
  id: number;
  title: string;
  description: string | null;
  task_type: string | null;
  task_date: string | null;
  is_completed: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DailyTaskFormValues = {
  title: string;
  description: string;
  taskType: string;
  taskDate: string;
  isCompleted: boolean;
};

function mapRowToDailyTask(row: DailyTaskRow): DailyTaskRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    task_type: row.task_type ?? "General",
    task_date: row.task_date ?? "",
    is_completed: Boolean(row.is_completed),
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

function mapValuesToRow(values: DailyTaskFormValues) {
  return {
    title: values.title,
    description: values.description || null,
    task_type: values.taskType,
    task_date: values.taskDate || null,
    is_completed: values.isCompleted,
  };
}

export async function fetchDailyTasksFromSupabase() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("daily_tasks")
    .select("*")
    .order("task_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as DailyTaskRow[] | null)?.map(mapRowToDailyTask) ?? [];
}

export async function createDailyTaskInSupabase(values: DailyTaskFormValues) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("daily_tasks")
    .insert(mapValuesToRow(values))
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToDailyTask(data as DailyTaskRow);
}

export async function updateDailyTaskInSupabase(id: number, values: DailyTaskFormValues) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("daily_tasks")
    .update(mapValuesToRow(values))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToDailyTask(data as DailyTaskRow);
}

export async function deleteDailyTaskFromSupabase(id: number) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("daily_tasks").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateDailyTaskCompletionInSupabase(id: number, isCompleted: boolean) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("daily_tasks")
    .update({ is_completed: isCompleted })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToDailyTask(data as DailyTaskRow);
}
