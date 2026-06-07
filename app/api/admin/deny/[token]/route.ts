export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
    return html(invalidPage("This denial link is invalid or does not exist."));
  }

  if (approval.token_used_at) {
    return html(invalidPage(
      `This link has already been used. ${approval.email} is currently <strong>${approval.status}</strong>.`
    ));
  }

  const now = new Date().toISOString();

  await supabaseAdmin
    .from("signup_approvals")
    .update({ status: "denied", denied_at: now, token_used_at: now })
    .eq("id", approval.id);

  return html(confirmPage(approval.email));
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
    .denied { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .invalid { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  </style>
</head>
<body>
  <div class="card">${content}</div>
</body>
</html>`;
}

function confirmPage(email: string) {
  return shell(
    "User Denied",
    `<span class="badge denied">Denied</span>
     <h1>Account denied</h1>
     <p><strong>${email}</strong> has been denied.<br>They'll see a notice if they attempt to access Life Sentinel.</p>`
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
