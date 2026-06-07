// Option B identity model (June 7 2026): LE/FF are no longer first-class
// personas. At read time, law_enforcement and firefighter resolve to civilian
// so all downstream branching (prompts, pills, cache keys) treats them as
// civilian. The enum values are preserved in the DB for a potential v2 FR EAP.

export type ResolvedPersona = "military_veteran" | "civilian" | "";

export function resolvePersona(raw: string | null | undefined): ResolvedPersona {
  if (raw === "military_veteran") return "military_veteran";
  if (raw === "law_enforcement" || raw === "firefighter") return "civilian";
  if (raw === "civilian") return "civilian";
  return "";
}
