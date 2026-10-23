// Validates data.js before a refresh is published. Run: node scripts/check-data.js
// Exits with code 1 on errors. Warnings (stale checks, ended promos) don't fail.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const file = path.join(__dirname, "..", "data.js");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(file, "utf8"), ctx, { filename: "data.js" });
const D = ctx.window.PHCC_DATA;

const errors = [];
const warnings = [];
const ISO = /^\d{4}-\d{2}-\d{2}$/;
// Manila date, so a GitHub runner on UTC doesn't flag this morning's checks as future dates.
const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
const daysAgo = iso => Math.round((new Date(today) - new Date(iso)) / 864e5);
const isNum = v => typeof v === "number" && Number.isFinite(v);

if (!D) { console.error("data.js did not define window.PHCC_DATA"); process.exit(1); }
if (typeof D.meta?.version !== "string") errors.push("meta.version is missing");
if (!ISO.test(D.meta?.dataAsOf || "")) errors.push("meta.dataAsOf must be YYYY-MM-DD");
else if (daysAgo(D.meta.dataAsOf) > 45) warnings.push(`meta.dataAsOf is ${daysAgo(D.meta.dataAsOf)} days old`);

const cats = new Set((D.categories || []).map(c => c.id));
const ecos = new Set((D.ecosystems || []).map(e => e.id));
const banks = new Set(Object.keys(D.banks || {}));
const LISTED = new Set(["closed", "invite"]);
// Apply links must point at the bank itself. Add a domain here when a new issuer joins the list.
const BANK_DOMAINS = ["bpi.com.ph", "bdo.com.ph", "metrobank.com.ph", "securitybank.com", "rcbccredit.com", "unionbankph.com",
  "eastwestbanker.com", "ewbconsumerlending.com", "hsbc.com.ph", "mayabank.ph", "pnb.com.ph", "chinabank.ph", "maybank.com.ph"];
const STATUSES = new Set(["open", "depositor", "offered", "closed", "invite"]);

function checkSrc(where, s) {
  if (typeof s === "string") { if (!D.sources[s]) errors.push(`${where}: unknown source key "${s}"`); return; }
  if (!s || !/^https:\/\//.test(s.url || "")) errors.push(`${where}: source needs an https url`);
  if (!s || !s.label) errors.push(`${where}: source needs a label`);
}

const ids = new Set();
for (const c of D.cards || []) {
  const w = c.id || "(card without id)";
  if (ids.has(c.id)) errors.push(`${w}: duplicate id`);
  ids.add(c.id);
  if (!STATUSES.has(c.status)) errors.push(`${w}: unknown status "${c.status}"`);
  if (!ISO.test(c.checked || "")) errors.push(`${w}: checked must be YYYY-MM-DD`);
  else if (c.checked > today) errors.push(`${w}: checked date is in the future`);
  else if (daysAgo(c.checked) > 45) warnings.push(`${w}: last checked ${daysAgo(c.checked)} days ago`);
  if (!["official", "aggregator"].includes(c.via)) errors.push(`${w}: via must be "official" or "aggregator"`);
  if (!Array.isArray(c.src) || !c.src.length) errors.push(`${w}: needs at least one source`);
  else c.src.forEach(s => checkSrc(w, s));
  if (LISTED.has(c.status)) { if (!c.closedNote) errors.push(`${w}: closed/invite cards need a closedNote`); continue; }

  if (!banks.has(c.bank)) errors.push(`${w}: bank "${c.bank}" is not in D.banks`);
  const e = c.earn || {};
  if (!["cash", "points", "miles"].includes(e.unit)) errors.push(`${w}: earn.unit must be cash, points or miles`);
  if (!isNum(e.base)) errors.push(`${w}: earn.base must be a number`);
  if (e.unit === "points" && !isNum(e.pv) && !isNum(e.toMiles)) errors.push(`${w}: points cards need pv or toMiles`);
  for (const k of Object.keys(e.cats || {})) {
    if (!cats.has(k)) errors.push(`${w}: earn.cats has unknown category "${k}"`);
    if (!isNum(e.cats[k])) errors.push(`${w}: earn.cats.${k} must be a number`);
  }
  for (const r of e.eco || []) if (!ecos.has(r.eco) || !cats.has(r.cat) || !isNum(r.rate)) errors.push(`${w}: bad eco rule ${JSON.stringify(r)}`);
  for (const r of e.rotating || []) if (!cats.has(r.cat) || !isNum(r.rate) || !Array.isArray(r.months) || !r.label) errors.push(`${w}: bad rotating rule ${JSON.stringify(r)}`);
  if (c.needsMembership && !ecos.has(c.needsMembership.eco)) errors.push(`${w}: needsMembership.eco must be an ecosystem id`);
  if (!c.apply || !/^https:\/\//.test(c.apply.url || "")) errors.push(`${w}: needs apply.url (https)`);
  else {
    const host = new URL(c.apply.url).hostname;
    if (!BANK_DOMAINS.some(d => host === d || host.endsWith("." + d))) warnings.push(`${w}: apply link host ${host} is not a known bank domain; double-check it's official`);
  }
  for (const t of e.tiers || []) if (!ecos.has(t.eco) || !cats.has(t.cat) || !Array.isArray(t.steps)) errors.push(`${w}: bad tier rule`);
  if (e.flexPick && !e.flexPick.from.every(k => cats.has(k))) errors.push(`${w}: flexPick uses an unknown category`);
  if (!isNum(c.fee?.annual) || c.fee.annual < 0) errors.push(`${w}: fee.annual must be a number >= 0`);
  if (!isNum(c.fx) || c.fx < 0 || c.fx > 5) errors.push(`${w}: fx must be a percentage between 0 and 5`);
  if (!isNum(c.apr) || c.apr <= 0) errors.push(`${w}: apr must be a positive number`);
  else if (c.apr > 3) errors.push(`${w}: apr ${c.apr}% is above the BSP 3% monthly cap; recheck`);
  if (c.minIncome != null && !isNum(c.minIncome)) errors.push(`${w}: minIncome must be a number or null`);
  if (c.age && !(Array.isArray(c.age) && c.age.length === 2)) errors.push(`${w}: age must be [min, max]`);
  if (c.naffl && !ISO.test(c.naffl.until || "")) errors.push(`${w}: naffl.until must be YYYY-MM-DD`);
  for (const p of c.promos || []) {
    if (!p.title) errors.push(`${w}: promo without a title`);
    if (p.until != null && !ISO.test(p.until)) errors.push(`${w}: promo "${p.title}" until must be YYYY-MM-DD or null`);
    else if (p.until && p.until < today) warnings.push(`${w}: promo "${p.title}" ended ${p.until}`);
    if (p.src) checkSrc(`${w} promo`, p.src);
  }
}

const open = (D.cards || []).filter(c => !LISTED.has(c.status));
const official = open.filter(c => c.via === "official").length;
console.log(`Version ${D.meta?.version}, data as of ${D.meta?.dataAsOf}`);
console.log(`${D.cards.length} cards: ${open.length} rankable (${official} checked on bank sites), ${D.cards.length - open.length} closed or invite-only`);
warnings.forEach(x => console.log("warn  " + x));
errors.forEach(x => console.log("ERROR " + x));
console.log(errors.length ? `${errors.length} error(s)` : "OK");
process.exit(errors.length ? 1 : 0);
