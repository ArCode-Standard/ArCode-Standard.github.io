# ArCode-Standard.github.io

<div align="center">

**الموقع الرسمي لمنظمة [ArCode Standard](https://github.com/ArCode-Standard)**

[العربية](https://arcode-standard.github.io/) · [English](https://arcode-standard.github.io/en/)

</div>

---

## ما هذا المستودع؟

موقع ثابت (Static) يعرّف منظمة **ArCode Standard**، ويعرض مشاريعها الحالية،
ومشاريعها المستقبلية، ورؤيتها وقيمها، وطريقة المساهمة.

يُنشر تلقائيًا عبر **GitHub Pages** من الفرع `main` في مجلد الجذر (`/`).

## البنية

```text
.
├── index.html              # الصفحة الرئيسية (عربية، RTL)
├── en/
│   └── index.html          # النسخة الإنجليزية (LTR)
├── assets/
│   ├── css/style.css       # التنسيقات (تخدم الاتجاهين عبر الخصائص المنطقية)
│   ├── js/main.js          # تفاعلات خفيفة بلا أي مكتبة خارجية
│   └── img/arcode.svg      # الشعار
├── .nojekyll               # تعطيل معالجة Jekyll
└── README.md
```

## التقنيات

- **HTML5 دلالي** — بدون أي إطار عمل أو مُولِّد صفحات ثابتة.
- **CSS3 حديث** — متغيّرات CSS، والخصائص المنطقية (`margin-inline`, `inset-block`)
  لخدمة اتجاهي RTL و LTR بملف تنسيق واحد، مع دعم الوضع الداكن، واستعلامات `@media`
  لتخطيط متجاوب.
- **JavaScript خالص** — بلا تبعيات: قائمة جوّال، تبديل المظهر مع الحفظ المحلي،
  عدّادات رقمية، ظهور تدريجي عند التمرير، وتلوين رابط القسم الحالي.
- **الخطوط** — Cairo للعربية و Inter للاتينية عبر Google Fonts.

## الهوية البصرية

التنسيقات مطابقة لـ [ArCode-Core](https://arcode-standard.github.io/ArCode-Core/index.html):
متغيّرات الألوان في `:root` و `[data-theme="dark"]`، والخطوط، والتدرّج اللوني، وأنصاف الأقطار
`6/8/12/16/24px` منوخة حرفيًا. لتفادي الانحراف، تُتحقّق المطابقة آليًا عبر:

```bash
node ../check_theme.js
```

### الوضع الداكن

- التبديل اليدوي عبر `data-theme="light|dark"` على `<html>` (نفس آلية ArCode-Core).
- زر التبديل يحفظ الاختيار في `localStorage` تحت المفتاح `arcode-theme`.
- سكريبت صغير داخل `<head>` يطبّق المحفوظ قبل الرسم لتفادي وميض المظهر.
- زوّار بلا JavaScript يعودون تلقائيًا إلى تفضيل النظام عبر `prefers-color-scheme`.

## الروابط الخارجية

تُستخدم روابط مطلقة إلى `https://arcode-standard.github.io/ArCode-Core/...` لأن
`ArCode-Core` مستودع مستقل داخل المؤسسة:

| الصفحة | الاستخدام |
|:--|:--|
| `ArCode-Core/index.html` | قاموس المصطلحات |
| `ArCode-Core/wiki.html` | دليل الاستخدام |
| `ArCode-Core/api.html` | واجهة API |

## التعديل

1. عدّل `index.html` (عربية) و`en/index.html` (إنجليزية) معًا حتى يبقى المحتوى متطابقًا.
2. اضبط الألوان من متغيّرات CSS في أعلى `assets/css/style.css` (كتلة `:root`).
3. سنة التذييل تُملأ تلقائيًا من JavaScript، فلا حاجة لتعديلها يدويًا.

### إضافة مشروع

أضف بطاقة داخل `<div class="cards">` في قسم «مشاريعنا»، باستخدام أحد الأصناف التالية:

| الصنف | الاستخدام |
|:--|:--|
| `tag--live` | مشروع نشط |
| `tag--dev` | قيد التطوير |
| `tag--plan` | مخطط له |

> حدّث قيمة `data-count` في قسم الأرقام إن تغيّرت الأرقام المعروضة.

## النشر

الموقع يعمل تلقائيًا بعد كل push على الفرع `main`. للتحقق من حالة النشر:

```bash
gh api repos/ArCode-Standard/ArCode-Standard.github.io/pages
```

## ملاحظات

- هذا الموقع وثيقي بالدرجة الأولى، ولا يجمع أي بيانات ولا يستخدم أي خدمة تتبع.
- الشعار واسم ArCode Standard علامتان خاصتان بمؤسسة ArCode Standard.
