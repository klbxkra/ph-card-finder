// Builds docs/ for GitHub Pages. Run: node scripts/build-site.js
// index.html is written for the Claude artifact, which adds the <html>/<head> wrapper at
// publish time. GitHub Pages serves files as-is, so this adds the same wrapper here.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "docs");
const page = fs.readFileSync(path.join(root, "index.html"), "utf8");

// Everything before the first <style> (title, meta, font links) belongs in <head>.
const cut = page.indexOf("<style>");
const headExtra = cut > 0 ? page.slice(0, cut) : "";
const body = cut > 0 ? page.slice(cut) : page;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px/1.4 system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
${headExtra.trim()}
</head>
<body>
${body}
</body>
</html>
`;

fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "index.html"), html);
fs.copyFileSync(path.join(root, "data.js"), path.join(out, "data.js"));
fs.writeFileSync(path.join(out, ".nojekyll"), "");
console.log("Built docs/index.html and docs/data.js");
