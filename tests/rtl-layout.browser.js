// Browser regression checks. Run against Vite with:
// await (await import('/tests/rtl-layout.browser.js')).verifyRtlLayouts()
const cases = [
  ['WF03', '.two-column', '.form-panel'],
  ['WF06', '.choices', '.recommended'],
  ['WF07', '.two-column', '.upload', 'تقرير الدراسة الذاتية'],
  ['WF09', '.two-column', '.form-panel'],
  ['WF13', '.choices', '.recommended'],
  ['WF13A', '.two-column', '.form-panel'],
  ['WF18', '.two-column', '.form-panel'],
  ['WF09A', '.browser-layout', '.standards-nav'],
  ['WF20', '.report-layout', '.report-canvas'],
  ['WF17', '.results-detail', '.critical-blockers'],
]

export async function verifyRtlLayouts(widths = [1440, 768, 390]) {
  const results = []
  const failures = []
  for (const width of widths) {
    for (const [screen, containerSelector, primarySelector, primaryText] of cases) {
      const frame = document.createElement('iframe')
      frame.title = 'RTL regression check'
      frame.style.cssText = `position:fixed;left:-20000px;top:0;width:${width}px;height:1000px;border:0;`
      try {
        const loaded = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Frame load timed out')), 10000)
          frame.onload = () => { clearTimeout(timeout); resolve() }
        })
        frame.src = `${location.origin}/?legacy=1#${screen}`
        document.body.append(frame)
        await loaded
        const win = frame.contentWindow
        const doc = frame.contentDocument
        const deadline = Date.now() + 10000
        while (!doc.querySelector(containerSelector)) {
          if (Date.now() > deadline) throw new Error('Container not rendered')
          await new Promise(resolve => setTimeout(resolve, 30))
        }
        await doc.fonts.ready
        const container = doc.querySelector(containerSelector)
        const [first, second] = container.children
        if (!first.matches(primarySelector) || (primaryText && !first.textContent.includes(primaryText)))
          throw new Error(`Primary content is not first in DOM: ${first.className}`)
        if (win.getComputedStyle(container).direction !== 'rtl')
          throw new Error('Container does not use native RTL')
        const a = first.getBoundingClientRect(), b = second.getBoundingClientRect()
        if (width > 600 && !(a.left > b.left && Math.abs(a.top - b.top) < 2))
          throw new Error(`Primary must be right of secondary: ${a.left} vs ${b.left}`)
        if (width <= 600 && !(a.top < b.top && a.bottom <= b.top + 1))
          throw new Error(`Primary must be above secondary on mobile: ${a.top} vs ${b.top}`)
        if (doc.documentElement.scrollWidth > width + 1)
          throw new Error(`Page overflow: ${doc.documentElement.scrollWidth} > ${width}`)
        for (const row of doc.querySelectorAll('.stats-grid, .assessment-stepper, .intro-workflow ol, thead tr')) {
          const children = [...row.children]
          if (children.length < 2) continue
          const a = children[0].getBoundingClientRect(), b = children[1].getBoundingClientRect()
          if (Math.abs(a.top - b.top) < 2 && a.width && b.width && !(a.left > b.left))
            throw new Error(`Existing RTL row regressed: ${row.className || row.tagName}`)
        }
        results.push({screen, width, status: 'PASS'})
      } catch (error) {
        failures.push({screen, width, error: error.message})
      } finally {
        frame.remove()
      }
    }
  }
  return {status: failures.length ? 'FAIL' : 'PASS', passed: results.length, failures, results}
}
