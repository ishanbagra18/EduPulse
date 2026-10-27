import supabase from "./supabase";

async function enrichFees(rows: any[] = []) {
  if (!rows.length) return [];

  const studentIds = [
    ...new Set(rows.map((row) => row.student_id).filter(Boolean)),
  ];
  const { data: students } = await supabase
    .from("students")
    .select("id, user_id, class_id, admission_number, roll_number")
    .in("id", studentIds);

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, section")
    .in("id", [
      ...new Set(
        (students ?? []).map((student) => student.class_id).filter(Boolean),
      ),
    ]);

  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email")
    .in("id", [
      ...new Set(
        (students ?? []).map((student) => student.user_id).filter(Boolean),
      ),
    ]);

  const studentsById = new Map(
    (students ?? []).map((student) => [student.id, student]),
  );
  const classesById = new Map(
    (classes ?? []).map((schoolClass) => [schoolClass.id, schoolClass]),
  );
  const usersById = new Map((users ?? []).map((user) => [user.id, user]));

  return rows.map((fee) => {
    const student = studentsById.get(fee.student_id);
    const classInfo = student?.class_id
      ? classesById.get(student.class_id)
      : null;
    const userInfo = student?.user_id ? usersById.get(student.user_id) : null;

    return {
      ...fee,
      student_name: userInfo?.full_name ?? "Unknown student",
      student_email: userInfo?.email ?? null,
      student_roll_number: student?.roll_number ?? null,
      student_admission_number: student?.admission_number ?? null,
      class_name: classInfo
        ? `${classInfo.name}${classInfo.section ? ` ${classInfo.section}` : ""}`
        : "Unassigned",
    };
  });
}

export async function fetchFeesByStudentId(student_id: string) {
  const { data, error } = await supabase
    .from("fees")
    .select("*")
    .eq("student_id", student_id)
    .order("due_date", { ascending: false });
  return { data: await enrichFees(data ?? []), error };
}

export async function fetchAllFees() {
  const { data, error } = await supabase
    .from("fees")
    .select("*")
    .order("due_date", { ascending: true });
  return { data: await enrichFees(data ?? []), error };
}

export async function fetchPendingFees() {
  const { data, error } = await supabase
    .from("fees")
    .select("*")
    .neq("status", "paid")
    .order("due_date", { ascending: true });
  return { data: await enrichFees(data ?? []), error };
}

export async function generateMonthlyFees({
  month,
  amount,
  due_date,
  class_id,
  student_id,
}: {
  month: string;
  amount: number;
  due_date?: string | null;
  class_id?: string | null;
  student_id?: string | null;
}) {
  if (!month || !amount) {
    return { data: [], error: new Error("Month and amount are required.") };
  }

  let studentsQuery = supabase
    .from("students")
    .select("id")
    .eq("status", "active");

  if (student_id) {
    studentsQuery = studentsQuery.eq("id", student_id);
  } else if (class_id) {
    studentsQuery = studentsQuery.eq("class_id", class_id);
  }

  const { data: students, error: studentError } = await studentsQuery;
  if (studentError) return { data: [], error: studentError };

  const rows: any[] = [];
  for (const student of students ?? []) {
    const { data: existing } = await supabase
      .from("fees")
      .select("id")
      .eq("student_id", student.id)
      .eq("month", month)
      .maybeSingle();

    if (!existing) {
      rows.push({
        student_id: student.id,
        month,
        amount,
        due_date: due_date ?? null,
        status: "pending",
      });
    }
  }

  if (!rows.length) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase.from("fees").insert(rows).select();
  return { data, error };
}

export async function createFee(fee: any) {
  const { data, error } = await supabase
    .from("fees")
    .insert(fee)
    .select()
    .single();
  return { data, error };
}

export async function updateFee(id: string, patch: any) {
  const { data, error } = await supabase
    .from("fees")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteFee(id: string) {
  const { error } = await supabase.from("fees").delete().eq("id", id);
  return { error };
}

export async function markFeePaid(fee_id: string, patch: any) {
  const { data, error } = await supabase
    .from("fees")
    .update(patch)
    .eq("id", fee_id)
    .select()
    .single();
  return { data, error };
}

export async function fetchStudentByUserId(user_id: string) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("user_id", user_id)
    .single();
  return { data, error };
}
