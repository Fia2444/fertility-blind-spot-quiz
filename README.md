# Find Your Fertility Blind Spot — Quiz

A self-contained recreation of Sophie Byfield's tryinteract quiz. A visitor
answers 11 questions, the quiz works out her **fertility archetype**, captures
her name + email in **Flodesk** (tagged so the right email sequence fires), and
**redirects** her to the matching results page on sophiebyfield.com.

No build tools, no dependencies — just HTML, CSS, and one JS file.

## The four archetypes

| Archetype | Badge | Redirects to |
| --- | --- | --- |
| 🟢 The Hopeful Tracker | THT | `/results-hopeful/` |
| 🟡 The Precise Planner | TPP | `/results-precise/` |
| 🔴 The Wellness Warrior | TWW | `/results-wellness/` |
| 🔵 The Quiet Resister | TQR | `/results-resister/` |

**How it scores:** the 5 diagnostic questions (cycle, ovulation tracking, food,
fertile-window move, info source) each cast one vote for an archetype. The
"story arc" questions are unscored — they're for connection and flow, exactly
like the original. Most votes wins; ties break toward the archetype with the
most acute need (see `CONFIG.tiePriority`).

## Files

| File | What it's for |
| --- | --- |
| `index.html` | Page structure (intro, questions, email step, redirect). |
| `styles.css` | Styling + brand palette (magenta / navy / cream). |
| `quiz.js` | Questions, scoring, Flodesk + redirect logic — **edit here.** |

## Preview it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Until you add Flodesk form IDs (below), the
quiz shows a built-in branded email form and redirects straight to the results
pages — so you can test the whole flow right now.

## ⚙️ Setup to go live (2 steps)

### 1. Create 4 Flodesk forms (one per archetype)
In Flodesk, create an **inline form** for each archetype. For each form:
- Add subscribers to that archetype's **segment / tag** (this is what triggers
  the right email sequence — Hopeful Tracker, Precise Planner, etc.).
- Set the form's **success action → redirect** to that archetype's results page
  (e.g. the Wellness form redirects to `https://sophiebyfield.com/results-wellness/`).

This way Flodesk handles capture, tagging, and the redirect for you.

### 2. Paste the 4 form IDs
Open `quiz.js` → `CONFIG.flodesk.formIds` and paste each form's ID:

```js
formIds: {
  hopeful:  "…",   // THT form ID
  precise:  "…",   // TPP form ID
  wellness: "…",   // TWW form ID
  resister: "…",   // TQR form ID
},
```

Find the ID in Flodesk → Forms → your form → **Share / Embed**; the embed code
contains `formId: 'xxxxxxxxxxxx'`. Once IDs are in, the quiz shows the real
Flodesk form instead of the fallback.

## ⚠️ One thing to confirm — Q10

The original flow was "10 questions + 1 warm-up," but the PDF you shared ends at
Q9, and your tryinteract account is deactivated so the live quiz can't be read.
I added a **drafted Q10** (a diagnostic about support that also sets up the
community/next step) — it's clearly flagged in `quiz.js`. Please **review its
wording and answer→archetype mapping**, or delete that block to ship 9
questions. Everything else is verbatim from your PDF.

## Customising

Everything editable is at the top of `quiz.js`: `CONFIG` (URLs, Flodesk, tie
rule), `BUCKETS` (archetype names/badges/colours), and `QUESTIONS`. Brand
colours are the `--magenta` / `--navy` / `--cream` variables at the top of
`styles.css`.
