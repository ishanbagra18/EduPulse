import supabase from "./supabase";

export async function fetchNotificationsForUser(user: any) {
  // Fetch notifications targeting user's role, class, or everyone
  const role = user?.role;
  const classId = user?.class_id ?? null;

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .or(`target_role.eq.${role},target_role.eq.everyone`)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function createNotification(payload: any) {
  const { data, error } = await supabase
    .from("notifications")
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function fetchRecentNotifications(limit = 10) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data, error };
}
