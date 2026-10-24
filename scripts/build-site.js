// Builds docs/ for GitHub Pages. Run: node scripts/build-site.js
// index.html is written for the Claude artifact, which adds the <html>/<head> wrapper at
// publish time. GitHub Pages serves files as-is, so this adds the same wrapper here, plus the
// link-preview tags, the app manifest and the offline service worker.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "docs");
const SITE = "https://klbxkra.github.io/ph-card-finder/";
const DESC = "Find, rank and compare Philippine credit cards for the way you spend, with requirements, rewards and apply links.";
// GoatCounter site code (the part before .goatcounter.com). Leave empty to turn visit counting off.
// Only fill in a code you have registered yourself: anyone who owns a code receives its counts.
const GOATCOUNTER = "";
const page = fs.readFileSync(path.join(root, "index.html"), "utf8");

// Everything before the first <style> (title, meta, font links) belongs in <head>.
const cut = page.indexOf("<style>");
const headExtra = cut > 0 ? page.slice(0, cut) : "";
const body = cut > 0 ? page.slice(cut) : page;

// Visit counting, only when a code is set. It counts page loads and nothing else: the page path
// without its #view or query string, the referring site's address without its path, the title,
// and screen width. It sets no cookies and reads none of the answers. vendor/goatcounter-count.js
// is GoatCounter's own script, checked in so it can't change without a commit here. It goes in <head>
// so the About page can see PHCF_ANALYTICS when it renders.
const analytics = GOATCOUNTER ? `
<script>
window.PHCF_ANALYTICS = "GoatCounter";
if (location.search) history.replaceState(null, "", location.pathname + location.hash);
window.goatcounter = {
  no_events: true,
  path: function () { return location.pathname; },
  referrer: function (r) { try { return r ? new URL(r).origin : ""; } catch (e) { return ""; } }
};
</script>
<script data-goatcounter="https://${GOATCOUNTER}.goatcounter.com/count" async src="goatcounter.js"></script>` : "";

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px/1.4 system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
${headExtra.trim()}
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#f5f5f7" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="assets/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Card Finder">
<meta property="og:type" content="website">
<meta property="og:site_name" content="PH Card Finder">
<meta property="og:title" content="PH Card Finder">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${SITE}">
<meta property="og:image" content="${SITE}assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">${analytics}
</head>
<body>
${body}
</body>
</html>
`;

fs.mkdirSync(path.join(out, "assets"), { recursive: true });
fs.writeFileSync(path.join(out, "index.html"), html);
// Read and write rather than copyFileSync: on Windows, copying onto a file a local server has open can fail.
const copy = (from, to) => fs.writeFileSync(path.join(out, to || from), fs.readFileSync(path.join(root, from)));
for (const f of ["data.js", "history.js", "manifest.webmanifest", "sw.js"]) if (fs.existsSync(path.join(root, f))) copy(f);
for (const f of fs.readdirSync(path.join(root, "assets"))) copy(path.join("assets", f));
if (GOATCOUNTER) copy(path.join("vendor", "goatcounter-count.js"), "goatcounter.js");
else if (fs.existsSync(path.join(out, "goatcounter.js"))) fs.unlinkSync(path.join(out, "goatcounter.js"));
fs.writeFileSync(path.join(out, ".nojekyll"), "");
console.log("Built docs/ (index.html, data, history, manifest, service worker, assets)" + (GOATCOUNTER ? ", GoatCounter on: " + GOATCOUNTER : ", visit counting off"));
