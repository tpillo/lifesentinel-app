export type Audience = "veteran" | "veteran_family" | "civilian" | "universal";

export type StateInfo = {
  title: string;
  bullets: string[];
  howToApply: string;
  audience: Audience[];
};

export const STATE_INFO: Record<string, StateInfo> = {
  Virginia: {
    title: "Property Tax & Income Tax Benefits",
    bullets: [
      "Surviving spouse of 100% P&T veteran: full property tax exemption (no remarriage required, transferable to new primary residence)",
      "Surviving spouse of veteran who died in line of duty: full property tax exemption (updated Jan 2025)",
      "Military SBP survivor benefits: up to $40,000 state income tax subtraction (2025+)",
    ],
    howToApply: "dvs.virginia.gov",
    audience: ["veteran_family"],
  },
  Texas: {
    title: "Texas — Homestead Exemption",
    bullets: [
      "Surviving unremarried spouse of 100% P&T veteran: full homestead exemption, transferable to new homestead",
      "Surviving spouse of service member killed in line of duty: 100% homestead exemption",
    ],
    howToApply: "County Appraisal District — deadline April 30",
    audience: ["veteran_family"],
  },
  Florida: {
    title: "Florida — Homestead Exemption",
    bullets: [
      "Surviving unremarried spouse of 100% P&T veteran: full homestead exemption",
    ],
    howToApply: "County Property Appraiser",
    audience: ["veteran_family"],
  },
  "South Carolina": {
    title: "South Carolina — Property Tax Exemption",
    bullets: [
      "Surviving unremarried spouse: exemption on home + up to 5 acres (retroactive to 2022)",
    ],
    howToApply: "County Assessor",
    audience: ["veteran_family"],
  },
  Michigan: {
    title: "Michigan — Homestead Exemption",
    bullets: [
      "Surviving unremarried spouse of 100% P&T veteran: full homestead exemption",
      "No reapplication required after veteran's death (2025+)",
    ],
    howToApply: "County Assessor",
    audience: ["veteran_family"],
  },
  Maryland: {
    title: "Maryland — Property Tax Exemption",
    bullets: [
      "Surviving spouse remaining in same home: exemption continues",
      "Surviving spouse of line-of-duty death: full exemption",
    ],
    howToApply: "County Supervisor of Assessments",
    audience: ["veteran_family"],
  },
  Wisconsin: {
    title: "Wisconsin — Property Tax Credit",
    bullets: [
      "Surviving unremarried spouse: 100% refundable property tax credit",
      "Claimed on state income tax return after WDVA verification",
    ],
    howToApply: "Wisconsin Department of Veterans Affairs",
    audience: ["veteran_family"],
  },
  "North Carolina": {
    title: "North Carolina — Property Tax Exemption",
    bullets: [
      "$45,000 assessed value exemption continues for unremarried surviving spouse",
      "$2,000 annual mortgage tax credit continues",
    ],
    howToApply: "County Tax Assessor",
    audience: ["veteran_family"],
  },
  Pennsylvania: {
    title: "Pennsylvania — Property Tax Exemption",
    bullets: [
      "Full exemption if household income below $114,637 (2025 limit) — surviving spouse may qualify",
    ],
    howToApply: "County Veterans Affairs Office",
    audience: ["veteran_family"],
  },
  Oregon: {
    title: "Oregon — Property Tax Exemption",
    bullets: [
      "$26,303–$31,565 assessed value exemption continues for surviving spouse or partner",
    ],
    howToApply: "County Assessor",
    audience: ["veteran_family"],
  },
  California: {
    title: "California — Disabled Veterans' Property Tax Exemption",
    bullets: [
      "Basic exemption: reduces assessed value by $180,671 — for veterans rated 100% service-connected disabled OR rated Individual Unemployability (TDIU) and paid at the 100% rate",
      "Low-income exemption: reduces assessed value by $271,009 — same eligibility plus total household income (including VA disability compensation) under $81,131 for 2026; requires annual recertification by February 15",
      "Unremarried surviving spouse may qualify in two ways: (1) spouse of a veteran who would have qualified, or (2) spouse of a veteran who died from a service-connected injury or disease — even if the veteran was not 100% rated before death",
      "California does not offer a partial exemption for sub-100% ratings — this is an all-or-nothing benefit",
      "Apply at your county assessor's office using BOE Form 261-G; surviving spouses must reapply after the veteran's death",
    ],
    howToApply: "boe.ca.gov/proptaxes/dv_exemption.htm — county assessor's office (BOE Form 261-G)",
    audience: ["veteran_family"],
  },
};
