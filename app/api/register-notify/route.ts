export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@lifesentinelfamily.com";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "tpillo@protonmail.com";
const BASE_URL = "https://lifesentinelfamily.com";

export async function POST(req: Request) {
  let body: { user_id?: string; email?: string; full_name?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { user_id, email } = body;
  if (!user_id || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Create profile row (backward compat)
  await supabaseAdmin.from("profiles").upsert(
    { user_id, approved: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );

  // Insert pending approval row and retrieve the token
  const { data: approval, error: approvalErr } = await supabaseAdmin
    .from("signup_approvals")
    .insert({ user_id, email, status: "pending" })
    .select("approval_token")
    .single();

  if (approvalErr) {
    console.error("[register-notify] signup_approvals insert error:", approvalErr);
    return NextResponse.json({ error: approvalErr.message }, { status: 500 });
  }

  const token = approval.approval_token as string;
  const approveUrl = `${BASE_URL}/api/admin/approve/${token}`;
  const denyUrl = `${BASE_URL}/api/admin/deny/${token}`;
  const ts = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" });

  if (process.env.RESEND_API_KEY) {
    console.log("[signup-approval] sending admin email", { to: ADMIN_EMAIL, from: FROM_EMAIL, subject: `Life Sentinel: New signup pending — ${email}` });
    try {
      const { data, error: resendErr } = await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Life Sentinel: New signup pending — ${email}`,
        html: adminNotificationHtml({ email, ts, approveUrl, denyUrl }),
        text: adminNotificationText({ email, ts, approveUrl, denyUrl }),
      });
      if (resendErr) {
        console.error("[signup-approval] admin email failed (Resend error):", resendErr);
      } else {
        console.log("[signup-approval] admin email sent:", { to: ADMIN_EMAIL, from: FROM_EMAIL, messageId: data?.id });
      }
    } catch (err) {
      console.error("[signup-approval] admin email failed (exception):", err);
    }
  } else {
    console.warn("[signup-approval] RESEND_API_KEY not set — skipping admin email");
  }

  return NextResponse.json({ ok: true });
}

function adminNotificationHtml({ email, ts, approveUrl, denyUrl }: {
  email: string; ts: string; approveUrl: string; denyUrl: string;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">
        <tr>
          <td style="background:#faf8f5;border-bottom:1px solid #e7e5e4;padding:24px 32px;text-align:center;">
            <span style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#1c1917;letter-spacing:-0.3px;">LifeSentinel</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:22px;font-weight:600;color:#1c1917;">New signup pending review</h2>
            <p style="margin:0 0 24px;font-size:14px;color:#78716c;">A new user has registered and is waiting for your approval.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;border:1px solid #e7e5e4;border-radius:10px;margin-bottom:28px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#78716c;text-transform:uppercase;letter-spacing:0.5px;">Email</p>
                  <p style="margin:0;font-size:15px;color:#1c1917;font-weight:500;">${email}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 20px 16px;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#78716c;text-transform:uppercase;letter-spacing:0.5px;">Signed up</p>
                  <p style="margin:0;font-size:15px;color:#1c1917;">${ts} ET</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="padding-right:8px;" width="50%">
                  <a href="${approveUrl}" style="display:block;text-align:center;background:#d97706;color:#ffffff;font-family:system-ui,sans-serif;font-size:15px;font-weight:600;padding:14px 20px;border-radius:10px;text-decoration:none;">Approve</a>
                </td>
                <td style="padding-left:8px;" width="50%">
                  <a href="${denyUrl}" style="display:block;text-align:center;background:#f5f5f4;color:#44403c;font-family:system-ui,sans-serif;font-size:15px;font-weight:600;padding:14px 20px;border-radius:10px;text-decoration:none;border:1px solid #e7e5e4;">Deny</a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;font-size:12px;color:#a8a29e;">These links are single-use and unique to this signup. If the buttons don't work, use the raw URLs below:</p>
            <p style="margin:0 0 4px;font-size:11px;color:#a8a29e;word-break:break-all;">Approve: ${approveUrl}</p>
            <p style="margin:0;font-size:11px;color:#a8a29e;word-break:break-all;">Deny: ${denyUrl}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#faf8f5;border-top:1px solid #e7e5e4;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a8a29e;">Life Sentinel · lifesentinelfamily.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function adminNotificationText({ email, ts, approveUrl, denyUrl }: {
  email: string; ts: string; approveUrl: string; denyUrl: string;
}) {
  return `New Life Sentinel signup pending review

Email: ${email}
Signed up: ${ts} ET

Approve: ${approveUrl}
Deny: ${denyUrl}

These links are single-use and unique to this signup.`;
}
