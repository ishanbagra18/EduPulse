import supabase from "./supabase";

export async function fetchClasses() {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("name", { ascending: true });
  return { data, error };
}

export async function fetchClassById(id: string) {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function createClass(payload: any) {
  const { data, error } = await supabase
    .from("classes")
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function updateClass(id: string, patch: any) {
  const { data, error } = await supabase
    .from("classes")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteClass(id: string) {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  return { error };
}
