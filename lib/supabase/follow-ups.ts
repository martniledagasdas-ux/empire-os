import { createSupabaseClient } from "./client";
import type { ProspectRecord } from "./prospects";

export type FollowUpRecord = {
  id: string;
  prospect_id: string;
  follow_up_date: string;
  status: string;
  notes: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  prospect_name?: string;
};

type FollowUpRow = {
  id: string;
  prospect_id: string;
  follow_up_date: string;
  status: string;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  prospects?: {
    full_name: string;
  } | null;
};

export async function fetchFollowUpsFromSupabase() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("follow_ups")
    .select("*, prospects(full_name)")
    .order("follow_up_date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as FollowUpRow[] | null ?? []).map((row) => ({
    id: row.id,
    prospect_id: row.prospect_id,
    follow_up_date: row.follow_up_date,
    status: row.status,
    notes: row.notes ?? "",
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    prospect_name: row.prospects?.full_name ?? "Unknown prospect",
  }));
}

export async function fetchProspectsForFollowUps() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("prospects").select("id, full_name").order("full_name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as Array<{ id: string; full_name: string }> | null ?? []).map((prospect) => ({
    id: prospect.id,
    fullName: prospect.full_name,
  }));
}

export async function createFollowUpInSupabase(values: { prospect_id: string; follow_up_date: string; status: string; notes: string }) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("follow_ups")
    .insert({
      prospect_id: values.prospect_id,
      follow_up_date: values.follow_up_date,
      status: values.status,
      notes: values.notes,
    })
    .select("*, prospects(full_name)")
    .single();

  if (error) {
    throw error;
  }

  const row = data as FollowUpRow;
  return {
    id: row.id,
    prospect_id: row.prospect_id,
    follow_up_date: row.follow_up_date,
    status: row.status,
    notes: row.notes ?? "",
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    prospect_name: row.prospects?.full_name ?? "Unknown prospect",
  };
}

export async function updateFollowUpInSupabase(id: string, values: { follow_up_date: string; status: string; notes: string }) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("follow_ups")
    .update({
      follow_up_date: values.follow_up_date,
      status: values.status,
      notes: values.notes,
    })
    .eq("id", id)
    .select("*, prospects(full_name)")
    .single();

  if (error) {
    throw error;
  }

  const row = data as FollowUpRow;
  return {
    id: row.id,
    prospect_id: row.prospect_id,
    follow_up_date: row.follow_up_date,
    status: row.status,
    notes: row.notes ?? "",
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    prospect_name: row.prospects?.full_name ?? "Unknown prospect",
  };
}

export async function deleteFollowUpFromSupabase(id: string) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("follow_ups").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
