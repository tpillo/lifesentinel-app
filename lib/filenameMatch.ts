// lib/filenameMatch.ts

export type VaultFile = {
  name: string
  path?: string
  url?: string
  created_at?: string | null
  updated_at?: string | null
}

function stripExtension(value: string) {
  return value.replace(/\.[^.]+$/, "")
}

function normalizeCore(value: string) {
  return stripExtension(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’'"]/g, "")
    .replace(/\b(final|signed|scan|scanned|copy|v\d+|version\d+|new)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

function squeeze(value: string) {
  return normalizeCore(value).replace(/\s+/g, "")
}

export function normalizeFilename(value: string) {
  return normalizeCore(value)
}

export function normalizeCompact(value: string) {
  return squeeze(value)
}

export function buildAliases(label: string) {
  const base = normalizeCore(label)
  const compact = squeeze(label)

  const aliases = new Set<string>([base, compact])

  const map: Record<string, string[]> = {
    "drivers license": [
      "driver license",
      "license",
      "driverslicense",
      "driverlicense",
      "id",
      "photo id",
      "state id",
    ],
    "passport": ["us passport"],
    "social security card": [
      "ss card",
      "social security",
      "ssc",
      "socialsecuritycard",
    ],
    "birth certificate": ["birth cert", "birthcertificate"],
    "marriage certificate": ["marriage cert", "marriagecertificate"],
    "divorce decree": ["divorce", "divorce papers", "divorcedecree"],
    "will": ["last will", "last will and testament", "testament"],
    "trust": ["living trust", "revocable trust"],
    "power of attorney": ["poa", "durable power of attorney", "medical poa"],
    "advance directive": [
      "medical directive",
      "living will",
      "healthcare directive",
    ],
    "dd214": ["dd 214", "dd-214", "military discharge", "discharge papers"],
    "insurance policy": [
      "life insurance",
      "insurance",
      "policy",
      "insurancepolicy",
    ],
    "bank information": ["bank account", "banking", "bankinfo"],
    "vehicle title": ["car title", "title", "vehicletitle"],
    "deed": ["house deed", "property deed"],
  }

  for (const [key, values] of Object.entries(map)) {
    if (base === key || compact === squeeze(key)) {
      for (const v of values) {
        aliases.add(normalizeCore(v))
        aliases.add(squeeze(v))
      }
    }
  }

  return Array.from(aliases)
}

export function filenameMatchesLabel(fileName: string, label: string) {
  const fileCore = normalizeCore(fileName)
  const fileCompact = squeeze(fileName)
  const aliases = buildAliases(label)

  for (const alias of aliases) {
    if (!alias) continue

    if (fileCore === alias || fileCompact === alias) return true

    if (fileCore.includes(alias) || alias.includes(fileCore)) return true
    if (fileCompact.includes(alias) || alias.includes(fileCompact)) return true
  }

  return false
}

export function findBestFileMatch(files: VaultFile[], label: string) {
  const aliases = buildAliases(label)

  const scored = files
    .map((file) => {
      const fileCore = normalizeCore(file.name)
      const fileCompact = squeeze(file.name)

      let score = 0

      for (const alias of aliases) {
        if (!alias) continue

        if (fileCore === alias || fileCompact === alias) score = Math.max(score, 100)
        else if (fileCore.includes(alias) || alias.includes(fileCore)) score = Math.max(score, 80)
        else if (fileCompact.includes(alias) || alias.includes(fileCompact)) score = Math.max(score, 70)
      }

      return { file, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      const aDate = new Date(a.file.updated_at || a.file.created_at || 0).getTime()
      const bDate = new Date(b.file.updated_at || b.file.created_at || 0).getTime()

      if (b.score !== a.score) return b.score - a.score
      return bDate - aDate
    })

  return scored[0]?.file ?? null
}