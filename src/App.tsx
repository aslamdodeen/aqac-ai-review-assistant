import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import wireframes from "./wireframes.json"
import {
  assignGuide,
  guideVersions as defaultGuideVersions,
  isGuideApplicable,
  loadAssessment,
  persistAssessment,
  scopeWarnings,
  type AssessmentRecord,
} from "./assessment"
import IntroPreview from "./IntroPreview"
import UniversityCombobox from "./UniversityCombobox"
import {
  institutionalWorkspace,
  type InstitutionalWorkspace,
} from "./workspace"

type Node = {
  name: string
  tag: string
  id: string
  font: string | null
  size: number | null
  children: (Node | string)[]
}
const screens = wireframes as {
  id: string
  title: string
  content: Node
}[]
const resolveScreen = (id: string) =>
  screens.find((screen) => screen.id === id) || screens[0]
const groups = [
  // The public landing page lives before authentication. Inside the workspace,
  // start with actionable assessments instead of repeating marketing content.
  { title: "مساحة العمل", icon: "grid", ids: ["WF02", "WF03", "WF04"] },
  {
    title: "إعداد التقييم",
    icon: "edit",
    ids: ["WF06", "WF07", "WF08"],
  },
  {
    title: "المتطلبات والأدلة",
    icon: "folder",
    ids: ["WF09A", "WF09", "WF10", "WF11", "WF12"],
  },
  {
    title: "التحليل والمعالجة",
    icon: "spark",
    ids: ["WF13", "WF13A", "WF14", "WF15", "WF16"],
  },
  {
    title: "النتائج والتقرير",
    icon: "chart",
    ids: ["WF17", "WF17A", "WF18", "WF19", "WF20"],
  },
]
type IconProps = {
  name?: string
  size?: number
}
function Icon({ name = "arrow", size = 20 }: IconProps) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    folder: (
      <path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    ),
    edit: (
      <>
        <path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z" />
        <path d="M13 20h8" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z" />
        <path d="m20 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v18h17M9 16v-5m5 5V7m5 9V4" />
      </>
    ),
    arrow: <path d="m14 6-6 6 6 6M8 12h13" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    file: (
      <>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
        <path d="M14 3v6h6M8 13h8M8 17h5" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    alert: (
      <>
        <path d="m12 3 10 18H2Z" />
        <path d="M12 9v5m0 3v.1" />
      </>
    ),
    bell: (
      <>
        <path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Zm5 3h4" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.file}
    </svg>
  )
}
function Button({
  children,
  onClick,
  secondary = false,
  icon,
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  secondary?: boolean
  icon?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`button ${secondary ? "secondary" : ""}`}
      onClick={onClick}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}
function IntroScreen({ navigate }: { navigate: (id: string) => void }) {
  const workflow = [
    [
      "جهّز المدخلات",
      "ارفع الدراسة الذاتية والأدلة باستخدام نسخة الدليل المرتبطة بالتقييم.",
    ],
    ["تتبّع النتائج", "كل نتيجة مرتبطة بمصدرها ونسخة القواعد المستخدمة."],
    ["راجع ثم صدّر", "أكّد النتيجة أو عدّلها أو ارفضها، ثم صدّر التقرير الداخلي."],
  ]
  return (
    <div className="intro-screen">
      <section className="intro-hero" aria-labelledby="intro-title">
        <div className="intro-copy">
          <h1 id="intro-title">اعرف جاهزية برنامجك قبل المراجعة</h1>
          <p className="intro-description">
            نظّم الدراسة الذاتية والأدلة، اربط كل نتيجة بمصدرها، وراجع المخرجات
            بشريًا قبل تصدير تقرير داخلي.
          </p>
          <div className="intro-actions">
            <Button onClick={() => navigate("WF03")}>ابدأ تقييمًا جديدًا</Button>
            <Button secondary onClick={() => navigate("WF02")}>
              عرض التقييمات
            </Button>
          </div>
          <p className="intro-trust-note">
            مصمم لدعم قرار المراجع، لا لاستبداله.
          </p>
        </div>
      </section>
      <section
        className="intro-workflow"
        aria-labelledby="intro-workflow-title"
      >
        <h2 id="intro-workflow-title">من المدخلات إلى تقرير قابل للمراجعة</h2>
        <ol>
          {workflow.map(([title, description], i) => (
            <li key={title}>
              <span className="intro-step-number" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
// Imported board children may be stored left-to-right. Normalize only the
// known split layouts to task order; native RTL places the first item on the
// right, and mobile/keyboard/screen-reader order stays the same.
const layoutReadingOrder: Record<string, string[]> = {
  "Form columns": ["Main form", "Context help"],
  "Input methods": ["Method upload", "Method guided"],
  "Upload row RTL": ["Upload | تقرير الدراسة الذاتية", "Upload | الأدلة الداعمة"],
  "Indicator workspace": ["Indicator detail", "Evidence sidepanel"],
  "Privileged settings RTL": ["Engine settings", "Governance note"],
  "Analysis choices": ["Full analysis", "Quick analysis"],
  "Human review": ["Result evidence", "Human decision"],
  "Standards browser RTL": ["Standards navigation", "Indicators list"],
}
const text = (n: Node | string): string =>
  typeof n === "string" ? n : n.children.map(text).join(" ")
const nodes = (n: Node) =>
  n.children.filter((c): c is Node => typeof c !== "string")
function tone(value: string) {
  if (/قيد المعالجة|جارٍ|جاري/.test(value)) return "processing"
  if (/قيد الإعداد|مسودة/.test(value)) return "neutral"
  if (/فشل|حرج|ناقص|مفقود|منخفضة|دون دليل|عوائق|تدخل/.test(value))
    return "danger"
  if (/جزئي|مراجعة|مراجعات|متوسطة|تحذير|مقترح|بانتظار|استكمال/.test(value))
    return "warning"
  if (/مكتمل|جاهز|قوية|عالية|تمت|مغطى|مستوف/.test(value)) return "success"
  return "neutral"
}
function Badge({ children }: { children: string }) {
  const status = statusIcon(children)
  return (
    <span className={`badge ${tone(children)} ${status ? "with-icon" : ""}`}>
      {status && <Icon name={status} size={15} />}
      {children}
    </span>
  )
}
function statusIcon(value: string) {
  if (/قيد المعالجة|جارٍ|جاري/.test(value)) return "clock"
  if (/قيد الإعداد|مسودة/.test(value)) return "edit"
  if (/تدخل|فشل/.test(value)) return "alert"
  if (/جاهز للمراجعة/.test(value)) return "file"
  if (/مكتمل/.test(value)) return "check"
  return undefined
}

function AssessmentStepper({ stage }: { stage: number }) {
  const steps = [
    ["تعريف التقييم", "الجامعة والبرنامج الأكاديمي"],
    ["تجهيز المدخلات", "رفع الدراسة الذاتية والأدلة أو استخدام الإدخال الموجّه"],
  ]
  return (
    <ol className="assessment-stepper" aria-label="مراحل إعداد التقييم">
      {steps.map(([title, description], i) => {
        const state =
          i < stage ? "completed" : i === stage ? "current" : "upcoming"
        return (
          <li
            key={title}
            className={`step ${state}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="step-marker">
              {state === "completed" ? <Icon name="check" size={17} /> : i + 1}
            </span>
            <div>
              <strong>{title}</strong>
              <p>{description}</p>
              <span className="step-state">
                {state === "completed"
                  ? "مكتمل"
                  : state === "current"
                    ? "الخطوة الحالية"
                    : "لاحقًا"}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function GuideMetadata({ assessment }: { assessment: AssessmentRecord }) {
  return (
    <dl
      className="guide-metadata"
      aria-label="بيانات الدليل المرتبط بالتقييم"
      data-guide-id={assessment.guide.id}
    >
      <div>
        <dt>نسخة الدليل</dt>
        <dd>
          {assessment.guide.name} ·{" "}
          <span dir="ltr">{assessment.guide.version}</span>{" "}
          <small dir="ltr">({assessment.guide.id})</small>
        </dd>
      </div>
      <div>
        <dt>المعايير المنطبقة</dt>
        <dd>{assessment.applicableCriteriaIds.length}</dd>
      </div>
    </dl>
  )
}

export default function App({
  workspace = institutionalWorkspace,
  onExitDemo,
}: {
  workspace?: InstitutionalWorkspace
  onExitDemo?: () => void
}) {
  const [requestedScreenId, setCurrent] = useState(
    () => resolveScreen(location.hash.slice(1)).id,
  )
  // Resolve on every render: hot reload can retain a route that was removed.
  const screen = resolveScreen(requestedScreenId)
  const current = screen.id
  const [mobile, setMobile] = useState(false)
  const [compact, setCompact] = useState(
    () => window.matchMedia("(max-width: 850px)").matches,
  )
  const drawerRef = useRef<HTMLElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  const mainShellRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("كل الحالات")
  const [tab, setTab] = useState("الكل")
  const [notice, setNotice] = useState("")
  const [modal, setModal] = useState("")
  const [values, setValues] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("aqac-draft") || "{}")
    } catch {
      return {}
    }
  })
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(
    loadAssessment,
  )
  const [managedUniversityId, setManagedUniversityId] = useState<string | null>(
    () => {
      const saved = workspace.universities.find(
        (u) => u.id === values.universityId,
      )
      return saved?.id || workspace.universityId
    },
  )
  const canManageUniversities = workspace.canManageMultipleInstitutions === true
  const university = workspace.universities.find(
    (u) =>
      u.id ===
      (canManageUniversities ? managedUniversityId : workspace.universityId),
  )
  const applicableGuides = (workspace.guideVersions || defaultGuideVersions)
    .filter(
      (guide) =>
        guide.active &&
        university &&
        isGuideApplicable(
          assessment?.guide.id === guide.id ? assessment.guide : guide,
          university.id,
          values["البرنامج الأكاديمي"],
        ),
    )
    .map((guide) =>
      assessment?.guide.id === guide.id ? assessment.guide : guide,
    )
  // A resumed assessment remains pinned even if its guide is later retired.
  const pinnedGuide =
    assessment &&
    (!values.guideVersionId || values.guideVersionId === assessment.guide.id) &&
    isGuideApplicable(
      assessment.guide,
      university?.id || "",
      values["البرنامج الأكاديمي"],
    )
      ? assessment.guide
      : undefined
  const candidateGuide =
    pinnedGuide ||
    applicableGuides.find((guide) => guide.id === values.guideVersionId) ||
    applicableGuides.find((guide) => guide.id === assessment?.guide.id) ||
    applicableGuides[0]
  const guideChoices = [...applicableGuides]
  if (pinnedGuide && !guideChoices.some((guide) => guide.id === pinnedGuide.id))
    guideChoices.unshift(pinnedGuide)
  const warnings = assessment ? scopeWarnings(assessment) : []
  const pendingGuideChange =
    current === "WF03" &&
    assessment?.evidence.length &&
    candidateGuide &&
    candidateGuide.id !== assessment.guide.id
  const pendingProgramMismatch =
    current === "WF03" &&
    assessment &&
    values["البرنامج الأكاديمي"] &&
    !isGuideApplicable(
      assessment.guide,
      university?.id || "",
      values["البرنامج الأكاديمي"],
    )
  useEffect(() => {
    if (assessment) persistAssessment(assessment)
  }, [assessment])
  useEffect(() => {
    const references = workspace.evidenceGuideReferences
    if (!assessment || !references) return
    if (
      assessment.evidence.some(
        (e) => references[e.id] && references[e.id] !== e.referencedGuideId,
      )
    ) {
      setAssessment({
        ...assessment,
        evidence: assessment.evidence.map((e) => ({
          ...e,
          referencedGuideId: references[e.id] || e.referencedGuideId,
        })),
      })
    }
  }, [assessment, workspace.evidenceGuideReferences])
  useEffect(() => {
    if (current !== "WF03") return
    const updatedValues = { ...values }
    updatedValues["الجامعة"] = university?.name || ""
    updatedValues.universityId = university?.id || ""
    if (!university?.programs.includes(updatedValues["البرنامج الأكاديمي"]))
      updatedValues["البرنامج الأكاديمي"] = ""
    if (JSON.stringify(updatedValues) !== JSON.stringify(values)) {
      setValues(updatedValues)
      localStorage.setItem("aqac-draft", JSON.stringify(updatedValues))
      return
    }
    localStorage.setItem("aqac-draft", JSON.stringify(values))
  }, [current, values, university])
  const [decision, setDecision] = useState("تأكيد النتيجة")
  const [progress, setProgress] = useState(62)
  const [uploads, setUploads] = useState<string[]>(
    () => assessment?.evidence.map((e) => e.name) || [],
  )
  const [selectedStandard, setSelectedStandard] = useState(5)
  const [addedActions, setAddedActions] = useState<string[][]>([])
  const group = groups.find((g) => g.ids.includes(current)) || groups[0]
  function go(id: string) {
    const destination = resolveScreen(id).id
    setCurrent(destination)
    location.hash = destination
    setMobile(false)
    setQuery("")
    setFilter("كل الحالات")
    setTab("الكل")
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }
  function startAssessment() {
    if (assessment) persistAssessment(assessment)
    setAssessment(null)
    setUploads([])
    localStorage.removeItem("aqac-current-assessment")
    go("WF03")
  }
  function saveAssessment() {
    if (!university || !values["البرنامج الأكاديمي"] || !candidateGuide)
      return false
    const details = {
      ...values,
      universityId: university.id,
      الجامعة: university.name,
      guideVersionId: candidateGuide.id,
    }
    const record = assignGuide(assessment, details, candidateGuide)
    setValues(details)
    setAssessment(record)
    localStorage.setItem("aqac-draft", JSON.stringify(details))
    persistAssessment(record)
    return true
  }
  function addEvidence(name: string) {
    setUploads((previous) => [...previous, name])
    setAssessment((previous) =>
      previous
        ? {
            ...previous,
            evidence: [
              ...previous.evidence,
              {
                id: crypto.randomUUID(),
                name,
                assignedGuideId: previous.guide.id,
              },
            ],
          }
        : previous,
    )
  }
  useEffect(() => {
    const media = window.matchMedia("(max-width: 850px)")
    const resize = () => {
      setCompact(media.matches)
      if (!media.matches) setMobile(false)
    }
    media.addEventListener("change", resize)
    return () => media.removeEventListener("change", resize)
  }, [])
  useLayoutEffect(() => {
    if (!mobile || !compact) return
    const drawer = drawerRef.current!
    const shell = mainShellRef.current!
    const scrollY = window.scrollY
    const savedBodyStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    }
    const htmlOverflow = document.documentElement.style.overflow
    shell.inert = true
    Object.assign(document.body.style, {
      position: "fixed",
      top: `-${scrollY}px`,
      width: "100%",
      overflow: "hidden",
    })
    document.documentElement.style.overflow = "hidden"
    drawer.scrollTop = 0
    drawerCloseRef.current?.focus({ preventScroll: true })
    const focusable = () =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input, select, textarea, [tabindex="0"]',
        ),
      ).filter((el) => el.getClientRects().length > 0)
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setMobile(false)
        return
      }
      if (event.key !== "Tab") return
      const items = focusable()
      const first = items[0],
        last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    const keepFocus = (event: FocusEvent) => {
      if (!drawer.contains(event.target as globalThis.Node))
        drawerCloseRef.current?.focus({ preventScroll: true })
    }
    document.addEventListener("keydown", keydown)
    document.addEventListener("focusin", keepFocus)
    return () => {
      document.removeEventListener("keydown", keydown)
      document.removeEventListener("focusin", keepFocus)
      shell.inert = false
      Object.assign(document.body.style, savedBodyStyle)
      document.documentElement.style.overflow = htmlOverflow
      window.scrollTo(0, scrollY)
      if (menuTriggerRef.current?.getClientRects().length)
        menuTriggerRef.current.focus({ preventScroll: true })
    }
  }, [mobile, compact])
  useEffect(() => {
    const handler = () => {
      const id = location.hash.slice(1)
      setCurrent(resolveScreen(id).id)
    }
    window.addEventListener("hashchange", handler)
    return () => window.removeEventListener("hashchange", handler)
  }, [])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(""), 4500)
    return () => clearTimeout(timer)
  }, [notice])
  useEffect(() => {
    if (current !== "WF14") return
    setProgress(62)
    const timer = setInterval(
      () => setProgress((p) => Math.min(100, p + 4)),
      800,
    )
    return () => clearInterval(timer)
  }, [current])
  useEffect(() => {
    if (!modal) return
    const previous = document.activeElement as HTMLElement | null
    const dialog = document.querySelector<HTMLDialogElement>("dialog")
    dialog?.showModal()
    return () => {
      dialog?.close()
      previous?.focus()
    }
  }, [modal])
  function exportData(label: string) {
    if (current === "WF20") {
      window.print()
      return
    }
    const blob = new Blob(
      [
        "\uFEFF" +
          screen.title +
          "\n" +
          text(screen.content) +
          (assessment
            ? `\nنسخة الدليل: ${assessment.guide.name} · ${assessment.guide.version} (${assessment.guide.id})\nالمعايير المنطبقة: ${assessment.applicableCriteriaIds.length}\nسجل التتبّع:\n${JSON.stringify(assessment, null, 2)}`
            : ""),
      ],
      { type: "text/plain;charset=utf-8" },
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${screen.title}.txt`
    link.click()
    URL.revokeObjectURL(url)
    setNotice(`تم ${label}`)
  }
  function act(label: string) {
    if (label === "تقييم جديد" || label === "ابدأ تقييمًا جديدًا") {
      startAssessment()
      return
    }
    if (label === "متابعة إلى تجهيز المدخلات" && current === "WF03") {
      if (!university) {
        setNotice("لم يتم ربط حسابك بجامعة. تواصل مع مسؤول النظام.")
        return
      }
      if (!saveAssessment()) {
        setNotice(
          values["البرنامج الأكاديمي"]
            ? "لا توجد نسخة دليل فعّالة منطبقة على البرنامج المحدد."
            : "اختر البرنامج الأكاديمي قبل المتابعة.",
        )
        return
      }
      go("WF06")
      return
    }
    if (label.includes("تصدير")) {
      exportData(label)
      return
    }
    if (label.includes("مسودة")) {
      if (current !== "WF03" || !saveAssessment())
        localStorage.setItem("aqac-draft", JSON.stringify(values))
      setNotice("تم حفظ المسودة. يمكنك استكمالها لاحقًا من سجل التقييمات.")
      return
    }
    if (label === "حفظ قرار المراجعة") {
      if (decision !== "تأكيد النتيجة" && !values["ملاحظة المراجع"]?.trim()) {
        setNotice("أضف سبب القرار قبل حفظ المراجعة.")
        return
      }
      localStorage.setItem(
        "aqac-review",
        JSON.stringify({ decision, note: values["ملاحظة المراجع"] || "" }),
      )
      setNotice("تم حفظ قرار المراجعة البشرية بنجاح.")
      return
    }
    if (/إضافة إجراء|مراجعة الاقتراحات|^مراجعة$/.test(label)) {
      setModal(label)
      return
    }
    if (/رفع دليل/.test(label)) {
      setModal("رفع دليل")
      return
    }
    if (/حفظ الإعدادات/.test(label)) {
      setNotice("تم حفظ إعدادات التشغيل.")
      go("WF13")
      return
    }
    const routes: Record<string, string> = {
      "اختيار الرفع": "WF07",
      "اختيار الإدخال الموجّه": "WF09A",
      "مراجعة المدخلات": "WF08",
      "الانتقال للتحليل": "WF13",
      "العودة للتعديل": "WF07",
      "فتح النواقص": "WF12",
      "تشغيل التحليل": "WF13",
      "بدء التحليل الكامل": "WF14",
      "تشغيل الفحص السريع": "WF15",
      "فتح الإعدادات": "WF13A",
      إلغاء: "WF13",
      "العودة للعمل اليدوي": "WF09A",
      "فتح المؤشر المحدد": "WF09",
      "فتح المعيار السادس": "WF18",
      "فتح المراجعة البشرية": "WF18",
      "العودة للنتائج": "WF17",
      "مراجعة النتائج": "WF17A",
      "فتح التقرير الكامل": "WF20",
      "عرض جميع العوائق": "WF19",
    }
    if (routes[label]) go(routes[label])
    else setNotice("تم تحديث الحالة بنجاح.")
  }
  function rowAction(label: string, row: string[]) {
    if (current === "WF02") {
      go(
        label === "التقرير"
          ? "WF20"
          : label === "عرض"
            ? "WF17"
            : label.includes("المحاولة")
              ? "WF13"
              : assessment
                ? "WF06"
                : "WF03",
      )
      return
    }
    if (current === "WF04") {
      go(label === "مقارنة" ? "WF16" : label === "استعادة" ? "WF03" : "WF20")
      return
    }
    if (current === "WF08") {
      go(label.includes("المصفوفة") ? "WF11" : "WF09")
      return
    }
    if (current === "WF10") {
      setModal(`تفاصيل الدليل · ${row[1] || row[0]}`)
      return
    }
    if (current === "WF17A") {
      go("WF18")
      return
    }
    if (current === "WF09A" || current === "WF15") {
      go("WF09")
      return
    }
    if (current === "WF07") {
      setNotice(
        label === "إلغاء"
          ? "تم إلغاء معالجة الملف."
          : "تم إرسال الملف للمعالجة.",
      )
      return
    }
    setModal("تفاصيل العنصر")
  }
  function render(n: Node | string, key: string | number = 0): ReactNode {
    if (typeof n === "string") return n
    const name = n.name
    const content = () => {
      const order = layoutReadingOrder[name]
      const priority = (child: Node | string) => {
        const index = typeof child === "string" ? -1 : order.indexOf(child.name)
        return index < 0 ? order.length : index
      }
      const children = order
        ? [...n.children].sort((a, b) => priority(a) - priority(b))
        : n.children
      return children.map((child, i) => render(child, i))
    }
    const ps = nodes(n)
    if (name === "Main form" && current === "WF03") {
      return (
        <div key={key} className="panel form-panel">
          {content()}
          {applicableGuides.length > 1 && (
            <label className="field">
              <span>نسخة الدليل</span>
              <select
                value={candidateGuide?.id || ""}
                onChange={(event) =>
                  setValues({ ...values, guideVersionId: event.target.value })
                }
                aria-describedby="guide-choice-help"
              >
                {guideChoices.map((guide) => (
                  <option key={guide.id} value={guide.id}>
                    {guide.name} · {guide.version}
                  </option>
                ))}
              </select>
              <small id="guide-choice-help">
                اختر النسخة التي سيُبنى عليها التقييم.
              </small>
            </label>
          )}
          {university && values["البرنامج الأكاديمي"] && !candidateGuide && (
            <p className="university-unlinked" role="alert">
              لا توجد نسخة دليل فعّالة متوافقة مع البرنامج المحدد.
            </p>
          )}
        </div>
      )
    }
    if (name === "Main content" && current === "WF17") {
      const stats = nodes(ps.find((c) => c.name === "Cards row RTL")!)
      const summary = nodes(ps.find((c) => c.name === "Results summary")!)
      const metric = (label: string) =>
        render(stats.find((c) => c.name === `Card | ${label}`)!, label)
      return (
        <div className="screen-content results-content" key={key}>
          <div className="results-overview">
            {metric("النتيجة الأولية")}
            {metric("مراجعات بشرية")}
          </div>
          <div className="results-detail">
            {render(
              summary.find((c) => c.name === "Critical blockers")!,
              "blockers",
            )}
            <div className="results-secondary">
              <div className="stats-grid">
                {metric("ثقة التحليل")}
                {metric("المعايير المستوفية")}
              </div>
              {render(
                summary.find((c) => c.name === "Criteria chart")!,
                "chart",
              )}
            </div>
          </div>
          {render(ps.find((c) => c.name === "Page actions RTL")!, "actions")}
        </div>
      )
    }
    if (n.tag === "p")
      return (
        <p
          key={key}
          className={n.font?.includes("Bold") ? "bold" : ""}
          style={{
            fontFamily: n.font ? `"${n.font}"` : undefined,
          }}
          dir="auto"
        >
          {content()}
        </p>
      )
    if (name === "Page heading") return null
    if (name.startsWith("Button | ")) {
      const label = name.split(" | ")[1]
      return (
        <Button
          key={key}
          disabled={
            current === "WF03" &&
            label === "متابعة إلى تجهيز المدخلات" &&
            (!university || !candidateGuide || !values["البرنامج الأكاديمي"])
          }
          onClick={() => act(label)}
          secondary={/مسودة|العودة|إلغاء|فتح الإعدادات|إضافة إجراء|مراجعة النتائج/.test(
            label,
          )}
          icon={
            label.includes("تصدير")
              ? "download"
              : /تقييم جديد|إضافة/.test(label)
                ? "plus"
                : "arrow"
          }
        >
          {label}
        </Button>
      )
    }
    if (name === "Pill") {
      const label = text(n)
      return (
        <button
          key={key}
          className={`badge clickable ${tab === label ? "selected" : ""}`}
          onClick={() => setTab(label)}
        >
          {label}
        </button>
      )
    }
    if (name.startsWith("Field | ")) {
      const label = name.split(" | ")[1]
      if (current === "WF03" && label === "الجامعة") {
        return (
          <div key={key} className="institution-university">
            {canManageUniversities ? (
              <UniversityCombobox
                universities={workspace.universities}
                selected={university}
                onChange={(selected) => {
                  setManagedUniversityId(selected?.id || null)
                  setValues((previous) => ({
                    ...previous,
                    universityId: selected?.id || "",
                    الجامعة: selected?.name || "",
                    "البرنامج الأكاديمي":
                      previous.universityId === selected?.id
                        ? previous["البرنامج الأكاديمي"]
                        : "",
                  }))
                }}
              />
            ) : (
              <label className="field">
                <span>الجامعة</span>
                <input
                  readOnly
                  value={university?.name || ""}
                  aria-describedby={
                    university ? "workspace-university-help" : undefined
                  }
                />
                {university && (
                  <small id="workspace-university-help">
                    محددة من مساحة المؤسسة
                  </small>
                )}
              </label>
            )}
            {!university && (
              <p className="university-unlinked" role="alert">
                لم يتم ربط حسابك بجامعة. تواصل مع مسؤول النظام.
              </p>
            )}
          </div>
        )
      }
      if (current === "WF03" && label === "البرنامج الأكاديمي") {
        return (
          <label key={key} className="field">
            <span>البرنامج الأكاديمي</span>
            <select
              disabled={!university || !university.programs.length}
              value={
                university?.programs.includes(values[label])
                  ? values[label]
                  : ""
              }
              onChange={(event) =>
                setValues({ ...values, [label]: event.target.value })
              }
            >
              <option value="">
                {university
                  ? "اختر البرنامج الأكاديمي"
                  : "اربط حسابك بجامعة أولًا"}
              </option>
              {university?.programs.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
            {university && !university.programs.length && (
              <small>لا توجد برامج متاحة لهذه الجامعة.</small>
            )}
          </label>
        )
      }
      const placeholder = ps[1] ? text(ps[1]) : ""
      const search = label === "بحث"
      const isArea = /استجابة|ملاحظة/.test(label)
      const hasPlaceholder = current === "WF03" && label === "نوع الدورة"
      const options = /نوع الدورة/.test(label)
        ? current === "WF03"
          ? ["اختر نوع الدورة", "أول مرة", "تجديد"]
          : ["أول مرة", "تجديد"]
        : /نسخة الدليل|نسخة القواعد/.test(label)
          ? ["دليل الاعتماد الأكاديمي 2026", "دليل الاعتماد الأكاديمي 2025"]
          : label === "وضع التحليل"
            ? ["قياسي", "خاص"]
            : label === "سياسة معالجة الملفات"
              ? ["معالجة محلية", "بيئة معتمدة"]
              : []
      return (
        <label className={`field ${search ? "search-field" : ""}`} key={key}>
          <span>{search ? "البحث في التقييمات" : label}</span>
          <div className="input-wrap">
            {search && <Icon name="search" size={18} />}
            {options.length ? (
              <select
                value={values[label] || (hasPlaceholder ? "" : options[0])}
                onChange={(e) =>
                  setValues({ ...values, [label]: e.target.value })
                }
              >
                {options.map((o, i) => (
                  <option key={o} value={hasPlaceholder && i === 0 ? "" : o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : isArea ? (
              <textarea
                placeholder={placeholder}
                value={values[label] || ""}
                onChange={(e) =>
                  setValues({ ...values, [label]: e.target.value })
                }
              />
            ) : (
              <input
                type="text"
                value={search ? query : values[label] || ""}
                placeholder={placeholder}
                onChange={(e) =>
                  search
                    ? setQuery(e.target.value)
                    : setValues({ ...values, [label]: e.target.value })
                }
              />
            )}
          </div>
        </label>
      )
    }
    if (name === "Cards row RTL" && current === "WF03")
      return <AssessmentStepper key={key} stage={0} />
    if (name === "Cards row RTL")
      return (
        <div key={key} className="stats-grid">
          {[...ps].reverse().map((c, i) => render(c, i))}
        </div>
      )
    if (name.startsWith("Card | ")) {
      const parts = ps.map(text)
      const label = parts[0] || name.split(" | ")[1]
      const isStat =
        parts.length === 2 &&
        /^(?:\d|بحسب|مرتبطة بالحالة|وفق|جاهز جزئي|تحتاج استكمال|متوسطة|غير رسمي)/.test(
          parts[1],
        )
      return (
        <div
          key={key}
          className={`card ${isStat ? "stat-card" : ""} ${tone(label)}`}
          data-card-label={label}
        >
          <div className="card-icon">
            <Icon
              name={
                statusIcon(label) ||
                (tone(label) === "danger"
                  ? "alert"
                  : tone(label) === "success"
                    ? "check"
                    : /دليل|أدلة|مصدر/.test(label)
                      ? "file"
                      : "shield")
              }
            />
          </div>
          <div className="card-copy">{content()}</div>
        </div>
      )
    }
    if (name === "Table RTL") {
      const headers = nodes(ps[0]).map(text).reverse()
      let rows = ps.slice(1).map((r) => nodes(r).map(text).reverse())
      if (current === "WF19") rows = [...rows, ...addedActions]
      if (current === "WF10")
        rows = [
          ...rows,
          ...uploads.map((f, i) => [
            `E-${61 + i}`,
            f,
            "v1",
            "تمت",
            "غير مربوط",
            "فتح",
          ]),
        ]
      rows = rows.filter(
        (r) =>
          (!query || r.join(" ").toLowerCase().includes(query.toLowerCase())) &&
          (filter === "كل الحالات" || r.includes(filter)) &&
          (tab === "الكل" ||
            !["مسودات", "تشغيلات", "تقارير"].includes(tab) ||
            r.some((v) =>
              v.includes(
                tab === "مسودات"
                  ? "مسودة"
                  : tab === "تشغيلات"
                    ? "تشغيل"
                    : "تقرير",
              ),
            )),
      )
      return (
        <section key={key} className="table-panel">
          {current === "WF02" && (
            <div className="table-title">
              <div>
                <h2>جميع التقييمات</h2>
                <span>تابع تقدم برامجك الأكاديمية</span>
              </div>
              <span className="count">{rows.length} تقييمات</span>
            </div>
          )}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((v, j) => (
                      <td key={j}>
                        {headers[j] === "الإجراء" ||
                        headers[j] === "الإجراء المقترح" ? (
                          <button
                            className="row-action"
                            onClick={() => rowAction(v, r)}
                          >
                            {v}
                            <Icon name="arrow" size={15} />
                          </button>
                        ) : /الحالة|المعالجة|الثقة|التغطية|الأولوية|المراجعة|كفاية/.test(
                            headers[j],
                          ) ? (
                          <Badge>{v}</Badge>
                        ) : j === 0 ? (
                          <span className="table-primary">{v}</span>
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && (
            <div className="empty-state">
              <Icon name="search" size={32} />
              <h3>لا توجد نتائج مطابقة</h3>
              <p>جرّب البحث باسم آخر أو تغيير الفلاتر.</p>
              <Button
                secondary
                onClick={() => {
                  setQuery("")
                  setFilter("كل الحالات")
                }}
              >
                إعادة ضبط البحث
              </Button>
            </div>
          )}
          <div className="table-footer">
            <span>
              عرض {rows.length} من {ps.length - 1} عناصر
            </span>
            <div>
              <button aria-label="الصفحة السابقة" disabled>
                <Icon name="chevron" size={16} />
              </button>
              <button className="page-number" aria-current="page">
                1
              </button>
              <button aria-label="الصفحة التالية" disabled>
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </div>
        </section>
      )
    }
    if (/Filters RTL|filters RTL/.test(name))
      return (
        <div key={key} className="filters">
          <div className="filter-fields">
            {ps
              .filter((c) => c.name.startsWith("Field"))
              .map((c, i) => render(c, i))}
            <label className="field">
              <span>الحالة</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {(current === "WF10"
                  ? ["كل الحالات", "تمت", "فشل", "غير مربوط"]
                  : [
                      "كل الحالات",
                      "قيد الإعداد",
                      "جاهز للمراجعة",
                      "قيد المعالجة",
                      "فشل التحليل",
                      "مكتمل",
                    ]
                ).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>
          {ps
            .filter(
              (c) =>
                c.name.startsWith("Button") &&
                !(current === "WF02" && c.name === "Button | تقييم جديد"),
            )
            .map((c, i) => render(c, i))}
        </div>
      )
    if (name.startsWith("Upload | "))
      return (
        <label className="upload" key={key}>
          <span className="upload-icon">
            <Icon name="upload" size={25} />
          </span>
          <strong>{name.split(" | ")[1]}</strong>
          <span>
            {text(n).replace("＋", "").replace(name.split(" | ")[1], "")}
          </span>
          <span className="upload-link">اختر ملفًا أو اسحبه هنا</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                if (f.size > 50 * 1024 * 1024)
                  setNotice("حجم الملف يتجاوز الحد المسموح: 50MB.")
                else {
                  addEvidence(f.name)
                  setNotice(`تم رفع ${f.name}`)
                }
              }
            }}
          />
        </label>
      )
    if (name === "Hero")
      return (
        <section key={key} className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="live-dot" />
              الجودة تبدأ من هنا
            </span>
            {content()}
            <div className="hero-footnote">
              <Icon name="shield" size={15} />
              نتائج داخلية أولية · القرار دائمًا بيد الإنسان
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="visual-core">
              <Icon name="shield" size={50} />
            </div>
            <div className="floating-card fc-one">
              <span className="small-icon">
                <Icon name="check" />
              </span>
              <div>
                أدلة موثّقة<small>مرتبطة بكل مؤشر</small>
              </div>
            </div>
            <div className="floating-card fc-two">
              <span className="small-icon">
                <Icon name="chart" />
              </span>
              <div>
                نتائج قابلة للمراجعة<small>تحليل أكثر وضوحًا</small>
              </div>
            </div>
          </div>
        </section>
      )
    if (name === "Standards navigation")
      return (
        <div className="standards-nav" key={key}>
          <h2>المعايير</h2>
          {ps
            .filter((c) => c.name.startsWith("Card"))
            .map((c, i) => (
              <button
                key={i}
                className={selectedStandard === i ? "active" : ""}
                onClick={() => setSelectedStandard(i)}
              >
                {text(c)}
              </button>
            ))}
        </div>
      )
    if (name === "Indicators list")
      return (
        <section className="panel" key={key}>
          <h2>
            {selectedStandard === 5
              ? "المعيار السادس · التقييم الذاتي والتحسين"
              : `المعيار ${selectedStandard + 1}`}
          </h2>
          {ps.slice(1).map((c, i) => render(c, i))}
        </section>
      )
    if (name === "Progress")
      return (
        <div className="panel processing" key={key}>
          <span className={`processing-icon ${progress === 100 ? "done" : ""}`}>
            <Icon name={progress === 100 ? "check" : "spark"} size={32} />
          </span>
          <h2>
            {progress === 100 ? "اكتمل التحليل بنجاح" : "جارٍ تحليل المؤشرات"}
          </h2>
          <p>
            {progress === 100
              ? "النتائج الأولية جاهزة للمراجعة البشرية"
              : "المرحلة 3 من 5 · مطابقة الأدلة بالمؤشرات"}
          </p>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>
            {progress}% · {progress === 100 ? "مكتمل" : "جاري المعالجة"}
          </p>
          {progress === 100 && (
            <Button onClick={() => go("WF17")}>عرض ملخص النتائج</Button>
          )}
        </div>
      )
    if (name === "Criteria chart")
      return (
        <div className="panel chart" key={key}>
          <h2>نتائج المعايير</h2>
          {[82, 74, 61, 88, 69].map((v, i) => (
            <button className="chart-row" key={i} onClick={() => go("WF17A")}>
              <span>المعيار {i + 1}</span>
              <span className="progress-track">
                <span style={{ width: `${v}%` }} />
              </span>
              <strong>{v}%</strong>
            </button>
          ))}
        </div>
      )
    if (name === "Human decision")
      return (
        <section className="panel" key={key}>
          <h2>قرار المراجع</h2>
          {ps
            .filter((c) => c.name.startsWith("Card"))
            .map((c) => {
              const label = nodes(c)[0] ? text(nodes(c)[0]) : ""
              return (
                <label
                  className={`decision ${decision === label ? "active" : ""}`}
                  key={c.id}
                >
                  <input
                    type="radio"
                    name="decision"
                    checked={decision === label}
                    onChange={() => setDecision(label)}
                  />
                  <div>{c.children.map((child, i) => render(child, i))}</div>
                </label>
              )
            })}
          {decision === "تعديل النتيجة" && (
            <label className="field">
              <span>النتيجة المعدّلة (من 1 إلى 5)</span>
              <input type="number" min="1" max="5" defaultValue="3" />
            </label>
          )}
          {ps
            .filter((c) => !c.name.startsWith("Card") && c.tag !== "p")
            .map((c, i) => render(c, i))}
        </section>
      )
    if (name === "Report tools")
      return (
        <section className="panel report-tools" key={key}>
          <h2>أقسام التقرير</h2>
          {ps
            .filter((c) => c.name.startsWith("Card"))
            .map((c) => (
              <label className="report-check" key={c.id}>
                <input type="checkbox" defaultChecked />
                {text(c).trim()}
              </label>
            ))}
          <Button icon="download" onClick={() => exportData("تصدير PDF")}>
            تصدير PDF
          </Button>
        </section>
      )
    if (name === "Action spacer")
      return <div className="action-spacer" key={key} />
    const classes: Record<string, string> = {
      "Main content": "screen-content",
      "Form columns": "two-column",
      "Main form": "panel form-panel",
      "Context help": "panel help-panel",
      "Page actions RTL": "page-actions",
      "Input methods": "two-column choices",
      "Method guided": "panel choice",
      "Method upload": "panel choice recommended",
      "Upload row RTL": "two-column",
      "Indicator workspace": "two-column",
      "Evidence sidepanel": "panel",
      "Indicator detail": "panel form-panel",
      "Standards browser RTL": "browser-layout",
      "Manual fallback": "alert-panel",
      "AI suggestion": "alert-panel",
      "Failure guidance": "alert-panel",
      "Privileged settings RTL": "two-column",
      "Governance note": "panel",
      "Engine settings": "panel form-panel",
      "Analysis choices": "two-column choices",
      "Full analysis": "panel choice recommended",
      "Quick analysis": "panel choice",
      Advanced: "alert-panel",
      "Difference detail": "panel",
      "Quick report note": "alert-panel",
      "Human review": "two-column",
      "Result evidence": "panel form-panel",
      "Results summary": "two-column",
      "Critical blockers": "panel critical-blockers",
      "Criteria note RTL": "alert-panel",
      "Report preview": "report-layout",
      "Report canvas": "panel report-canvas",
      "Result tabs RTL": "tabs",
      "History filters RTL": "tabs",
    }
    return (
      <div
        key={key}
        className={classes[name] || "content-group"}
        data-node-id={n.id}
      >
        {content()}
      </div>
    )
  }
  const pageHeading = nodes(screen.content).find(
    (n) => n.name === "Page heading",
  )
  const subtitle = pageHeading ? text(nodes(pageHeading)[1]) : ""
  return (
    <div className="app" dir="rtl" lang="ar" data-screen={current}>
      <a className="skip-link" href="#main-content" inert={mobile && compact}>
        تخطي إلى المحتوى
      </a>
      {mobile && (
        <button
          className="nav-overlay"
          aria-label="إغلاق القائمة"
          tabIndex={-1}
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        ref={drawerRef}
        id="navigation-drawer"
        className={`sidebar ${mobile ? "open" : ""}`}
        role={mobile && compact ? "dialog" : undefined}
        aria-modal={mobile && compact ? true : undefined}
        aria-label="قائمة التنقل"
        inert={compact && !mobile}
        aria-hidden={compact && !mobile ? true : undefined}
      >
        <button
          ref={drawerCloseRef}
          type="button"
          className="drawer-close"
          aria-label="إغلاق قائمة التنقل"
          onClick={() => setMobile(false)}
        >
          <Icon name="close" />
          <span>إغلاق</span>
        </button>
        <button className="brand" onClick={() => go("WF02")} aria-label="الانتقال إلى التقييمات">
          <span className="brand-mark">
            <img src="/assets/aqac-logo.png" alt="" />
          </span>
          <strong dir="ltr">
            AQAC<span> AI</span>
          </strong>
        </button>
        <div className="workspace-label">
          منصة الجودة الأكاديمية<span>مساحة العمل</span>
        </div>
        <nav aria-label="التنقل الرئيسي">
          {groups.map((g) => (
            <div className="nav-group" key={g.title}>
              <button
                className={`nav-main ${
                  group.title === g.title ? "active" : ""
                }`}
                onClick={() => go(g.ids[0])}
                aria-expanded={group.title === g.title}
                aria-controls={
                  group.title === g.title
                    ? `nav-section-${g.ids[0]}`
                    : undefined
                }
              >
                <Icon name={g.icon} />
                <span>{g.title}</span>
                <Icon name="chevron" size={14} />
              </button>
              {group.title === g.title && (
                <div className="subnav" id={`nav-section-${g.ids[0]}`}>
                  {g.ids
                    .filter((id) => id !== "WF13A")
                    .map((id) => (
                      <button
                        key={id}
                        onClick={() => go(id)}
                        className={current === id ? "selected" : ""}
                        aria-current={current === id ? "page" : undefined}
                      >
                        {screens.find((s) => s.id === id)?.title}
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="security-note">
            <Icon name="shield" />
            <div>
              نتائج داخلية أولية<small>تخضع للمراجعة البشرية</small>
            </div>
          </div>
          <div className="guide-version">
            <span className="live-dot" />
            {assessment
              ? `نسخة الدليل: ${assessment.guide.version}`
              : "نسخة الدليل: تُربط عند إنشاء التقييم"}
          </div>
          <div className="profile">
            <span>{university?.name || "الجامعة الأردنية"}</span>
            <span className="avatar">
              <img src="/assets/university-jordan.png" alt="" />
            </span>
          </div>
        </div>
      </aside>
      <div className="main-shell" ref={mainShellRef}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              ref={menuTriggerRef}
              aria-label="فتح القائمة"
              aria-expanded={mobile}
              aria-controls="navigation-drawer"
              aria-haspopup="dialog"
              onClick={() => setMobile(true)}
            >
              <Icon name="menu" />
            </button>
            <span>{group.title}</span>
            <Icon name="chevron" size={13} />
            <strong>{screen.title}</strong>
          </div>
          <div className="topbar-tools">
            <span className="demo-badge">
              <span />
              بيانات توضيحية
            </span>
            {onExitDemo && (
              <button className="demo-exit" type="button" onClick={onExitDemo}>
                إنهاء التجربة
              </button>
            )}
            <button
              className="icon-button"
              aria-label="الإشعارات"
              onClick={() => setModal("الإشعارات")}
            >
              <Icon name="bell" />
              <i />
            </button>
            <img
              className="header-avatar"
              src="/assets/profile-avatar.jpg"
              alt="مسؤول الجودة"
            />
          </div>
        </header>
        <main id="main-content">
          {current !== "WF01" && (
            <div className="page-heading">
              <div>
                <div className="page-eyebrow">
                  {group.title} <span>/</span> منصة الاعتماد الأكاديمي
                </div>
                <h1>{screen.title}</h1>
                <p>{subtitle}</p>
              </div>
              {current === "WF02" && (
                <Button onClick={startAssessment} icon="plus">
                  تقييم جديد
                </Button>
              )}
            </div>
          )}
          {["WF06", "WF07"].includes(current) && (
            <AssessmentStepper stage={1} />
          )}
          {assessment &&
            [
              "WF06",
              "WF07",
              "WF08",
              "WF09",
              "WF13",
              "WF15",
              "WF17",
              "WF17A",
              "WF18",
              "WF20",
            ].includes(current) && <GuideMetadata assessment={assessment} />}
          {["WF03", "WF06", "WF07", "WF08", "WF13", "WF17", "WF20"].includes(
            current,
          ) &&
            (warnings.length > 0 ||
              pendingGuideChange ||
              pendingProgramMismatch) && (
              <div className="scope-warning alert-panel" role="alert">
                <div>
                  <strong>اختلاف في نطاق التقييم</strong>
                  {warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                  {pendingGuideChange && (
                    <p>
                      ستتغيّر نسخة الدليل بعد إضافة أدلة. راجع توافق الأدلة قبل
                      متابعة التقييم.
                    </p>
                  )}
                  {pendingProgramMismatch && (
                    <p>البرنامج المحدد غير متوافق مع نسخة الدليل المحفوظة.</p>
                  )}
                </div>
              </div>
            )}
          {current === "WF01" ? (
            new URLSearchParams(location.search).get("intro") === "preview" ? (
              <IntroPreview
                navigate={(id) => (id === "WF03" ? startAssessment() : go(id))}
              />
            ) : (
              <IntroScreen
                navigate={(id) => (id === "WF03" ? startAssessment() : go(id))}
              />
            )
          ) : (
            render(screen.content)
          )}
          {uploads.length > 0 && current === "WF07" && (
            <div className="panel uploaded-list">
              <h2>الملفات المضافة</h2>
              {uploads.map((f, i) => (
                <p key={i}>
                  <Icon name="file" />
                  {f}
                  <Badge>تم الرفع</Badge>
                </p>
              ))}
            </div>
          )}
          {current !== "WF01" && (
            <footer className="page-footer">
              <span>
                <Icon name="shield" size={14} />
                مساحة آمنة لتنظيم الأدلة ومراجعة الجودة
              </span>
              <span dir="ltr">AQAC AI · 2026</span>
            </footer>
          )}
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Icon
            name={
              notice.includes("أضف") || notice.includes("يتجاوز")
                ? "alert"
                : "check"
            }
          />
          <span>{notice}</span>
          <button aria-label="إغلاق" onClick={() => setNotice("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {modal && (
        <dialog className="modal" dir="rtl" onCancel={() => setModal("")}>
          <div className="modal-heading">
            <h2>{modal}</h2>
            <button
              className="icon-button"
              onClick={() => setModal("")}
              aria-label="إغلاق"
            >
              <Icon name="close" />
            </button>
          </div>
          {modal === "الإشعارات" ? (
            <div className="empty-state">
              <Icon name="bell" size={32} />
              <h3>أنت على اطلاع بكل المستجدات</h3>
              <p>لا توجد إشعارات جديدة حاليًا.</p>
            </div>
          ) : modal === "إضافة إجراء" ? (
            <div className="form-panel">
              <label className="field">
                <span>الإجراء المطلوب</span>
                <input
                  placeholder="وصف مختصر للإجراء"
                  value={values.action || ""}
                  onChange={(e) =>
                    setValues({ ...values, action: e.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>المسؤول</span>
                <input
                  placeholder="اسم المسؤول أو الفريق"
                  value={values.owner || ""}
                  onChange={(e) =>
                    setValues({ ...values, owner: e.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>الموعد</span>
                <input
                  type="date"
                  value={values.due || ""}
                  onChange={(e) =>
                    setValues({ ...values, due: e.target.value })
                  }
                />
              </label>
              <Button
                disabled={!values.action?.trim()}
                onClick={() => {
                  setAddedActions([
                    ...addedActions,
                    [
                      "متوسط",
                      "6.3.1",
                      values.action,
                      values.owner || "غير معيّن",
                      values.due || "غير محدد",
                      "مطلوب",
                    ],
                  ])
                  setNotice("تمت إضافة الإجراء إلى خطة التحسين.")
                  setModal("")
                }}
              >
                حفظ الإجراء
              </Button>
            </div>
          ) : modal === "رفع دليل" ? (
            <label className="upload">
              <Icon name="upload" size={32} />
              <strong>اختر ملف الدليل</strong>
              <span>PDF · Word · Excel · صور</span>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    addEvidence(e.target.files[0].name)
                    setModal("")
                    setNotice("تم رفع الدليل وإضافته للمكتبة.")
                  }
                }}
              />
            </label>
          ) : (
            <div className="form-panel">
              <Badge>مراجعة بشرية مطلوبة</Badge>
              <h3>E-044 · خطة التقييم الدورية</h3>
              <p>المصدر: صفحة 12 · اقتراح ربط بالمؤشر 6.1.1</p>
              <blockquote>
                تجري اللجنة تقييمًا ذاتيًا سنويًا للبرنامج، وتوثّق النتائج ضمن خطة
                التقييم الدورية.
              </blockquote>
              <div className="alert-panel">
                تحقق من تاريخ الوثيقة وكفاية الدليل قبل تأكيد الربط.
              </div>
              <div className="modal-actions">
                <Button
                  onClick={() => {
                    setModal("")
                    setNotice("تم تأكيد الربط وحفظ المراجعة البشرية.")
                  }}
                >
                  تأكيد الربط
                </Button>
                <Button
                  secondary
                  onClick={() => {
                    setModal("")
                    setNotice("تم رفض الاقتراح.")
                  }}
                >
                  رفض الاقتراح
                </Button>
              </div>
            </div>
          )}
        </dialog>
      )}
    </div>
  )
}
