// Watches GoatCounter's privacy policy and terms for changes. Run: node scripts/check-analytics-terms.js
// Compares a fingerprint of each page's policy text with analytics-terms.json and prints OK or CHANGED.
// After reading a changed page and confirming the README's privacy commitments still hold, record it with --accept.
// Exit codes: 0 unchanged (or accepted), 2 changed, 1 couldn't read a page.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const file = path.join(__dirname, "..", "analytics-terms.json");
const PAGES = {
  privacy: "https://www.goatcounter.com/help/privacy",
  terms: "https://www.goatcounter.com/help/terms",
};

// The policy sits in the first .page-code block; the docs menu and contact form around it change on their own.
function policyText(html) {
  const start = html.indexOf('<div class="page-code">');
  const end = html.indexOf("Questions or problems?", start);
  if (start < 0 || end < 0) throw new Error("page layout changed; read it by hand");
  return html.slice(start, end)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

(async () => {
  const saved = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { pages: {} };
  const now = { checked: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }), pages: {} };
  let changed = false;
  for (const [name, url] of Object.entries(PAGES)) {
    let text;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      text = policyText(await res.text());
    } catch (e) {
      console.error(`ERROR ${name}: ${e.message} (${url})`);
      process.exit(1);
    }
    const date = (text.match(/\b(\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December) \d{4})\b/) || [])[1] || null;
    const sha256 = crypto.createHash("sha256").update(text).digest("hex");
    now.pages[name] = { url, date, sha256 };
    const before = saved.pages[name];
    if (!before) console.log(`NEW     ${name}: no fingerprint on file yet (dated ${date || "?"})`);
    else if (before.sha256 !== sha256) { changed = true; console.log(`CHANGED ${name}: was dated ${before.date || "?"}, now ${date || "?"} (${url})`); }
    else console.log(`OK      ${name}: unchanged since ${saved.checked} (dated ${date || "?"})`);
  }
  if (process.argv.includes("--accept") || !Object.keys(saved.pages).length) {
    fs.writeFileSync(file, JSON.stringify(now, null, 2) + "\n");
    console.log("Recorded the current pages in analytics-terms.json");
    process.exit(0);
  }
  process.exit(changed ? 2 : 0);
})();
