import { describe, it, expect, vi } from "vitest";

// reviewCache imports supabaseAdmin at module load; generateReviews instantiates
// the Anthropic client at module load. Mock both so pure functions are testable
// without env vars or network.
vi.mock("@/lib/supabaseAdmin", () => ({ supabaseAdmin: {} }));
vi.mock("@anthropic-ai/sdk", () => ({ default: class { messages = {}; } }));

import { resolvePersona } from "@/lib/resolvePersona";
import { buildBenefitsPrompt, benefitsHashFields } from "@/lib/generateReviews";
import { computeProfileHash } from "@/lib/reviewCache";

// ── 1. resolvePersona — routing ───────────────────────────────────────────────

describe("resolvePersona — routing", () => {
  it("military_veteran → military_veteran", () => {
    expect(resolvePersona("military_veteran")).toBe("military_veteran");
  });

  it("civilian → civilian", () => {
    expect(resolvePersona("civilian")).toBe("civilian");
  });

  it("null → empty string", () => {
    expect(resolvePersona(null)).toBe("");
  });

  it("undefined → empty string", () => {
    expect(resolvePersona(undefined)).toBe("");
  });
});

// ── 2. Legacy LE/FF → civilian normalization ──────────────────────────────────

describe("resolvePersona — legacy LE/FF normalization", () => {
  it("law_enforcement resolves to civilian", () => {
    expect(resolvePersona("law_enforcement")).toBe("civilian");
  });

  it("firefighter resolves to civilian", () => {
    expect(resolvePersona("firefighter")).toBe("civilian");
  });
});

// ── 3. Cache-hash normalization ───────────────────────────────────────────────

const baseProfile = {
  state: "TX",
  marital_status: "married",
  num_dependents: 1,
  veteran_family_member: null,
  veteran_family_relationship: null,
  veteran_family_sc_death: null,
  veteran_family_disability_rating: null,
  branch: null,
  status: null,
  years_of_service: null,
  va_disability_rating: null,
  va_pt_designation: null,
  service_connected_death: null,
  department_type: null,
  career_volunteer: null,
};

describe("benefitsHashFields — cache-hash normalization", () => {
  it("law_enforcement and civilian produce the same hash", () => {
    const leHash = computeProfileHash(benefitsHashFields({ ...baseProfile, occupation_type: "law_enforcement" }));
    const civHash = computeProfileHash(benefitsHashFields({ ...baseProfile, occupation_type: "civilian" }));
    expect(leHash).toBe(civHash);
  });

  it("firefighter and civilian produce the same hash", () => {
    const ffHash = computeProfileHash(benefitsHashFields({ ...baseProfile, occupation_type: "firefighter" }));
    const civHash = computeProfileHash(benefitsHashFields({ ...baseProfile, occupation_type: "civilian" }));
    expect(ffHash).toBe(civHash);
  });

  it("military_veteran produces a different hash than civilian", () => {
    const milHash = computeProfileHash(benefitsHashFields({ ...baseProfile, occupation_type: "military_veteran" }));
    const civHash = computeProfileHash(benefitsHashFields({ ...baseProfile, occupation_type: "civilian" }));
    expect(milHash).not.toBe(civHash);
  });

  it("BENEFITS_PROMPT_VERSION is included in the hash — changing it changes the hash", () => {
    const fields = benefitsHashFields({ ...baseProfile, occupation_type: "civilian" });
    const original = computeProfileHash(fields);
    const bumped = computeProfileHash({ ...fields, _prompt_version: "9999-99-99" });
    expect(original).not.toBe(bumped);
  });

  it("hash fields include the resolved persona, not the raw occupation_type", () => {
    const fields = benefitsHashFields({ ...baseProfile, occupation_type: "law_enforcement" });
    expect(fields.occupation_type).toBe("civilian");
  });
});

// ── 4. Per-persona prompt framing ─────────────────────────────────────────────

describe("buildBenefitsPrompt — military_veteran framing", () => {
  const militaryProfile = {
    occupation_type: "military_veteran",
    state: "TX",
    branch: "Army",
    status: "veteran",
  };

  it("opens with veteran benefits advisor framing", () => {
    const prompt = buildBenefitsPrompt(militaryProfile);
    expect(prompt).toContain("veteran benefits advisor");
  });

  it("occupation label is Military Service Member / Veteran", () => {
    const prompt = buildBenefitsPrompt(militaryProfile);
    expect(prompt).toContain("Occupation: Military Service Member / Veteran");
  });

  it("does not use Civilian occupation label", () => {
    const prompt = buildBenefitsPrompt(militaryProfile);
    expect(prompt).not.toContain("Occupation: Civilian");
  });

  it("includes state accuracy constraints", () => {
    const prompt = buildBenefitsPrompt(militaryProfile);
    expect(prompt).toContain("State & Federal Benefit Amount Accuracy");
  });

  it("includes pinned DIC accuracy block", () => {
    const prompt = buildBenefitsPrompt(militaryProfile);
    expect(prompt).toContain("Critical Accuracy Requirements");
    expect(prompt).toContain("$1,699.36");
  });
});

describe("buildBenefitsPrompt — civilian framing", () => {
  const civilianProfile = {
    occupation_type: "civilian",
    state: "TX",
  };

  it("opens with survivor benefits advisor and Civilian framing", () => {
    const prompt = buildBenefitsPrompt(civilianProfile);
    expect(prompt).toContain("survivor benefits advisor");
    expect(prompt).toContain("Civilian");
  });

  it("occupation label is Civilian", () => {
    const prompt = buildBenefitsPrompt(civilianProfile);
    expect(prompt).toContain("Occupation: Civilian");
  });

  it("does not use Military Service Member / Veteran occupation label", () => {
    const prompt = buildBenefitsPrompt(civilianProfile);
    expect(prompt).not.toContain("Occupation: Military Service Member / Veteran");
  });

  it("explicitly instructs AI not to include VA/military benefits", () => {
    const prompt = buildBenefitsPrompt(civilianProfile);
    expect(prompt).toContain("Do NOT include VA/military-specific benefits like DIC, CHAMPVA, or DEA");
  });

  it("includes Social Security Survivor Benefits section", () => {
    const prompt = buildBenefitsPrompt(civilianProfile);
    expect(prompt).toContain("Social Security Survivor Benefits");
  });

  it("includes state accuracy constraints", () => {
    const prompt = buildBenefitsPrompt(civilianProfile);
    expect(prompt).toContain("State & Federal Benefit Amount Accuracy");
  });

  it("does not include the DIC accuracy block", () => {
    const prompt = buildBenefitsPrompt(civilianProfile);
    expect(prompt).not.toContain("$1,699.36");
  });
});

describe("buildBenefitsPrompt — veteran_family framing", () => {
  const vetFamilyProfile = {
    occupation_type: "civilian",
    veteran_family_member: "yes",
    veteran_family_relationship: "spouse",
    state: "TX",
  };

  it("opens with veteran benefits advisor helping a family member framing", () => {
    const prompt = buildBenefitsPrompt(vetFamilyProfile);
    expect(prompt).toContain("veteran benefits advisor");
    expect(prompt).toContain("family member of a veteran");
  });

  it("does not use Military Service Member / Veteran occupation label", () => {
    const prompt = buildBenefitsPrompt(vetFamilyProfile);
    expect(prompt).not.toContain("Occupation: Military Service Member / Veteran");
  });

  it("does not use Civilian occupation label", () => {
    const prompt = buildBenefitsPrompt(vetFamilyProfile);
    expect(prompt).not.toContain("Occupation: Civilian");
  });

  it("relationship label resolves to veteran's spouse", () => {
    const prompt = buildBenefitsPrompt(vetFamilyProfile);
    expect(prompt).toContain("veteran's spouse");
  });

  it("includes DIC in the report sections", () => {
    const prompt = buildBenefitsPrompt(vetFamilyProfile);
    expect(prompt).toContain("DIC");
  });

  it("includes pinned DIC accuracy block", () => {
    const prompt = buildBenefitsPrompt(vetFamilyProfile);
    expect(prompt).toContain("$1,699.36");
  });

  it("includes state accuracy constraints", () => {
    const prompt = buildBenefitsPrompt(vetFamilyProfile);
    expect(prompt).toContain("State & Federal Benefit Amount Accuracy");
  });
});

describe("buildBenefitsPrompt — legacy LE/FF routes to civilian framing", () => {
  it("law_enforcement profile gets civilian prompt framing", () => {
    const prompt = buildBenefitsPrompt({ occupation_type: "law_enforcement", state: "TX" });
    expect(prompt).toContain("Occupation: Civilian");
    expect(prompt).toContain("Do NOT include VA/military-specific benefits like DIC, CHAMPVA, or DEA");
  });

  it("firefighter profile gets civilian prompt framing", () => {
    const prompt = buildBenefitsPrompt({ occupation_type: "firefighter", state: "TX" });
    expect(prompt).toContain("Occupation: Civilian");
    expect(prompt).toContain("Do NOT include VA/military-specific benefits like DIC, CHAMPVA, or DEA");
  });
});

// ── 5. Profile-flag passthrough ───────────────────────────────────────────────

describe("buildBenefitsPrompt — profile flags passed through to AI", () => {
  it("va_disability_rating appears in the profile block when set", () => {
    const prompt = buildBenefitsPrompt({
      occupation_type: "military_veteran",
      va_disability_rating: "70",
    });
    expect(prompt).toContain("VA Combined Disability Rating: 70%");
  });

  it("va_disability_rating none renders as None", () => {
    const prompt = buildBenefitsPrompt({
      occupation_type: "military_veteran",
      va_disability_rating: "none",
    });
    expect(prompt).toContain("VA Combined Disability Rating: None");
  });

  it("va_pt_designation yes appears in the profile block", () => {
    const prompt = buildBenefitsPrompt({
      occupation_type: "military_veteran",
      va_pt_designation: "yes",
    });
    expect(prompt).toContain("Permanent & Total (P&T) Designation: Yes");
  });

  it("va_pt_designation pending appears in the profile block", () => {
    const prompt = buildBenefitsPrompt({
      occupation_type: "military_veteran",
      va_pt_designation: "pending",
    });
    expect(prompt).toContain("Permanent & Total (P&T) Designation: Pending");
  });

  it("service_connected_death appears in the profile block when set", () => {
    const prompt = buildBenefitsPrompt({
      occupation_type: "military_veteran",
      service_connected_death: "yes",
    });
    expect(prompt).toContain("Cause of Death Service-Connected: yes");
  });

  it("profile flags are absent from the prompt when not set", () => {
    const prompt = buildBenefitsPrompt({ occupation_type: "military_veteran" });
    expect(prompt).not.toContain("VA Combined Disability Rating");
    expect(prompt).not.toContain("Permanent & Total");
    expect(prompt).not.toContain("Cause of Death Service-Connected");
  });
});
