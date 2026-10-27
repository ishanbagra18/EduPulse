import type { Role } from "../types";
import supabase from "./supabase";

export const PROFILE_PHOTO_BUCKET = "profile-photos";

type UploadProfilePhotoInput = {
  userId: string;
  uri: string;
  mimeType?: string | null;
};

function getExtension(uri: string, mimeType?: string | null) {
  if (mimeType?.includes("/")) {
    const ext = mimeType.split("/").pop()?.toLowerCase();
    if (ext) return ext === "jpeg" ? "jpg" : ext;
  }

  const uriExt = uri.split("?")[0]?.split(".").pop()?.toLowerCase();
  return uriExt && uriExt.length <= 5 ? uriExt : "jpg";
}

function getContentType(extension: string, mimeType?: string | null) {
  if (mimeType) return mimeType;
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
}

export async function uploadProfilePhoto({
  userId,
  uri,
  mimeType,
}: UploadProfilePhotoInput) {
  const extension = getExtension(uri, mimeType);
  const contentType = getContentType(extension, mimeType);
  const path = `${userId}/profile.${extension}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from(PROFILE_PHOTO_BUCKET)
    .upload(path, blob, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(PROFILE_PHOTO_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function updateRoleProfilePhoto(
  userId: string,
  role: Role,
  photoUrl: string,
) {
  if (role === "student") {
    return supabase
      .from("students")
      .update({ photo_url: photoUrl })
      .eq("user_id", userId);
  }

  if (role === "teacher") {
    return supabase
      .from("teachers")
      .update({ photo_url: photoUrl })
      .eq("user_id", userId);
  }

  return { data: null, error: null };
}

export async function fetchRoleProfilePhoto(userId: string, role: Role) {
  if (role === "student") {
    const { data, error } = await supabase
      .from("students")
      .select("photo_url")
      .eq("user_id", userId)
      .maybeSingle();

    return { photoUrl: data?.photo_url ?? null, error };
  }

  if (role === "teacher") {
    const { data, error } = await supabase
      .from("teachers")
      .select("photo_url")
      .eq("user_id", userId)
      .maybeSingle();

    return { photoUrl: data?.photo_url ?? null, error };
  }

  return { photoUrl: null, error: null };
}
