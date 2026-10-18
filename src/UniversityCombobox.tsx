import { useEffect, useId, useRef, useState } from "react"
import type { University } from "./workspace"

type Props = {
  universities: University[]
  selected: University | undefined
  onChange: (university: University | undefined) => void
}

export default function UniversityCombobox({
  universities,
  selected,
  onChange,
}: Props) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState(selected?.name || "")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const matches = universities.filter((u) => u.name.includes(query.trim()))

  useEffect(() => {
    setQuery(selected?.name || "")
  }, [selected?.id, selected?.name])
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery(selected?.name || "")
      }
    }
    document.addEventListener("pointerdown", dismiss)
    return () => document.removeEventListener("pointerdown", dismiss)
  }, [selected?.name])
  useEffect(() => {
    if (open)
      document
        .getElementById(`${id}-option-${active}`)
        ?.scrollIntoView({ block: "nearest" })
  }, [active, open, id])

  function choose(university: University) {
    onChange(university)
    setQuery(university.name)
    setOpen(false)
  }

  return (
    <div className="field university-search" ref={root}>
      <label htmlFor={id}>الجامعة</label>
      <input
        id={id}
        role="combobox"
        autoComplete="off"
        placeholder="ابحث عن الجامعة"
        value={query}
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-autocomplete="list"
        aria-activedescendant={
          open && matches[active] ? `${id}-option-${active}` : undefined
        }
        onFocus={() => {
          setOpen(true)
          setActive(0)
        }}
        onBlur={(event) => {
          if (!root.current?.contains(event.relatedTarget as Node)) {
            setOpen(false)
            setQuery(selected?.name || "")
          }
        }}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
          setOpen(true)
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault()
            event.stopPropagation()
            setOpen(false)
            setQuery(selected?.name || "")
            return
          }
          if (event.key === "Tab") {
            setOpen(false)
            setQuery(selected?.name || "")
            return
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            setOpen(true)
            setActive((i) =>
              matches.length
                ? Math.max(
                    0,
                    Math.min(
                      matches.length - 1,
                      i + (event.key === "ArrowDown" ? 1 : -1),
                    ),
                  )
                : 0,
            )
          } else if (open && (event.key === "Home" || event.key === "End")) {
            event.preventDefault()
            setActive(
              event.key === "Home" ? 0 : Math.max(0, matches.length - 1),
            )
          } else if (open && event.key === "Enter" && matches[active]) {
            event.preventDefault()
            choose(matches[active])
          }
        }}
      />
      <div
        id={`${id}-options`}
        role="listbox"
        aria-label="الجامعات المصرّح بها"
        className="university-options"
        hidden={!open}
      >
        {matches.map((university, i) => (
          <button
            type="button"
            role="option"
            id={`${id}-option-${i}`}
            key={university.id}
            tabIndex={-1}
            aria-selected={selected?.id === university.id}
            className={active === i ? "highlighted" : ""}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => choose(university)}
          >
            {university.name}
          </button>
        ))}
        {!matches.length && <p role="status">لا توجد جامعات مطابقة.</p>}
      </div>
    </div>
  )
}
