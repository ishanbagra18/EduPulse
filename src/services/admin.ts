import supabase from "./supabase";

export async function getCounts() {
  const [studentsRes, teachersRes, feesRes, attendanceRes] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("teachers").select("id", { count: "exact", head: true }),
    supabase
      .from("fees")
      .select("id", { count: "exact", head: true })
      .neq("status", "paid"),
    supabase.from("attendance").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalStudents: studentsRes.count ?? 0,
    totalTeachers: teachersRes.count ?? 0,
    pendingFees: feesRes.count ?? 0,
    attendanceRecords: attendanceRes.count ?? 0,
  };
}
