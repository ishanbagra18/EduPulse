import type { User } from "../types";
import supabase from "./supabase";

export async function fetchUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function fetchUserById(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as User | null, error };
}

export async function createAuthUser(email: string, password: string) {
  // Creates auth user (sign up). For full admin creation consider server-side service key.
  const res = await supabase.auth.signUp({ email, password });
  return res;
}

export async function createAdminUser(payload: {
  email: string;
  password: string;
  profile?: any;
}) {
  // Preserve current session (admin) so we can restore it after signUp.
  // signUp replaces the active session with the new user; restoring ensures
  // subsequent profile insert runs with the admin session (required by RLS).
  let adminAccessToken: string | null = null;
  let adminRefreshToken: string | null = null;
  try {
    const sessRes = await supabase.auth.getSession();
    const session = sessRes?.data?.session ?? null;
    adminAccessToken = session?.access_token ?? null;
    adminRefreshToken = session?.refresh_token ?? null;
  } catch (e) {
    // ignore - proceed without restore if we can't read session
  }

  const r = await createAuthUser(payload.email, payload.password);
  if (r.error)
    return {
      data: null,
      error: new Error(r.error?.message ?? String(r.error)),
    };
  const uid = r.data?.user?.id ?? null;
  if (!uid) {
    return {
      data: null,
      error: new Error("Auth user created but no id was returned by Supabase"),
    };
  }

  // Restore admin session before inserting the profile so the insert is performed
  // by the admin user (if we were able to capture tokens).
  if (adminAccessToken && adminRefreshToken) {
    try {
      // @ts-ignore setSession exists in client
      await supabase.auth.setSession({
        access_token: adminAccessToken,
        refresh_token: adminRefreshToken,
      });
    } catch (e) {
      // if restore fails, continue — insertion may run as the new user
    }
  }

  let createdProfile: any = null;
  if (payload.profile) {
    const created = await createUserProfile({ id: uid, ...payload.profile });
    if (created.error)
      return {
        data: null,
        error: new Error(created.error?.message ?? String(created.error)),
      };
    createdProfile = created.data;
  }

  return {
    data: { auth: r.data, profile: createdProfile },
    error: null,
  } as any;
}

export async function createUserProfile(user: Partial<User>) {
  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single();
  return { data, error };
}

export async function updateUserProfile(id: string, patch: Partial<User>) {
  const { data, error } = await supabase
    .from("users")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data, error };

  // When a user is activated by admin, ensure a corresponding record
  // exists in the students or teachers table so other features work.
  try {
    if (patch.is_active === true) {
      const role = (data as User)?.role;
      if (role === "student") {
        const { data: existingStudent } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", id)
          .maybeSingle();
        if (!existingStudent) {
          await supabase.from("students").insert({
            user_id: id,
            status: "active",
            photo_url: (data as User)?.profile_image ?? null,
          });
        }
      } else if (role === "teacher") {
        const { data: existingTeacher } = await supabase
          .from("teachers")
          .select("id")
          .eq("user_id", id)
          .maybeSingle();
        if (!existingTeacher) {
          await supabase.from("teachers").insert({
            user_id: id,
            status: "active",
            photo_url: (data as User)?.profile_image ?? null,
          });
        }
      }
    }
  } catch (e) {
    // Non-fatal: log and continue returning the updated user
    // eslint-disable-next-line no-console
    console.warn("Failed to create student/teacher record:", e);
  }

  return { data, error };
}

export async function deleteUser(id: string) {
  const { error } = await supabase.from("users").delete().eq("id", id);
  return { error };
}

export async function setUserBlocked(id: string, blocked: boolean) {
  const { data, error } = await supabase
    .from("users")
    .update({ is_blocked: blocked })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}
