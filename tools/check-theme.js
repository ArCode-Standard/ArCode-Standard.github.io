#!/usr/bin/env node
/* ==========================================================================
   فحص تطابق الهوية البصرية مع ArCode-Core
   يقارن متغيّرات CSS وخطوط الصفحة في هذا الموقع مع ملف style.css
   الخاص بصفحة قاموس ArCode-Core المنشورة.

   الاستعمال:
     node tools/check-theme.js
   ========================================================================== */
"use strict";

const https = require("https");
const fs = require("fs");
const path = require("path");

const REF_CSS = "https://arcode-standard.github.io/ArCode-Core/style.css";
const ROOT = path.join(__dirname, "..");
const LOCAL_CSS = path.join(ROOT, "assets", "css", "style.css");

let fail = 0;
const ok = (cond, msg) => {
  console.log((cond ? "  ok   " : "  FAIL ") + msg);
  if (!cond) fail++;
};

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "arcode-check-theme" } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error("HTTP " + res.statusCode + " for " + url));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      // نجمع Buffer ثم نفك الترميز: فك الترميز أثناء البث قد يُنتج U+FFFD زائفًا
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    }).on("error", reject);
  });
}

const token = (css, name, scope) => {
  const src = scope
    ? (css.match(scope) || [])[1] || ""
    : (css.match(new RegExp("^\\s*--" + name + ":", "m")) && css) || "";
  const re = new RegExp("--" + name + ":\\s*([^;]+);");
  return (src.match(re) || [])[1] ? (src.match(re)[1].trim()) : null;
};

const DARK_ATTR = /\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/;
const DARK_MEDIA = /prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([\s\S]*?)\n  \}\n\}/;

const LIGHT_TOKENS = [
  "bg", "surface", "surface-elevated", "border", "border-light",
  "text-primary", "text-secondary", "text-tertiary",
  "accent", "accent-blue", "accent-blue-light", "accent-green", "accent-orange",
  "radius", "radius-md", "radius-lg"
];
const DARK_TOKENS = [
  "bg", "surface", "surface-elevated", "border", "text-primary",
  "text-secondary", "accent-blue"
];

(async () => {
  console.log("=== 0) جلب ملف الأنماط المرجعي من ArCode-Core");
  let ref;
  try {
    ref = await fetchText(REF_CSS);
    ok(ref.length > 500, "تم جلب " + REF_CSS + " (" + ref.length + " بايت)");
  } catch (e) {
    ok(false, "تعذّر جلب المرجع: " + e.message);
    console.log("\n" + fail + " FAILURE(S)");
    process.exit(1);
  }

  const mine = fs.readFileSync(LOCAL_CSS, "utf8");

  console.log("\n=== 1) متغيّرات الألوان (الوضع الفاتح)");
  LIGHT_TOKENS.forEach((t) => {
    const a = token(ref, t), b = token(mine, t);
    ok(a === b, "--" + t + ": ref=" + a + "  local=" + b);
  });

  console.log("\n=== 2) متغيّرات الألوان (الوضع الداكن)");
  DARK_TOKENS.forEach((t) => {
    const a = token(ref, t, DARK_ATTR), b = token(mine, t, DARK_ATTR);
    ok(a === b, "dark --" + t + ": ref=" + a + "  local=" + b);
  });

  console.log("\n=== 3) التدرّج اللوني");
  const g = css => (css.match(/linear-gradient\(135deg,[^)]+\)/) || [])[0];
  ok(g(ref) === g(mine), "gradient: " + g(mine));

  console.log("\n=== 4) الوضع الداكن");
  const norm = s => s.replace(/\s+/g, "").trim();
  ok(/\[data-theme="dark"\]/.test(mine), "التبديل اليدوي عبر data-theme (كما في ArCode-Core)");
  ok(/:root:not\(\[data-theme="light"\]\)/.test(mine), "احتياطي بلا JavaScript يتبع تفضيل النظام");
  ok(
    norm(((mine.match(DARK_ATTR) || [])[1] || "")) === norm(((mine.match(DARK_MEDIA) || [])[1] || "")),
    "كتلتا الوضع الداكن متطابقتان"
  );

  console.log("\n=== 5) الخطوط في الصفحات");
  const FONT_Q = "family=Inter:wght@300;400;500;600;700;800&family=Cairo:wght@300;400;500;600;700;800";
  ["index.html", "en/index.html"].forEach((f) => {
    const h = fs.readFileSync(path.join(ROOT, f), "utf8");
    ok(h.includes(FONT_Q), f + ": يطابق استعلام خطوط ArCode-Core");
    ok(/rel="preconnect"[^>]*fonts\.gstatic\.com/.test(h), f + ": preconnect لـ fonts.gstatic.com");
  });
  ok(/--font-en:\s*["']Inter/.test(mine) && /--font-ar:\s*["']Cairo/.test(mine),
     "CSS يستخدم Inter (لاتيني) و Cairo (عربي)");

  console.log("\n=== 6) روابط القاموس");
  ["index.html", "en/index.html"].forEach((f) => {
    const h = fs.readFileSync(path.join(ROOT, f), "utf8");
    const n = (h.match(/arcode-standard\.github\.io\/ArCode-Core\/index\.html/g) || []).length;
    ok(n >= 4, f + ": روابط القاموس = " + n);
    ok(/ArCode-Core\/wiki\.html/.test(h) && /ArCode-Core\/api\.html/.test(h),
       f + ": روابط الدليل و API");
  });

  console.log("\n=== 7) سلامة النصوص");
  ["index.html", "en/index.html", "assets/css/style.css", "assets/js/main.js", "README.md"]
    .forEach((f) => {
      const t = fs.readFileSync(path.join(ROOT, f), "utf8");
      ok(!/[\u4e00-\u9fff\u3040-\u30ff\uFFFD]/.test(t), f + ": لا محارف صينية أو معطوبة");
    });

  console.log("\n" + (fail === 0 ? "ALL THEME CHECKS PASSED" : fail + " FAILURE(S)"));
  process.exit(fail ? 1 : 0);
})();
