# PH Card Finder

A single-page app that recommends Philippine credit cards from a few bracketed answers. All the math runs in the browser and nothing a user enters is saved or sent.

- Live site: https://klbxkra.github.io/ph-card-finder/
- Private Claude artifact (preview): https://claude.ai/artifact/YFnrdmpdbMQhpGMVajabAU

## Files

| File | What it is |
| --- | --- |
| `index.html` | The app: layout, styles, eligibility, value, ratings and upgrade-path logic. Written for the Claude artifact, which adds the `<html>`/`<head>` wrapper when it publishes. |
| `data.js` | Every card, bank note, document list, apply link, promo and source. Sets `window.PHCC_DATA`. The only file a data refresh should touch. |
| `scripts/check-data.js` | Validates `data.js`: schema, dates, source links, apply links on bank domains, the BSP 3% interest cap. Run before publishing. |
| `scripts/build-site.js` | Writes `docs/` for GitHub Pages: `index.html` wrapped in a full HTML document, plus `data.js`. |
| `docs/` | Built site that GitHub Pages serves. Don't edit by hand; run the build script. |
| `.github/workflows/pages.yml` | Checks the data, rebuilds `docs/` and deploys to GitHub Pages on every push to `main`. |

## Refreshing the data

A scheduled task, **PH card data refresh**, runs on the 1st of each month at 9:00 AM. It runs while the Claude desktop app is open, or at the next launch if the app was closed. It:

1. Re-checks each card on the bank's own site first, then on comparison sites (taxcalculator.com.ph, MoneyMax).
2. Updates `data.js`: figures, `checked` dates, promos and end dates, apply links, new or discontinued cards.
3. Bumps `meta.version` and `meta.dataAsOf` and adds a changelog line.
4. Runs `node scripts/check-data.js` and stops if it fails.
5. Republishes the artifact to the same link.
6. Runs `node scripts/build-site.js`, commits and pushes to `main`. The Pages workflow redeploys from that push.

To refresh by hand, ask Claude in this folder to "refresh the card data", or use **Run now** on the task.

## GitHub Pages

Settings → Pages → Build and deployment → Source: **GitHub Actions**. The workflow in `.github/workflows/pages.yml` runs on every push to `main`: it runs `scripts/check-data.js` (a failing check stops the deploy), rebuilds `docs/`, and publishes it. You can also start it by hand from the Actions tab.

## Data rules

- Change only what you verified. Set `checked` to the date you looked and `via` to `official` or `aggregator`.
- Never guess a number. If sources disagree or a figure isn't published, say so in `fee.note`, `incomeNote` or `flags`.
- Promos need an `until` date (or `null` if the bank shows none). The app marks promos as ended on its own.
- Apply links must go to the bank's own domain. `check-data.js` warns about any other host.
- Store options in `ecosystems` only list stores where at least one card pays extra.
