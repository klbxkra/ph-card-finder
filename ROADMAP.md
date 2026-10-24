# Roadmap

PH Card Finder is a personal project. The order below puts the most useful features first. Every item has a privacy note, because the app must never collect personal information (see the Privacy section of the [README](README.md)).

**Privacy notes:**
- **Local:** nothing leaves the visitor's browser.
- **On-device:** saved in the visitor's own browser only.
- **Decision:** has a privacy trade-off, so the owner decides before it's built.

**Effort:** S is about one session, M two or three, L more.

## Done

| When | What |
| --- | --- |
| Oct 2026 | Recommendations from bracketed answers, eligibility, approval odds, value estimates, picks, ratings, upgrade paths |
| Oct 2026 | Every card listed (151), sort, filters, search, compare up to 6 with Highlight best, Apple-style light and dark design |
| Oct 2026 | Requirements and documents, Apply buttons on banks' own sites, points and miles redemption with official values |
| Oct 25, 2026 | Phase 1:<br>• optional credit-record and citizenship questions<br>• MoneyMax offers behind a switch<br>• promo tracker<br>• What changed page<br>• card links<br>• Report a correction<br>• install as an app<br>• cited Reddit notes |
| Oct 25, 2026 | GoatCounter visit counting built but tabled (off; see Phase 4); monthly check on GoatCounter's terms |
| Oct 25, 2026 | Phase 2, first part:<br>• **Cards you have:** pick your cards, how long you've had each, and an optional limit bracket<br>• which card to use where<br>• best card to add, after its fee<br>• limit advice: usage meter, keep or lower, how to ask each bank for more, spending caps<br>• promos at your banks<br>• limit-aware eligibility: card-to-card banks and BDO's shared limit<br>• two-card combo for people without a card yet<br>• mile-value slider<br>• **Credit guide:** limit staircase, usage meter, when to lower a limit, each bank's increase steps, credit score factors and how to get your CIC report |

## Waiting on you

| Item | What's needed |
| --- | --- |
| Font privacy | The Inter font loads from Google, so Google sees each visitor's IP address. Options: keep it, serve Inter from this site (same look, one font file added), or use each device's own font (SF on Apple devices, Segoe UI on Windows). |
| Reddit pages that were never archived | The beginner guide, the secured-cards and NAFFL wiki pages, and bank hotlines. Paste their text if you want them used. |
| MCC sheet | It's a community-run sheet. Before the app reuses its merchant list (see Merchant lookup), ask its maintainers, or link to the sheet instead. |

## Phase 2: smarter recommendations

Done so far: cards you have (with limits), best card to add, two-card combo, mile-value slider and the credit guide. Still to do:

| Feature | What it does | Effort | Privacy |
| --- | --- | --- | --- |
| Remember my cards | Keep your cards and limit brackets between visits. | S | Decision. On-device only, off unless you turn it on, with a Forget button. Anyone using the same browser could see the brackets. |
| Limit rules for more banks | Whether BPI, Metrobank, RCBC, UnionBank and others share one limit across your cards, and their official increase steps (Metrobank and UnionBank's come from MoneyMax for now). | S | Local (data only) |
| Points value slider | Like the mile slider, for points programs that only redeem for vouchers or goods. | S | Local |
| Reward exclusions | What doesn't earn on each card: bills payment, government, insurance, e-wallet top-ups, cash advances. Shown on cards and used in estimates. | M | Local (data only) |
| Merchant lookup | Type a store and see its merchant category (MCC) and which cards pay a bonus there. Built from bank exclusion lists, plus the community MCC sheet if its maintainers agree. | M | Local. The search runs in the page. |
| Annual-fee waiver helper | Each card's waiver rule (spend X within Y days) and community tips on asking for a waiver, by bank. | S | Local (data only) |
| Statement import | Drop in a statement; your spending is sorted into categories in the browser and fills in the form. | L | Decision. Statements hold your name and card numbers. The file would never be uploaded or saved, with a test proving the page makes no network requests while reading it. Lower-risk alternative: paste category totals by hand (what the form does today). |

## Phase 3: data quality

| Feature | What it does | Effort | Privacy |
| --- | --- | --- | --- |
| Close known gaps | UnionBank (its site was down), RCBC income floors, China Bank and Maybank fee tables from 2023, EastWest point values, AUB cards. The MCC sheet suggests EastWest points are worth about ₱0.05–0.33 depending on the card; official confirmation is still needed. | M | Local (data only) |
| Apply-link checker | The monthly refresh opens every Apply link and flags broken or redirected ones. | S | None. It runs in the refresh task, not in visitors' browsers. |
| Freshness by bank | Show when each bank was last checked, and flag cards not checked for 60+ days. | S | Local |
| Fee and rate history | A small timeline per card built from the What changed log (fee, income floor, rates). | S | Local |
| Bank hotlines | Lost-card and customer service numbers from the banks' own sites (the Reddit wiki is 9+ months old). | S | Local (data only) |
| Promo feed | An RSS/Atom feed of promos, built with the site, so people can follow it in a feed reader. | S | None. Feed readers fetch a static file, and the app learns nothing about who reads it. |
| Promo calendar file | "Add to calendar" on a promo makes a calendar file in your browser with its end date. | S | Local. A safer alternative to email alerts. |

## Phase 4: reach and polish

| Feature | What it does | Effort | Privacy |
| --- | --- | --- | --- |
| Filipino / Taglish toggle | The whole interface in Filipino or Taglish. | M | On-device (remembers the choice) |
| Per-card link previews | Shared card links show that card's own image and name on Messenger and Facebook, not the site-wide image. | M | None (made when the site is built) |
| Share a shortlist | Share a link to a list of cards, without your answers. | S | Local |
| Visit counting (tabled) | GoatCounter page counts. Built and tested, switched off. Turning it on needs your own GoatCounter site code. | S | Counts page loads only: no cookies, no answers, no IP addresses stored. The monthly refresh keeps checking GoatCounter's terms. |
| Share results (tabled) | Share a link that reopens your answers. | M | Decision. Anyone with the link sees your brackets (income, age, and so on). If built, the answers go after the # so neither GitHub nor GoatCounter receives them, and the link only stores brackets. The shortlist above avoids this entirely. |
| Print / save as PDF | A clean printable compare table and card summary. | S | Local |
| Accessibility pass | Screen-reader labels, keyboard use in Compare, contrast checks in both themes. | S | Local |
| What's new badge | Returning visitors see a dot on What changed when the data has updated since their last visit. | S | On-device (stores the last version seen) |
| Custom domain | For example phcardfinder.com, about ₱600 a year. Only if usage grows. | S | None |

## Nice to have

- **Not eligible yet?** A starter path for people below every income floor: secured cards, how long to hold them, and when to try for an unsecured card.
- **Trip cost calculator:** foreign-transaction fees per card for a trip budget, using each card's forex rate.
- **Lounge and travel perks table:** lounge visits, travel insurance and airline transfer partners side by side.
- **0% instalment partners:** which cards have instalment deals at major stores (data-heavy; only if a reliable source exists).
- **Card art:** banks' official card images where their terms allow; otherwise keep the generated art.

## Won't do (privacy)

| Idea | Why not | Alternative |
| --- | --- | --- |
| Accounts or saved profiles on a server | Would store personal information | Optional on-device saving |
| Email or SMS promo alerts | Needs contact details | Promo feed or calendar file |
| A form for approval stories | Would collect personal stories and details | Link to r/PHCreditCards threads |
| Social share buttons, comment widgets, embedded videos, ads or tracked affiliate links | They load third-party trackers | Plain links and the browser's own Share button |
| Session recording or heatmaps (Hotjar and similar) | They record visitor behaviour in detail | GoatCounter page counts only |
