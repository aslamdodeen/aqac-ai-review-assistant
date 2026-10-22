import { useState, type ReactNode } from 'react'
import './reviewer-workspace.css'

type ReviewerRoute = 'queue' | 'eligibility' | 'indicator' | 'clarification' | 'recommendation' | 'decision' | 'audit'

type NavItem = { id: ReviewerRoute; label: string; eyebrow: string }

const navItems: NavItem[] = [
  { id: 'queue', label: 'الملفات المسندة', eyebrow: '01' },
  { id: 'eligibility', label: 'فحص الملف والتكليف', eyebrow: '02' },
  { id: 'indicator', label: 'مراجعة المؤشرات', eyebrow: '03' },
  { id: 'clarification', label: 'طلبات الاستكمال', eyebrow: '04' },
  { id: 'recommendation', label: 'التوصية', eyebrow: '05' },
  { id: 'decision', label: 'حالة القرار', eyebrow: '06' },
]

function MiniIcon({ children }: { children: ReactNode }) {
  return <span className="reviewer-mini-icon" aria-hidden="true">{children}</span>
}

function Status({ tone = 'neutral', children }: { tone?: 'neutral' | 'info' | 'warning' | 'success' | 'danger'; children: ReactNode }) {
  return <span className={`reviewer-status ${tone}`}>{children}</span>
}

export default function ReviewerWorkspace({ onExitDemo }: { onExitDemo: () => void }) {
  const [route, setRoute] = useState<ReviewerRoute>('queue')
  const [conflictChecked, setConflictChecked] = useState(false)
  const [decision, setDecision] = useState('جزئي')
  const [rationale, setRationale] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [notice, setNotice] = useState('')

  const go = (next: ReviewerRoute) => {
    setRoute(next)
    setNotice('')
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  const pageTitle: Record<ReviewerRoute, [string, string]> = {
    queue: ['الملفات المسندة', 'ابدأ بما يحتاج إجراءً منك الآن'],
    eligibility: ['فحص الملف ونطاق المراجعة', 'تحقق من التكليف والوصول قبل فتح الأدلة'],
    indicator: ['مراجعة المؤشر والأدلة', 'المصدر أولًا، ثم اقتراح AI، ثم قرارك المهني'],
    clarification: ['مراجعة طلب الاستكمال', 'قارن الرد والدليل الجديد قبل استئناف التقييم'],
    recommendation: ['صياغة التوصية', 'توصية مهنية معللة وليست قرار اعتماد'],
    decision: ['حالة القرار الرسمي', 'عرض للمتابعة فقط وفق المرجع المسجل'],
    audit: ['سجل التدقيق', 'أثر زمني للنسخ والإجراءات والقرارات'],
  }

  return <div className="reviewer-app" dir="rtl">
    <a className="reviewer-skip" href="#reviewer-main">تخطي إلى المحتوى</a>
    <aside className="reviewer-sidebar" aria-label="تنقل مراجع الهيئة">
      <button className="reviewer-brand" onClick={() => go('queue')}>
        <img src="/assets/aqac-logo.png" alt="" />
        <span><b dir="ltr">AQAC <i>AI</i></b><small>مساحة المراجع</small></span>
      </button>
      <div className="reviewer-role-note"><span>الدور الحالي</span><strong>مراجع هيئة الاعتماد</strong></div>
      <nav>
        {navItems.map(item => <button key={item.id} className={route === item.id ? 'active' : ''} onClick={() => go(item.id)}>
          <span>{item.eyebrow}</span>{item.label}
        </button>)}
        <button className={route === 'audit' ? 'active' : ''} onClick={() => go('audit')}><span>↺</span>سجل التدقيق</button>
      </nav>
      <div className="reviewer-sidebar-foot"><span className="reviewer-avatar">م</span><div><strong>مراجع تجريبي</strong><small>بيانات توضيحية</small></div></div>
    </aside>

    <div className="reviewer-shell">
      <header className="reviewer-topbar">
        <div><span>مساحة المراجع</span><b> / {pageTitle[route][0]}</b></div>
        <button onClick={onExitDemo}>إنهاء التجربة</button>
      </header>
      <main id="reviewer-main" className="reviewer-main" tabIndex={-1}>
        <header className="reviewer-page-head">
          <div><span className="reviewer-eyebrow">مسار مراجعة بشري موثّق</span><h1>{pageTitle[route][0]}</h1><p>{pageTitle[route][1]}</p></div>
          <Status tone="info">بيانات توضيحية</Status>
        </header>
        {notice && <div className="reviewer-notice" role="status">{notice}</div>}

        {route === 'queue' && <>
          <section className="reviewer-action-strip" aria-label="ملخص المهام">
            <button onClick={() => go('indicator')}><span>يتطلب قرارك</span><b>6 مؤشرات</b><small>الملف <bdi dir="ltr">AQ-2026-014</bdi></small></button>
            <button onClick={() => go('clarification')}><span>رد جديد</span><b>طلب استكمال واحد</b><small>وصل اليوم 09:40</small></button>
            <button onClick={() => go('recommendation')}><span>مسودة محفوظة</span><b>توصية واحدة</b><small>تحتاج استكمال المبرر</small></button>
          </section>
          <section className="reviewer-panel reviewer-table-panel">
            <div className="reviewer-panel-head"><div><h2>قائمة العمل</h2><p>تظهر الملفات التي يسمح تكليفك الحالي بالوصول إليها فقط.</p></div><label className="reviewer-search">بحث<input aria-label="البحث في الملفات" placeholder="رقم الملف أو الجامعة" /></label></div>
            <div className="reviewer-table-wrap"><table><thead><tr><th>الملف</th><th>الجامعة والبرنامج</th><th>المطلوب</th><th>الأولوية</th><th>الإجراء</th></tr></thead><tbody>
              <tr><td><b dir="ltr">AQ-2026-014</b><small>تكليف ساري</small></td><td><b>جامعة اليرموك</b><small>هندسة البرمجيات</small></td><td><Status tone="warning">مراجعة مؤشرات</Status></td><td>مرتفعة</td><td><button className="reviewer-link" onClick={() => go('eligibility')}>فتح الملف ←</button></td></tr>
              <tr><td><b dir="ltr">AQ-2026-009</b><small>رد جديد</small></td><td><b>الجامعة الأردنية</b><small>إدارة الأعمال</small></td><td><Status tone="info">مراجعة استكمال</Status></td><td>متوسطة</td><td><button className="reviewer-link" onClick={() => go('clarification')}>مراجعة الرد ←</button></td></tr>
              <tr><td><b dir="ltr">AQ-2025-088</b><small>المراجعة مكتملة</small></td><td><b>جامعة مؤتة</b><small>علوم الحاسوب</small></td><td><Status tone="neutral">صياغة توصية</Status></td><td>عادية</td><td><button className="reviewer-link" onClick={() => go('recommendation')}>متابعة ←</button></td></tr>
            </tbody></table></div>
          </section>
        </>}

        {route === 'eligibility' && <div className="reviewer-two-col">
          <section className="reviewer-panel reviewer-primary-panel">
            <div className="reviewer-panel-head"><div><span className="reviewer-kicker" dir="ltr">AQ-2026-014</span><h2>بيانات الملف ونطاق التكليف</h2></div><Status tone="warning">بانتظار التحقق</Status></div>
            <dl className="reviewer-detail-grid"><div><dt>الجامعة</dt><dd>جامعة اليرموك</dd></div><div><dt>البرنامج</dt><dd>هندسة البرمجيات</dd></div><div><dt>دورة المراجعة</dt><dd>2026</dd></div><div><dt>نسخة الدليل</dt><dd dir="ltr">AQAC-PROG-2026.1</dd></div><div><dt>نطاق التكليف</dt><dd>المعياران الثاني والثالث</dd></div><div><dt>آخر نسخة مستلمة</dt><dd>20 أكتوبر 2026 · 10:24</dd></div></dl>
            <h3>حزمة الملف</h3>
            <ul className="reviewer-doc-list"><li><MiniIcon>▤</MiniIcon><div><b>الدراسة الذاتية</b><small>PDF · النسخة 3 · 82 صفحة</small></div><Status tone="success">متاح</Status></li><li><MiniIcon>▧</MiniIcon><div><b>فهرس الأدلة</b><small>26 دليلًا مرتبطًا</small></div><Status tone="success">متاح</Status></li></ul>
          </section>
          <aside className="reviewer-panel reviewer-decision-panel"><h2>تحقق قبل البدء</h2><p>لا تبدأ مراجعة المحتوى قبل تأكيد صلاحية الوصول واستقلالية التكليف.</p><label className="reviewer-check"><input type="checkbox" checked={conflictChecked} onChange={e => setConflictChecked(e.target.checked)} /><span><b>راجعت تعارض المصالح</b><small>لا يوجد تعارض يمنعني من مراجعة هذا الملف.</small></span></label><div className="reviewer-callout"><b>حدود الصلاحية</b><p>يمكنك تقييم الأدلة وصياغة توصية. القرار الرسمي يصدر عن الجهة المخولة.</p></div><button className="reviewer-primary" disabled={!conflictChecked} onClick={() => go('indicator')}>بدء مراجعة المؤشرات ←</button><button className="reviewer-secondary" onClick={() => setNotice('تم تسجيل إحالة الملف لمسؤول التكليف للمراجعة.')}>إحالة مشكلة في التكليف</button></aside>
        </div>}

        {route === 'indicator' && <>
          <section className="reviewer-progress"><div><span>المؤشر الحالي</span><b>12 من 24</b></div><div className="reviewer-progress-track"><i style={{ width: '50%' }} /></div><div className="reviewer-progress-actions"><button><span aria-hidden="true">→</span> المؤشر السابق</button><button onClick={() => setNotice('انتقلت إلى المؤشر التالي مع حفظ موضعك الحالي.')}>المؤشر التالي <span aria-hidden="true">←</span></button></div></section>
          <div className="reviewer-two-col reviewer-review-layout">
            <section className="reviewer-panel reviewer-primary-panel">
              <div className="reviewer-panel-head"><div><span className="reviewer-kicker">المعيار 2 · المؤشر 2.1</span><h2>تطبق الجهة آلية موثقة للمراجعة الدورية والتحسين.</h2></div><Status tone="warning">يحتاج قرارًا</Status></div>
              <div className="reviewer-evidence"><header><div><MiniIcon>PDF</MiniIcon><span><b>خطة التحسين السنوية</b><small dir="ltr">E-021 · v3 · p.8</small></span></div><button>فتح المصدر</button></header><blockquote>«تجري اللجنة تقييمًا ذاتيًا سنويًا وتوثق إجراءات التحسين ومتابعة تنفيذها...»</blockquote><footer>الملف الأصلي محفوظ · أضيف في 18 أكتوبر 2026</footer></div>
              <div className="reviewer-ai-note"><header><span>اقتراح AI غير متحقق</span><small>مرتبط بالتشغيل <bdi dir="ltr">2026-10-20-A</bdi></small></header><p>يوجد وصف لآلية المراجعة، لكن توثيق دورية التنفيذ ونتائج المتابعة غير واضح في المصدر المحدد.</p><div><b>حدود الاقتراح:</b> لم يعثر التحليل على محاضر تنفيذ مرتبطة بهذه الصفحة.</div></div>
            </section>
            <aside className="reviewer-panel reviewer-decision-panel"><span className="reviewer-kicker">قرار المراجع</span><h2>قيّم الاستيفاء بناءً على الأدلة</h2><div className="reviewer-radio-list">{['مستوفٍ','جزئي','غير مستوفٍ'].map(option => <label key={option} className={decision === option ? 'selected' : ''}><input type="radio" name="review-decision" value={option} checked={decision === option} onChange={() => setDecision(option)} /><span><b>{option}</b><small>{option === 'مستوفٍ' ? 'الدليل كافٍ ومباشر' : option === 'جزئي' ? 'توجد فجوة محددة تحتاج توثيقًا' : 'الأدلة لا تدعم الاستيفاء'}</small></span></label>)}</div><label className="reviewer-field">مبرر القرار<textarea value={rationale} onChange={e => setRationale(e.target.value)} placeholder="اربط حكمك بالمصدر وحدد الفجوة أو سبب الكفاية..." /></label><button className="reviewer-primary" disabled={rationale.trim().length < 12} onClick={() => { setNotice('حُفظ تقييم المؤشر باسم المراجع ووقت الحفظ.'); }}>حفظ تقييم المؤشر</button>{decision !== 'مستوفٍ' && <button className="reviewer-secondary" onClick={() => go('clarification')}>إنشاء طلب استكمال</button>}<small className="reviewer-form-note">الحفظ هنا لا يصدر قرار اعتماد ولا يغلق الملف.</small></aside>
          </div>
        </>}

        {route === 'clarification' && <div className="reviewer-two-col">
          <section className="reviewer-panel reviewer-primary-panel"><div className="reviewer-panel-head"><div><span className="reviewer-kicker">طلب الاستكمال <bdi dir="ltr">CL-014-03</bdi></span><h2>دورية تنفيذ خطة التحسين</h2></div><Status tone="info">وصل رد جديد</Status></div><div className="reviewer-thread"><article><header><b>طلب المراجع</b><time>18 أكتوبر · 13:10</time></header><p>يرجى إرفاق ما يثبت تنفيذ المتابعة الدورية لخطة التحسين خلال الدورة الحالية.</p></article><article className="response"><header><b>رد الجامعة</b><time>20 أكتوبر · 09:40</time></header><p>تم إرفاق محضر لجنة الجودة للربع الثالث، ويتضمن بنود المتابعة والمسؤوليات.</p></article></div><div className="reviewer-evidence compact"><header><div><MiniIcon>PDF</MiniIcon><span><b>محضر لجنة الجودة — الربع الثالث</b><small dir="ltr">E-044 · v1 · p.3–5</small></span></div><button>فتح الدليل الجديد</button></header></div></section>
          <aside className="reviewer-panel reviewer-decision-panel"><h2>هل يعالج الرد الفجوة؟</h2><p>قبول الرد لا يغلق المؤشر تلقائيًا؛ يعيدك إلى التقييم مع النسخة الجديدة.</p><button className="reviewer-primary" onClick={() => { go('indicator'); setNotice('أضيف الدليل إلى سياق المؤشر. أعد تقييم الاستيفاء الآن.') }}>كافٍ — إعادة تقييم المؤشر</button><button className="reviewer-secondary" onClick={() => setNotice('تم إنشاء متابعة مرتبطة بالطلب السابق، دون فقدان سجل الرد.')}>غير كافٍ — طلب متابعة</button><button className="reviewer-link standalone" onClick={() => go('indicator')}>العودة إلى المؤشر دون قرار</button></aside>
        </div>}

        {route === 'recommendation' && <div className="reviewer-two-col">
          <section className="reviewer-panel reviewer-primary-panel"><span className="reviewer-kicker">ملخص المراجعة</span><h2>قبل صياغة التوصية</h2><div className="reviewer-summary-grid"><div><span>المؤشرات المراجعة</span><b>24 من 24</b></div><div><span>الاستكمالات المفتوحة</span><b>0</b></div><div><span>القرارات المبررة</span><b>24</b></div></div><div className="reviewer-callout success"><b>بوابة المراجعة مكتملة</b><p>اكتملت القرارات المطلوبة لهذه المسودة. لا يعني ذلك صدور قرار اعتماد.</p></div></section>
          <aside className="reviewer-panel reviewer-decision-panel"><span className="reviewer-kicker">توصية المراجع</span><h2>اكتب توصية مهنية معللة</h2><label className="reviewer-field">نص التوصية<textarea value={recommendation} onChange={e => setRecommendation(e.target.value)} placeholder="لخّص الحكم المهني وأبرز الأدلة والفجوات..." /></label><label className="reviewer-check"><input type="checkbox" /><span><b>راجعت الإحالات والمبررات</b><small>التوصية لا تتضمن معلومات غير مرتبطة بالمصادر.</small></span></label><button className="reviewer-primary" disabled={recommendation.trim().length < 20} onClick={() => setNotice('حُفظت مسودة التوصية. الإحالة الرسمية تحتاج صلاحية وإجراءً معتمدًا.')}>حفظ مسودة التوصية</button><button className="reviewer-secondary" onClick={() => go('decision')}>معاينة حالة القرار</button></aside>
        </div>}

        {route === 'decision' && <section className="reviewer-panel reviewer-decision-status"><div className="reviewer-panel-head"><div><span className="reviewer-kicker" dir="ltr">AQ-2026-014</span><h2>مسار القرار الرسمي</h2></div><Status tone="neutral">للقراءة فقط</Status></div><div className="reviewer-decision-timeline"><div className="done"><i>✓</i><span><b>اكتملت توصية المراجع</b><small>20 أكتوبر 2026 · 15:20</small></span></div><div className="current"><i>2</i><span><b>قيد مراجعة الجهة المخولة</b><small>لم يُسجّل قرار رسمي بعد</small></span></div><div><i>3</i><span><b>تسجيل القرار</b><small>يتطلب رقم القرار وتاريخه والجهة المصدرة والمرفق</small></span></div></div><div className="reviewer-callout"><b>لا يوجد قرار رسمي مسجل</b><p>هذه الصفحة لا تمنح المراجع صلاحية إصدار القرار. ستظهر بيانات القرار هنا فقط عند ورودها من مصدر مخوّل.</p></div><button className="reviewer-secondary inline" onClick={() => go('audit')}>عرض سجل التدقيق</button></section>}

        {route === 'audit' && <section className="reviewer-panel reviewer-table-panel"><div className="reviewer-panel-head"><div><h2>سجل الأحداث</h2><p>لا تُستبدل النسخ السابقة عند إضافة دليل أو تعديل قرار.</p></div><Status tone="neutral">للقراءة فقط</Status></div><div className="reviewer-table-wrap"><table><thead><tr><th>الوقت</th><th>الفاعل</th><th>الإجراء</th><th>العنصر</th><th>الأثر</th></tr></thead><tbody><tr><td>20 أكتوبر · 15:20</td><td>المراجع</td><td>حفظ مسودة توصية</td><td dir="ltr">AQ-2026-014</td><td>إنشاء النسخة R2</td></tr><tr><td>20 أكتوبر · 11:05</td><td>المراجع</td><td>إعادة تقييم مؤشر</td><td>المؤشر 2.1</td><td>جزئي ← مستوفٍ</td></tr><tr><td>20 أكتوبر · 09:40</td><td>مسؤول الجامعة</td><td>إضافة دليل</td><td dir="ltr">E-044</td><td>إنشاء النسخة v1</td></tr><tr><td>18 أكتوبر · 13:10</td><td>المراجع</td><td>طلب استكمال</td><td dir="ltr">CL-014-03</td><td>ربط بالمؤشر 2.1</td></tr></tbody></table></div></section>}
      </main>
    </div>
  </div>
}
