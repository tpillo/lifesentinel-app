export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@lifesentinelfamily.com";
const ADMIN_EMAIL = "tpillo@protonmail.com";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
  const { data: profiles } = await supabaseAdmin.from("profiles").select("user_id, full_name, approved");

  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  const users = (authUsers?.users ?? []).map((u) => {
    const profile = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email,
      full_name: profile?.full_name ?? null,
      approved: profile?.approved ?? false,
      created_at: u.created_at,
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { user_id?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { user_id } = body;
  if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

  // Approve the user
  await supabaseAdmin.from("profiles").upsert(
    { user_id, approved: true, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );

  // Get their email
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(user_id);
  if (user?.email && process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: "Your Life Sentinel account has been approved",
      html: `
        <p>Great news — your Life Sentinel account has been approved.</p>
        <p><a href="https://lifesentinelfamily.com/login">Click here to sign in and get started →</a></p>
        <p style="color:#888;font-size:12px;margin-top:24px;">Life Sentinel — lifesentinelfamily.com</p>
      `,
    });
  }

  return NextResponse.json({ ok: true });
}
