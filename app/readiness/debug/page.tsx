import { createClient } from "@/lib/supabase/server";

export default async function ReadinessDebugPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24 }}>Readiness Debug</h1>
        <p>Not logged in.</p>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("readiness_documents")
    .select("category,item_key,item_label,is_present,updated_at")
    .eq("user_id", user.id)
    .order("category", { ascending: true })
    .order("item_key", { ascending: true });

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Readiness Debug</h1>
      {error ? (
        <pre>{JSON.stringify(error, null, 2)}</pre>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </main>
  );
}
