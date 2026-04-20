import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { searchParams } = new URL(req.url);

    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json({ error: "Missing file id" }, { status: 400 });
    }

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

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: file, error: fileError } = await supabase
      .from("readiness_document_files")
      .select(`
        id,
        user_id,
        storage_bucket,
        storage_path,
        file_name,
        mime_type
      `)
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!file.storage_path) {
      return NextResponse.json({ error: "Missing storage path" }, { status: 500 });
    }

    const bucket = file.storage_bucket || "vault";

    const { data: blobData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(file.storage_path);

    if (downloadError || !blobData) {
      return NextResponse.json(
        { error: downloadError?.message || "Download failed" },
        { status: 500 }
      );
    }

    const arrayBuffer = await blobData.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": file.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.file_name || "download")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unhandled server error" },
      { status: 500 }
    );
  }
}