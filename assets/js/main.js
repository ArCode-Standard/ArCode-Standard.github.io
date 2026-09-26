/* ==========================================================================
   ArCode Standard — سكربت الموقع
   لا يعتمد على أي مكتبة خارجية.
   ========================================================================== */
(function () {
  "use strict";

  var d = document;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  /* ---------- 1. قائمة الجوال ---------- */
  var burger = $(".burger");
  var nav = $("#nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // إغلاق القائمة عند اختيار رابط
    $$("#nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 2. تبديل الوضع الداكن (مع الحفظ) ---------- */
  var THEME_KEY = "arcode-theme";
  var root = d.documentElement;

  function applyTheme(mode) {
    if (mode === "light" || mode === "dark") {
      root.setAttribute("data-theme", mode);
    } else {
      root.removeAttribute("data-theme");
    }
    $$(".theme-btn").forEach(function (b) {
      b.textContent = mode === "light" ? "☀" : mode === "dark" ? "☾" : "◐";
      b.setAttribute("aria-label",
        mode === "light" ? "التبديل إلى الوضع الداكن"
        : mode === "dark" ? "التبديل إلى الوضع الفاتح"
        : "تبديل المظهر");
    });
  }

  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* تجاهل */ }
  applyTheme(saved);

  $$(".theme-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cur = root.getAttribute("data-theme");
      var next = cur === "dark" ? "light" : cur === "light" ? null : "dark";
      applyTheme(next);
      try {
        if (next) { localStorage.setItem(THEME_KEY, next); }
        else { localStorage.removeItem(THEME_KEY); }
      } catch (e) { /* تجاهل */ }
    });
  });

  /* ---------- 3. عدّاد الأرقام ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    var t0 = null;

    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      // تسارع ثم تباطؤ
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = (target % 1 === 0 ? Math.round(val).toLocaleString("en-US")
                                            : val.toFixed(1)) + suffix;
      if (p < 1) { requestAnimationFrame(frame); }
      else { el.textContent = target.toLocaleString("en-US") + suffix; }
    }
    requestAnimationFrame(frame);
  }

  var counters = $$("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(countUp);
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- 4. ظهور العناصر عند التمرير ---------- */
  var reveals = $$(".reveal");
  if (reveals.length) {
    if (!("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io2.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      reveals.forEach(function (el) { io2.observe(el); });
    }
  }

  /* ---------- 5. إبراز رابط القسم الحالي ---------- */
  var sections = $$("section[id]");
  if (sections.length && "IntersectionObserver" in window) {
    var links = {};
    $$(".nav a[href^='#']").forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });
    var io3 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
        if (links[e.target.id]) { links[e.target.id].setAttribute("aria-current", "true"); }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io3.observe(s); });
  }

  /* ---------- 6. سنة التذييل ---------- */
  $$("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- 7. نسخ مثال الكود ---------- */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = $("#" + btn.getAttribute("data-copy"));
      if (!box) return;
      var text = box.innerText;
      var done = function () {
        var old = btn.getAttribute("data-label") || btn.textContent;
        btn.setAttribute("data-label", old);
        btn.textContent = "✓ نُسخ";
        setTimeout(function () { btn.textContent = old; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
  });

  function fallback(text, cb) {
    var ta = d.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    d.body.appendChild(ta);
    ta.select();
    try { d.execCommand("copy"); cb(); } catch (e) { /* تجاهل */ }
    d.body.removeChild(ta);
  }
})();
