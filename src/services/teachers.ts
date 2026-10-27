import supabase from "./supabase";

export async function fetchTeachers() {
  // join to users to get display name
  const { data, error } = await supabase
    .from("teachers")
    .select("id, user_id, users!inner(full_name)")
    .order("id", { ascending: true });
  return { data, error };
}

export async function fetchTeacherById(id: string) {
  const { data, error } = await supabase
    .from("teachers")
    .select("id, user_id, users!inner(full_name)")
    .eq("id", id)
    .single();
  return { data, error };
}
