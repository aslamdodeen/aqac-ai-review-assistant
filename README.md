# AQAC AI Review Assistant

واجهة عربية RTL مبنية باستخدام React وTypeScript وVite، ومجهزة للنقل إلى Figma Make أو التشغيل محليًا مباشرة.

> **رسالة الحوكمة:** الذكاء الاصطناعي يساعد في التنظيم والتحليل الأولي. القرار النهائي يبقى بشريًا.

## التشغيل السريع

المتطلبات: Node.js `20.19+` وnpm.

```bash
npm ci
npm start
```

يفتح المشروع افتراضيًا على:

```text
http://localhost:5173/#landing
```

يمكن أيضًا استخدام:

```bash
npm run dev
npm run typecheck
npm run build
npm run preview
```

## النقل إلى Figma Make

اتبع التعليمات العملية في [FIGMA-MAKE-README.md](./FIGMA-MAKE-README.md).

الملفات التي يحتاجها Figma Make موجودة داخل المستودع نفسه:

- `package.json` و`package-lock.json`
- `index.html`
- `vite.config.ts` و`tsconfig.json`
- `src/`
- `public/`

لا تنسخ `node_modules/` أو `dist/`. بيئة التشغيل تنشئهما من `package.json`.

## الرحلات الموجودة

### المؤسسة التعليمية

`Landing → Login → Assessments → Setup → Evidence → Analysis → Human Review → Internal Draft Report`

### مراجع الهيئة

`Assigned Files → Eligibility/Conflict Check → Indicator & Evidence Review → Clarification → Preliminary Recommendation → Human Decision → Audit Log`

يمكن اختيار الدور من شاشة الدخول التجريبية.

## RTL وإمكانية النقل

- المستند مضبوط على العربية و`dir="rtl"`.
- الشريط الجانبي يظهر يمينًا على سطح المكتب.
- المهمة الأساسية تظهر يمينًا، ثم المحتوى المساند يسارًا.
- على الهاتف تظهر المهمة الأساسية أولًا.
- معرفات الملفات والأكواد اللاتينية معزولة باتجاه `LTR`.
- الأصول محلية داخل `public/`، ولا توجد مسارات مطلقة خاصة بالجهاز.
- خط Cairo مضمن عبر الحزمة؛ لا يعتمد على تحميل Google Fonts وقت التشغيل.

## حدود النسخة الحالية

هذه نسخة Frontend تجريبية:

- تسجيل الدخول واختيار الدور تجريبيان وليسا نظام صلاحيات حقيقيًا.
- البيانات محفوظة في المتصفح باستخدام `localStorage` و`sessionStorage`.
- لا يوجد Backend أو قاعدة بيانات أو خدمة AI حقيقية.
- مخرجات AI المعروضة أمثلة أولية غير متحققة، وقابلة للمراجعة والتعديل والرفض.
- التقرير قبل المراجعة البشرية «مسودة داخلية» وليس قرار اعتماد رسميًا.
- لا تستخدم بيانات دخول أو بيانات جامعية حقيقية داخل النموذج.

## هيكل المشروع

- `src/EntryExperience.tsx`: Landing، الدخول، واختيار الدور.
- `src/App.tsx`: رحلة المؤسسة التعليمية.
- `src/ReviewerWorkspace.tsx`: رحلة مراجع الهيئة.
- `src/wireframes.json`: بيانات العرض التجريبية.
- `src/*.css`: نظام التصميم وتنسيقات RTL.
- `public/assets/`: الشعارات والصور المستخدمة.
- `tests/`: فحوص Browser مساعدة؛ ليست Test Suite شاملة.

## التحقق قبل التسليم

```bash
npm ci
npm run typecheck
npm run build
```

يجب أن تنتهي الأوامر دون أخطاء.
