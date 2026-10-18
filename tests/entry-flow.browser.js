// Entry and IA regression checks. Run from the Vite origin with:
// await (await import('/tests/entry-flow.browser.js')).verifyEntryFlow()
export async function verifyEntryFlow() {
  const failures = []
  const frame = document.createElement('iframe')
  frame.title = 'Entry flow regression check'
  frame.style.cssText = 'position:fixed;left:-20000px;top:0;width:1440px;height:1000px;border:0;'
  const waitFor = async (selector, timeout = 10000) => {
    const deadline = Date.now() + timeout
    while (!frame.contentDocument?.querySelector(selector)) {
      if (Date.now() > deadline) throw new Error(`Timed out waiting for ${selector}`)
      await new Promise(resolve => setTimeout(resolve, 30))
    }
    return frame.contentDocument.querySelector(selector)
  }
  const load = async (url) => {
    const loaded = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Frame load timed out: ${url}`)), 10000)
      frame.onload = () => { clearTimeout(timeout); resolve() }
    })
    frame.src = url
    if (!frame.isConnected) document.body.append(frame)
    await loaded
    await frame.contentDocument.fonts.ready
  }
  try {
    await load(`${location.origin}/#landing`)
    let doc = frame.contentDocument
    const landing = await waitFor('.entry-hero')
    if (doc.documentElement.dir !== 'rtl') failures.push('Landing is not native RTL')
    if (!landing.querySelector('.entry-primary')) failures.push('Landing has no primary CTA')
    if (doc.querySelector('.sidebar')) failures.push('Landing incorrectly includes workspace navigation')
    if (getComputedStyle(doc.querySelector('.entry-site')).backgroundColor === 'rgb(255, 255, 255)')
      failures.push('Landing lost the shared institutional background')

    frame.contentWindow.location.hash = 'login'
    await waitFor('.entry-login-card')
    if (doc.querySelectorAll('.entry-login-card').length !== 1) failures.push('Login must keep one focused form card')
    if (doc.querySelector('.sidebar')) failures.push('Login incorrectly includes workspace navigation')

    await load(`${location.origin}/?legacy=1#WF02`)
    await waitFor('.sidebar nav')
    doc = frame.contentDocument
    const navText = doc.querySelector('.sidebar nav')?.textContent || ''
    if (navText.includes('الصفحة التعريفية')) failures.push('Workspace repeats the public landing page')
    if (!navText.includes('التقييمات') || !navText.includes('إنشاء تقييم جديد')) failures.push('Workspace entry actions are missing')
    if (doc.querySelector('.brand')?.getAttribute('aria-label') !== 'الانتقال إلى التقييمات')
      failures.push('Workspace brand does not return to assessments')
    if (doc.documentElement.scrollWidth > 1441) failures.push('Workspace overflows at desktop width')
  } catch (error) {
    failures.push(error.message)
  } finally {
    frame.remove()
  }
  return { status: failures.length ? 'FAIL' : 'PASS', failures }
}
