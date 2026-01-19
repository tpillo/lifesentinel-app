export type ReadinessDocSeed = {
  category: string;
  item_key: string;
  item_label: string;
};

export const READINESS_DOCUMENT_DEFAULTS: ReadinessDocSeed[] = [
  { category: "Identity", item_key: "identity_id", item_label: "Government ID (Driver’s License / Passport)" },
  { category: "Identity", item_key: "identity_ssn", item_label: "SSN card (or record of SSN)" },

  { category: "Legal", item_key: "legal_will", item_label: "Will" },
  { category: "Legal", item_key: "legal_poa", item_label: "Power of Attorney (POA)" },
  { category: "Legal", item_key: "legal_ahcd", item_label: "Advance Medical Directive" },

  { category: "Finance", item_key: "finance_insurance", item_label: "Insurance policies (life/home/auto)" },
  { category: "Finance", item_key: "finance_banking", item_label: "Banking overview (accounts + institutions)" },

  { category: "Property", item_key: "property_mortgage", item_label: "Mortgage / Deed info" },

  // Add/adjust to match your Step 6.10 readiness scoring
];
