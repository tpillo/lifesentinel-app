import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type StorageItem = {
  name: string;
  id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

async function listFolder(folder: string): Promise<StorageItem[]> {
  const { data, error } = await supabaseAdmin.storage.from("vault").list(folder, {
    limit: 200,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) throw new Error(`List failed for "${folder}": ${error.message}`);
  return (data ?? []) as StorageItem[];
}

async function walkFolder(
  folder: string,
  depth = 0,
  maxDepth = 4
): Promise<{ name: string; path: string; url: string; created_at: string | null; updated_at: string | null }[]> {
  if (depth > maxDepth) return [];

  const items = await listFolder(folder);
  const files: { name: string; path: string; url: string; created_at: string | null; updated_at: string | null }[] = [];

  for (const item of items) {
    const fullPath = `${folder}/${item.name}`;
    const isFolder = !item.id;

    if (isFolder) {
      const nested = await walkFolder(fullPath, depth + 1, maxDepth);
      files.push(...nested);
      continue;
    }

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("vault")
      .createSignedUrl(fullPath, 3600);

    files.push({
      name: item.name,
      path: fullPath,
      url: signErr || !signed ? "" : signed.signedUrl,
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,
    });
  }

  return files;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { data: link, error: linkErr } = await supabaseAdmin
    .from("guardian_links")
    .select("owner_user_id, expires_at, revoked_at")
    .eq("token", token)
    .single();

  if (linkErr || !link) {
    return NextResponse.json({ error: "Invalid link" }, { status: 401 });
  }

  if (link.revoked_at) {
    return NextResponse.json({ error: "This link has been revoked." }, { status: 403 });
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: "This link has expired." }, { status: 403 });
  }

  try {
    const files = await walkFolder(link.owner_user_id);
    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load files" },
      { status: 500 }
    );
  }
}
