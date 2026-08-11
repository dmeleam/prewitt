import type { SupabaseClient } from "@supabase/supabase-js";

// Matches a screenshot line like ![Screenshot](some/storage/path.png).
// The target may be a bare storage path (current) or a full URL (legacy).
export const IMAGE_LINE = /^!\[([^\]]*)\]\(([^\s)]+)\)$/;

const BUCKET = "procedure-images";
const SIGNED_URL_TTL_SECONDS = 3600;

export function extractImagePaths(content: string): string[] {
  const paths: string[] = [];
  content.split("\n").forEach((line) => {
    const match = line.trim().match(IMAGE_LINE);
    if (match && !/^https?:\/\//.test(match[2])) {
      paths.push(match[2]);
    }
  });
  return Array.from(new Set(paths));
}

// The bucket is private, so images can't be linked directly. This mints a
// short-lived signed URL per image at render time — anyone without a current
// session simply can't load them.
export async function buildSignedUrlMap(
  supabase: SupabaseClient,
  content: string
): Promise<Record<string, string>> {
  const paths = extractImagePaths(content);
  if (paths.length === 0) return {};

  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  const map: Record<string, string> = {};
  data?.forEach((item) => {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  });
  return map;
}
