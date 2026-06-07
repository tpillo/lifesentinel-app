export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@lifesentinelfamily.com";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const { data: approval } = await supabaseAdmin
    .from("signup_approvals")
    .select("*")
    .eq("approval_token", token)
    .maybeSingle();

  if (!approval) {
    return html(invalidPage("This approval link is invalid or does not exist."));
  }

  if (approval.token_used_at) {
    return html(invalidPage(
      `This link has already been used. ${approval.email} is currently <strong>${approval.status}</strong>.`
    ));
  }

  const now = new Date().toISOString();

  await supabaseAdmin
    .from("signup_approvals")
    .update({ status: "approved", approved_at: now, token_used_at: now })
    .eq("id", approval.id);

  // Keep profiles.approved in sync for backward compatibility
  await supabaseAdmin
    .from("profiles")
    .upsert({ user_id: approval.user_id, approved: true, updated_at: now }, { onConflict: "user_id" });

  if (process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: approval.email,
      subject: "Your Life Sentinel account is ready",
      html: approvedEmailHtml(approval.email),
      text: `Your Life Sentinel account has been approved. Sign in at https://lifesentinelfamily.com/login`,
    });
  }

  return html(confirmPage("approved", approval.email));
}

function html(body: string) {
  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function shell(title: string, content: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} · Life Sentinel</title>
  <style>
    body { margin: 0; padding: 0; background: #faf8f5; font-family: Georgia, serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #fff; border: 1px solid #e7e5e4; border-radius: 16px; padding: 40px 36px; max-width: 440px; width: 100%; margin: 24px 16px; text-align: center; }
    .glyph { color: #d97706; font-size: 32px; margin-bottom: 12px; }
    h1 { margin: 0 0 12px; font-size: 22px; font-weight: 600; color: #1c1917; }
    p { margin: 0; font-size: 15px; color: #78716c; line-height: 1.6; }
    .badge { display: inline-block; margin-bottom: 20px; padding: 6px 14px; border-radius: 999px; font-family: system-ui, sans-serif; font-size: 13px; font-weight: 600; }
    .approved { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .denied { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .invalid { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  </style>
</head>
<body>
  <div class="card">${content}</div>
</body>
</html>`;
}

function confirmPage(action: "approved" | "denied", email: string) {
  const isApproved = action === "approved";
  return shell(
    isApproved ? "User Approved" : "User Denied",
    `<span class="badge ${action}">${isApproved ? "Approved" : "Denied"}</span>
     <h1>${isApproved ? "Account approved" : "Account denied"}</h1>
     <p><strong>${email}</strong> has been ${action}.<br>${isApproved ? "They'll receive a welcome email with a link to sign in." : "They'll see a notice when they visit the site."}</p>`
  );
}

function invalidPage(message: string) {
  return shell(
    "Invalid Link",
    `<span class="badge invalid">Invalid</span>
     <h1>Link unavailable</h1>
     <p>${message}</p>`
  );
}

function approvedEmailHtml(email: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">
        <tr>
          <td style="background:#faf8f5;border-bottom:1px solid #e7e5e4;padding:24px 32px;text-align:center;">
            <span style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#1c1917;">Life Sentinel</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;text-align:center;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:50%;font-size:22px;margin-bottom:20px;">✓</div>
            <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:22px;font-weight:600;color:#1c1917;">Your account is ready</h2>
            <p style="margin:0 0 8px;font-size:15px;color:#78716c;line-height:1.6;">Welcome to Life Sentinel, <strong style="color:#1c1917;">${email}</strong>.</p>
            <p style="margin:0 0 28px;font-size:15px;color:#78716c;line-height:1.6;">Your account has been approved. Sign in to start building your family's peace of mind.</p>
            <a href="https://lifesentinelfamily.com/login" style="display:inline-block;background:#d97706;color:#ffffff;font-family:system-ui,sans-serif;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;">Sign in to Life Sentinel →</a>
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
