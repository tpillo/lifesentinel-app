 import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // no-op for route handler
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json(
        { error: "Auth error", details: userError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: files, error: filesError } = await supabase
      .from("readiness_document_files")
      .select(`
        id,
        user_id,
        readiness_document_id,
        storage_bucket,
        storage_path,
        file_name,
        mime_type,
        file_size,
        created_at,
        readiness_documents (
          category
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (filesError) {
      return NextResponse.json(
        { error: "Database error", details: filesError.message },
        { status: 500 }
      );
    }

    const results = await Promise.all(
      (files || []).map(async (file: any) => {
        const bucket = file.storage_bucket || "vault";
        const path = file.storage_path;

        if (!path) {
          return {
            id: file.id,
            user_id: file.user_id,
            readiness_document_id: file.readiness_document_id,
            storage_bucket: bucket,
            storage_path: file.storage_path,
            file_name: file.file_name,
            mime_type: file.mime_type,
            file_size: file.file_size,
            created_at: file.created_at,
            category: file.readiness_documents?.category ?? "Other",
            signedUrl: null,
            signedUrlError: "Missing storage_path",
          };
        }

        const { data: signedData, error: signedError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 60 * 60);

        return {
          id: file.id,
          user_id: file.user_id,
          readiness_document_id: file.readiness_document_id,
          storage_bucket: bucket,
          storage_path: file.storage_path,
          file_name: file.file_name,
          mime_type: file.mime_type,
          file_size: file.file_size,
          created_at: file.created_at,
          category: file.readiness_documents?.category ?? "Other",
          signedUrl: signedData?.signedUrl ?? null,
          signedUrlError: signedError?.message ?? null,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Unhandled server error",
        details: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}