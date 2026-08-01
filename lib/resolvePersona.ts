// Tier 1 persona model (2026-07-31): two first-class personas — military_veteran
// and military_family. Civilian and LE/FF remain as legacy-read values only:
// the signup selector no longer offers them, but existing rows still resolve
// through here. LE/FF continue to normalize to civilian (Option B, June 2026).

export type ResolvedPersona = "military_veteran" | "military_family" | "civilian" | "";

export function resolvePersona(raw: string | null | undefined): ResolvedPersona {
  if (raw === "military_veteran") return "military_veteran";
  if (raw === "military_family") return "military_family";
  if (raw === "law_enforcement" || raw === "firefighter") return "civilian";
  if (raw === "civilian") return "civilian";
  return "";
}
