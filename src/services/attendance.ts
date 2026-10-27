import supabase from "./supabase";

export async function fetchClasses() {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("name", { ascending: true });
  return { data, error };
}

export async function fetchStudentsByClass(class_id: string) {
  const { data, error } = await supabase
    .from("students")
    .select("*, users(full_name)")
    .eq("class_id", class_id)
    .order("admission_number", { ascending: true });
  return { data, error };
}

export async function submitAttendanceBulk(entries: Array<any>) {
  const { data, error } = await supabase
    .from("attendance")
    .insert(entries)
    .select();
  return { data, error };
}

export async function fetchAttendanceByClassDate(
  class_id: string,
  date: string,
) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("class_id", class_id)
    .eq("date", date)
    .order("student_id", { ascending: true });
  return { data, error };
}

export async function submitAttendanceBulkUpsert(entries: Array<any>) {
  const results: { inserted: number; updated: number } = {
    inserted: 0,
    updated: 0,
  };
  for (const e of entries) {
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from("attendance")
        .select("id")
        .eq("student_id", e.student_id)
        .eq("class_id", e.class_id)
        .eq("date", e.date)
        .maybeSingle();
      if (fetchErr) throw fetchErr;
      if (existing && (existing as any).id) {
        const { data: upd, error: updErr } = await supabase
          .from("attendance")
          .update({
            status: e.status,
            remarks: e.remarks,
            teacher_id: e.teacher_id,
          })
          .eq("id", (existing as any).id)
          .select()
          .single();
        if (updErr) throw updErr;
        results.updated++;
      } else {
        const { data: ins, error: insErr } = await supabase
          .from("attendance")
          .insert(e)
          .select()
          .single();
        if (insErr) throw insErr;
        results.inserted++;
      }
    } catch (err) {
      return { data: null, error: err } as any;
    }
  }
  return { data: results, error: null } as any;
}

export async function fetchAttendanceByStudent(student_id: string) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("student_id", student_id)
    .order("date", { ascending: false });
  return { data, error };
}
