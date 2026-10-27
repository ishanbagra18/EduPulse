import supabase from "./supabase";

export async function fetchTimetableForClass(class_id: string) {
  const { data, error } = await supabase
    .from("timetable")
    .select(
      `id, day, start_time, end_time, room, subjects(id,name), teachers(id, user_id, users!inner(full_name)), classes(id,name,section)`,
    )
    .eq("class_id", class_id)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true });
  return { data, error };
}

export async function createTimetableEntry(entry: any) {
  const { data, error } = await supabase
    .from("timetable")
    .insert(entry)
    .select()
    .single();
  return { data, error };
}

export async function fetchTimetableForTeacher(teacher_id: string) {
  const { data, error } = await supabase
    .from("timetable")
    .select(
      `id, day, start_time, end_time, room, subjects(id,name), teachers(id, user_id, users!inner(full_name)), classes(id,name,section)`,
    )
    .eq("teacher_id", teacher_id)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true });
  return { data, error };
}

export async function updateTimetableEntry(id: string, patch: any) {
  const { data, error } = await supabase
    .from("timetable")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}
