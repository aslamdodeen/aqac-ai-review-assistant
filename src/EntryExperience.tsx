import { useEffect, useState } from 'react'
import App from './App'
import './entry-experience.css'

export default function EntryExperience() {
  const [route, setRoute] = useState(location.hash.slice(1) || 'landing')
  const [demo, setDemo] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const legacy = new URLSearchParams(location.search).get('legacy') === '1'
  useEffect(() => {
    const onRoute = () => { setRoute(location.hash.slice(1) || 'landing'); setMessage('') }
    window.addEventListener('hashchange', onRoute)
    return () => window.removeEventListener('hashchange', onRoute)
  }, [])
  const go = (next: string) => { location.hash = next; setRoute(next) }
  const enterDemo = () => { setDemo(true); go('WF02') }
  const leaveDemo = () => { setDemo(false); go('landing') }
  // UI-only demonstration: never use this flag as production authorization.
  // The backend must authenticate and authorize every protected resource.
  if (legacy) return <App />
  if (demo && route !== 'landing' && route !== 'login') return <App onExitDemo={leaveDemo} />
  const login = route !== 'landing'
  return <div className="entry-site" dir="rtl">
    <a className="entry-skip" href="#entry-main" onClick={e => { e.preventDefault(); document.getElementById('entry-main')?.focus() }}>تخطي إلى المحتوى</a>
    <header className="entry-header">
      <button className="entry-brand" onClick={() => go('landing')} aria-label="AQAC AI — الرئيسية"><span className="entry-brand-mark"><img src="/assets/aqac-logo.png" alt="" /></span><span><b dir="ltr">AQAC <span>AI</span></b><small>مساعد مراجعة الاعتماد</small></span></button>
      {login ? <button className="entry-text-button" onClick={() => go('landing')}>العودة للرئيسية</button> : <button className="entry-text-button" onClick={() => go('login')}>تسجيل الدخول <span aria-hidden="true">←</span></button>}
    </header>
    <main id="entry-main" tabIndex={-1} className={login ? 'entry-login-layout' : 'entry-public-main'}>
      {login ? <>
        <section className="entry-login-card" aria-labelledby="entry-login-title"><h2 id="entry-login-title">تسجيل الدخول</h2><p>استخدم بيانات حسابك المؤسسي.</p>
          <form onSubmit={e => { e.preventDefault(); e.currentTarget.reset(); setMessage('تسجيل الدخول الحقيقي غير موصول في هذه النسخة. استخدم «دخول تجريبي» لمعاينة المسار، دون بيانات حسابك.') }}>
            <label htmlFor="entry-email">البريد الإلكتروني</label><input id="entry-email" name="email" type="email" autoComplete="username" dir="ltr" placeholder="name@university.edu" required aria-describedby="entry-demo-note" />
            <label htmlFor="entry-password">كلمة المرور</label><div className="entry-password"><input id="entry-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required dir="ltr" aria-describedby="entry-demo-note" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-pressed={showPassword}>{showPassword ? 'إخفاء' : 'إظهار'}</button></div>
            <button type="submit" className="entry-primary entry-full">تسجيل الدخول</button>
            {message && <p className="entry-form-message" role="status">{message}</p>}
          </form>
          <div className="entry-demo-notice" id="entry-demo-note"><b>هذه معاينة للتصميم</b><p>لا تُدخل بيانات حسابك الحقيقية. الدخول المؤسسي يحتاج ربطًا بخدمة المصادقة.</p><button className="entry-secondary entry-full" onClick={enterDemo}>دخول تجريبي بدون بيانات <span aria-hidden="true">←</span></button></div>
        </section>
        <div className="entry-login-intro"><span className="entry-eyebrow">مساحة عمل مؤسستك</span><h1>أكمل من حيث<br />توقّف فريقك.</h1><p>تابع تقييمات البرامج، واربط الدراسة الذاتية والأدلة بكل دورة مراجعة.</p><div className="entry-login-note">بعد الدخول، تبدأ من قائمة التقييمات لتتابع عملًا قائمًا أو تنشئ تقييمًا جديدًا.</div></div>
      </> : <>
        <section className="entry-hero" aria-labelledby="entry-title"><div className="entry-hero-copy"><span className="entry-eyebrow">لمراجعة ملفات الاعتماد الأكاديمي</span><h1 id="entry-title">رتّب أدلتك.<br /><em>راجع بثقة.</em></h1><p>مساحة واحدة لتنظيم الدراسة الذاتية والأدلة، ومراجعة الملاحظات قبل إعداد التقرير الداخلي.</p><div className="entry-hero-actions"><button className="entry-primary" onClick={() => go('login')}>الدخول إلى مساحة العمل <span aria-hidden="true">←</span></button></div><span className="entry-reassurance">مساعدة ذكية، مع بقاء القرار النهائي بيد المراجع.</span></div>
        <div className="entry-product-scene"><div className="entry-product-window"><header><span>مساحة مراجعة البرنامج</span><small>مثال توضيحي</small></header><div className="entry-product-body"><span className="entry-mini-label">الدراسة الذاتية والأدلة</span><h2>كل ملاحظة، بجانب مصدرها.</h2><div className="entry-document"><span aria-hidden="true">≡</span><div><b>خطة التحسين</b><p>دليل مرتبط بمتطلب المراجعة</p></div><span className="entry-file-type" dir="ltr">PDF</span></div><div className="entry-source-lines" aria-hidden="true"><i /><i /><i /></div><div className="entry-review-example"><span>بحاجة إلى مراجعة بشرية</span><p>هل تدعم الأدلة المرفقة تنفيذ إجراءات التحسين؟</p></div><div className="entry-source-link">المتطلب ← الدليل ← ملاحظة قابلة للمراجعة</div></div></div><p className="entry-scene-caption">تصوّر توضيحي للمراجعة، وليس نتيجة تقييم فعلية.</p></div></section>
        <section className="entry-how" aria-labelledby="entry-how-title"><div className="entry-how-heading"><h2 id="entry-how-title">مسار واضح من الملف إلى التقرير</h2><p>كل خطوة تقرّبك من مراجعة مكتملة وواضحة.</p></div><ol><li><span>01</span><div><h3>جهّز ملف البرنامج</h3><p>حدّد الجامعة والبرنامج والدورة، ثم أضف الدراسة الذاتية والأدلة.</p></div></li><li><span>02</span><div><h3>راجع الملاحظات ومصادرها</h3><p>تتبّع ما يحتاج انتباهك وارجع إلى الدليل المرتبط به.</p></div></li><li><span>03</span><div><h3>اعتمد التقرير الداخلي</h3><p>أكّد أو عدّل المخرجات بشريًا قبل تصدير التقرير.</p></div></li></ol></section>
      </>}
    </main>
    <footer className="entry-footer"><span>أداة مساعدة للمراجعة، وليست جهة تمنح الاعتماد.</span><a href="?legacy=1#WF01">عرض النسخة السابقة</a></footer>
  </div>
}
