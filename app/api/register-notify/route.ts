export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "tpillo@protonmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@lifesentinelfamily.com";

export async function POST(req: Request) {
  let body: { user_id?: string; email?: string; full_name?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { user_id, email, full_name } = body;
  if (!user_id || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Create profile row with approved = false
  await supabaseAdmin.from("profiles").upsert(
    { user_id, approved: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );

  // Send admin notification
  if (process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: "New Life Sentinel Registration",
      html: `
        <p>A new user has registered and is pending approval.</p>
        <ul>
          <li><strong>Name:</strong> ${full_name || "Not provided"}</li>
          <li><strong>Email:</strong> ${email}</li>
        </ul>
        <p><a href="https://lifesentinelfamily.com/admin/users">Review and approve →</a></p>
      `,
    });
  }

  return NextResponse.json({ ok: true });
}
