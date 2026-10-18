type Criterion = {
  id: string
  title: string
  programNames?: string[]
}

type GuideAssignment = {
  assignedAt: string
  guide: GuideVersion
}

export type GuideVersion = {
  id: string
  version: string
  name: string
  active: boolean
  universityIds?: string[]
  programNames?: string[]
  criteria: Criterion[]
}

export type AssessmentRecord = {
  id: string
  createdAt: string
  details: Record<string, string>
  guide: GuideVersion
  applicableCriteriaIds: string[]
  guideHistory: GuideAssignment[]
  evidence: {
    id: string
    name: string
    assignedGuideId: string
    referencedGuideId?: string
  }[]
}

// Prototype registry. Production should provide immutable, uniquely versioned
// guide definitions and applicability rules from the institutional service.
export const guideVersions: GuideVersion[] = [
  {
    id: "aqac-2026-v1",
    version: "2026.1",
    name: "دليل الاعتماد الأكاديمي",
    active: true,
    criteria: [
      { id: "1", title: "الحوكمة" },
      { id: "2", title: "التصميم الأكاديمي" },
      { id: "3", title: "التعليم والتعلّم" },
      { id: "4", title: "أعضاء هيئة التدريس" },
      { id: "5", title: "الموارد" },
      { id: "6", title: "التقييم والتحسين" },
    ],
  },
]

export function isGuideApplicable(
  guide: GuideVersion,
  universityId: string,
  program: string,
) {
  return (
    (!guide.universityIds || guide.universityIds.includes(universityId)) &&
    (!guide.programNames || guide.programNames.includes(program)) &&
    guide.criteria.some(
      (c) => !c.programNames || c.programNames.includes(program),
    )
  )
}

export function assignGuide(
  previous: AssessmentRecord | null,
  details: Record<string, string>,
  candidate: GuideVersion,
): AssessmentRecord {
  const sameVersion = previous?.guide.id === candidate.id
  const guide = sameVersion ? previous.guide : structuredClone(candidate)
  const now = new Date().toISOString()
  return {
    ...(previous || {}),
    id: previous?.id || crypto.randomUUID(),
    createdAt: previous?.createdAt || now,
    details: { ...details },
    guide,
    applicableCriteriaIds: guide.criteria
      .filter(
        (c) =>
          !c.programNames ||
          c.programNames.includes(details["البرنامج الأكاديمي"]),
      )
      .map((c) => c.id),
    guideHistory: sameVersion
      ? previous.guideHistory
      : [
          ...(previous?.guideHistory || []),
          { assignedAt: now, guide: structuredClone(guide) },
        ],
    evidence: previous?.evidence || [],
  }
}

export function scopeWarnings(assessment: AssessmentRecord): string[] {
  const warnings: string[] = []
  if (
    !isGuideApplicable(
      assessment.guide,
      assessment.details.universityId,
      assessment.details["البرنامج الأكاديمي"],
    )
  ) {
    warnings.push(
      "البرنامج المحدد غير متوافق مع نسخة الدليل المرتبطة بالتقييم.",
    )
  }
  if (
    assessment.evidence.some(
      (e) => e.referencedGuideId && e.referencedGuideId !== assessment.guide.id,
    )
  ) {
    warnings.push(
      "تشير بعض الأدلة المرفوعة إلى نسخة دليل مختلفة عن النسخة المرتبطة بالتقييم.",
    )
  }
  if (
    assessment.evidence.some((e) => e.assignedGuideId !== assessment.guide.id)
  ) {
    warnings.push(
      "تغيّرت نسخة الدليل بعد إضافة أدلة. راجع ربط الأدلة ومتطلبات النسخة الجديدة.",
    )
  }
  return warnings
}

export function loadAssessment(): AssessmentRecord | null {
  try {
    const saved = JSON.parse(
      localStorage.getItem("aqac-current-assessment") || "null",
    )
    if (
      saved?.id &&
      saved.guide?.id &&
      Array.isArray(saved.guide.criteria) &&
      Array.isArray(saved.applicableCriteriaIds) &&
      Array.isArray(saved.evidence) &&
      Array.isArray(saved.guideHistory) &&
      saved.details &&
      saved.evidence.every(
        (e: AssessmentRecord["evidence"][number]) =>
          typeof e.name === "string" && typeof e.assignedGuideId === "string",
      )
    )
      return {
        ...saved,
        evidence: saved.evidence.map(
          (e: AssessmentRecord["evidence"][number]) => ({
            ...e,
            id: e.id || crypto.randomUUID(),
          }),
        ),
      }
  } catch {
    /* Keep older draft storage untouched. */
  }
  return null
}

export function persistAssessment(assessment: AssessmentRecord) {
  localStorage.setItem("aqac-current-assessment", JSON.stringify(assessment))
  let archive: Record<string, AssessmentRecord>
  try {
    archive = JSON.parse(localStorage.getItem("aqac-assessments") || "{}")
  } catch {
    // Preserve unreadable historical data rather than overwriting it.
    return
  }
  if (archive && typeof archive === "object" && !Array.isArray(archive)) {
    localStorage.setItem(
      "aqac-assessments",
      JSON.stringify({ ...archive, [assessment.id]: assessment }),
    )
  }
}
