import supabase from "./supabase";

export async function globalSearch(query: string) {
  if (!query || query.trim().length === 0)
    return { students: [], teachers: [], results: [], fees: [] };

  const q = `%${query}%`;
  const [studentsRes, teachersRes, feesRes] = await Promise.all([
    supabase.from("students").select("*").ilike("full_name", q).limit(10),
    supabase.from("teachers").select("*").ilike("full_name", q).limit(10),
    supabase.from("fees").select("*").ilike("student_id", q).limit(10),
  ]);

  return {
    students: studentsRes.data ?? [],
    teachers: teachersRes.data ?? [],
    results: [],
    fees: feesRes.data ?? [],
  };
}
