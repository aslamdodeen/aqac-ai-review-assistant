export type University = {
  id: string
  name: string
  programs: string[]
}

export type InstitutionalWorkspace = {
  universityId: string | null
  canManageMultipleInstitutions: boolean
  universities: University[]
  guideVersions?: GuideVersion[]
  // Keyed by stable evidence ID, not filename. Only populated by evidence
  // processing when an actual guide-version reference is known.
  evidenceGuideReferences?: Record<string, string>
}

// Prototype fixture; production must supply this context from the authenticated
// workspace service, including the user's explicitly permitted institutions.
export const institutionalWorkspace: InstitutionalWorkspace = {
  universityId: "uj",
  canManageMultipleInstitutions: false,
  universities: [
    {
      id: "uj",
      name: "الجامعة الأردنية",
      programs: ["علوم الحاسوب", "هندسة الحاسوب", "إدارة الأعمال", "الصيدلة"],
    },
    {
      id: "just",
      name: "جامعة العلوم والتكنولوجيا الأردنية",
      programs: ["هندسة البرمجيات", "هندسة الحاسوب", "الطب", "الصيدلة"],
    },
  ],
}
import type { GuideVersion } from "./assessment"
