import type { ProspectFormValues } from "../../app/components/prospect-modal";
import { createSupabaseClient } from "./client";

export type ProspectRecord = ProspectFormValues & {
  id: number;
  createdAt: string;
};

type ProspectRow = {
  id: number;
  full_name: string;
  country: string | null;
  phone: string | null;
  email: string | null;
  facebook_profile: string | null;
  interest_level: string;
  status: string;
  notes: string | null;
  next_follow_up_date: string | null;
  created_at: string | null;
};

function mapRowToProspect(row: ProspectRow): ProspectRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    country: row.country ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    facebookProfile: row.facebook_profile ?? "",
    interestLevel: row.interest_level,
    status: row.status,
    notes: row.notes ?? "",
    nextFollowUpDate: row.next_follow_up_date ?? "",
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString() : "Just now",
  };
}

function mapValuesToRow(values: ProspectFormValues) {
  return {
    full_name: values.fullName,
    country: values.country || null,
    phone: values.phone || null,
    email: values.email || null,
    facebook_profile: values.facebookProfile || null,
    interest_level: values.interestLevel,
    status: values.status,
    notes: values.notes || null,
    next_follow_up_date: values.nextFollowUpDate || null,
  };
}

export async function fetchProspectsFromSupabase() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("prospects").select("*").order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ProspectRow[] | null)?.map(mapRowToProspect) ?? [];
}

export async function createProspectInSupabase(values: ProspectFormValues) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("prospects")
    .insert(mapValuesToRow(values))
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToProspect(data as ProspectRow);
}

export async function updateProspectInSupabase(id: number, values: ProspectFormValues) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("prospects")
    .update(mapValuesToRow(values))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToProspect(data as ProspectRow);
}

export async function deleteProspectFromSupabase(id: number) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("prospects").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
