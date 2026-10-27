import supabase from "./supabase";

export async function fetchSubjects() {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });
  return { data, error };
}

export async function createSubject(payload: any) {
  const { data, error } = await supabase
    .from("subjects")
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function fetchSubjectById(id: string) {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function updateSubject(id: string, patch: any) {
  const { data, error } = await supabase
    .from("subjects")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteSubject(id: string) {
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  return { error };
}
