import { useState } from "react"
import "./intro-preview.css"

export default function IntroPreview({ navigate }: { navigate: (id: string) => void }) {
  const [detail, setDetail] = useState(false)
  return (
    <div className="intro-concept">
      <div className="concept-toolbar">
        <span>معاينة تصميم · لم يُعتمد بعد</span>
        <a href="/#WF01">العودة للتصميم السابق ↗</a>
      </div>
      <section className="concept-hero" aria-labelledby="concept-title">
        <div className="concept-copy">
          <div className="concept-eyebrow"><span /> مساعد مراجعة الاعتماد الأكاديمي</div>
          <h1 id="concept-title">من أدلة متفرقة<br />إلى <em>مراجعة واضحة.</em></h1>
          <p className="concept-description">جهّز الدراسة الذاتية، نظّم الأدلة، وتتبّع الملاحظات قبل المراجعة البشرية. كل ذلك في مساحة واحدة.</p>
          <div className="concept-actions">
            <button className="button" onClick={() => navigate("WF03")}>ابدأ تقييمًا جديدًا <span aria-hidden="true">←</span></button>
            <button className="concept-link" onClick={() => navigate("WF02")}>عرض التقييمات</button>
          </div>
          <p className="concept-trust">يدعم قرار المراجع، ولا يستبدله.</p>
        </div>
        <div className="concept-stage">
          <article className="concept-example" aria-label="مثال توضيحي لمراجعة مؤشر">
            <header><span className="concept-example-label">داخل مساحة المراجعة</span><span className="concept-demo">مثال توضيحي</span></header>
            <div className="concept-example-body">
              <span className="concept-overline">التقييم الذاتي والتحسين</span>
              <h2>من المتطلب إلى الدليل</h2>
              <p>تتبّع الملاحظة، وافتح مصدرها، ثم راجعها.</p>
              <div className="concept-trace">
                <section><span className="concept-dot" /><small>المتطلب</small><h3>توثيق متابعة خطة التحسين</h3><p>إجراءات واضحة وأدلة تدعم تنفيذها.</p></section>
                <section><span className="concept-dot" /><small>الدليل المرتبط</small><button className="concept-source" aria-expanded={detail} aria-controls="concept-source-detail" onClick={() => setDetail(!detail)}><span><b>خطة التحسين.pdf</b><small>مستند توضيحي · غير مرتبط بتقييم فعلي</small></span><span aria-hidden="true">{detail ? "−" : "+"}</span></button>{detail && <p className="concept-source-detail" id="concept-source-detail">مثال: تتضمن الخطة الإجراءات والمسؤوليات. يحتاج المراجع إلى التحقق من وجود أدلة التنفيذ.</p>}</section>
                <section><span className="concept-dot concept-dot-review" /><small>ملاحظة للمراجعة البشرية</small><div className="concept-review"><span className="concept-review-tag">بحاجة إلى تحقق</span><p>هل تدعم الأدلة المرفقة تنفيذ إجراءات التحسين؟</p></div></section>
              </div>
            </div>
            <footer><span className="concept-footer-dot" /> ملاحظة مرتبطة بمصدرها، وليست قرار اعتماد</footer>
          </article>
          <p className="concept-stage-caption">وضوح في المصدر. مراجعة بيد الإنسان.</p>
        </div>
      </section>
      <section className="concept-journey" aria-labelledby="concept-journey-title">
        <div className="concept-journey-heading"><h2 id="concept-journey-title">رحلة واضحة، من البداية.</h2><p>من تجهيز المدخلات إلى تقرير داخلي قابل للمراجعة.</p></div>
        <ol>
          <li><span>01</span><div><h3>جهّز المدخلات</h3><p>الدراسة الذاتية والأدلة، وفق الدليل المرتبط بالتقييم.</p></div></li>
          <li><span>02</span><div><h3>تتبّع الملاحظات</h3><p>ارجع إلى المصدر وافهم ما يحتاج استكمالًا.</p></div></li>
          <li><span>03</span><div><h3>راجع ثم صدّر</h3><p>راجع المخرجات بشريًا قبل تصدير التقرير الداخلي.</p></div></li>
        </ol>
      </section>
    </div>
  )
}
