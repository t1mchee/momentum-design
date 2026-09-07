# Surgical fixes for draft 8

> **Applied in draft 8 (2026-09-07):** A1, A2, A3, A4, A7, A8, A9, A10, A11, A14, B1, and the taxonomy and
> coverage directions of B2. A5 was reduced to a hedge line with instrument, notional and premium (no hedged
> VaR). A6 was taken as a cut: the random-ranking control sort is dropped. A12, A13, B3, B4, C and D are not
> applied to the spec; they are memo sentences and the memo's writing pass. The design is frozen at draft 8.

Sources, all on draft 7: the rubric evaluation D (`docs/reviews/eval-v2-draft-7-D.md`, 28/45), the
skeptic's clarity report (`docs/reviews/clarity-v2-draft-7.md`, 38 contradictions), and the LLM-pattern
report (`docs/reviews/slop-v2-draft-7.md`).

Tags: **APPLY** (done as written), **DECIDE** (a design choice; my proposal is what I will do unless told
otherwise), **EMPIRICS** (a number that must come from the package).

Section A holds the points that change what the system does or claims. B is the rubric. C is the
mechanical list. D is the writing pass.

---

## A. Substance

### A1. One event  — DECIDE

Now: three definitions. The problem block says a ten-day return at or below −432bp from the French file;
the tail model targets the rolling conditional 5% quantile; pages are scored against the unconditional
5% quantile of the reconstructed book. The −933bp crash-day threshold is unused and, as the skeptic notes,
a daily 1st percentile of −933bp beside a ten-day 5th percentile of −432bp needs checking.

Proposal:

> The event is a ten-day return of the reconstructed book at or below its own unconditional 5% quantile,
> computed on the trailing history since December 2013. The tail model forecasts that quantile
> conditionally; a page is scored against the unconditional one. The French file's −432bp is the same
> quantile on the published factor over 1926 to 2022 and is printed as the long-run reference; the
> reversal record before December 2013 uses it because no reconstructed book exists there.

The crash-day threshold leaves the spec; its number goes to the EMPIRICS list to be confirmed or retired
in the package.

### A2. Look-ahead labels inherit  — APPLY

Now: severity is "clean" while it consumes the loss share, which is "model"; poscluster is "as-of" and
timebombs "clean" on the same positioning input; sensitivities is "clean" with a carried exposure measured
over the window ending at the next formation.

Legend rule added: "a node's label is at least the strongest label among its inputs (human > live-only >
model > as-of > clean); a node's own field states only what it adds." Then: severity, themescore,
poscluster, timebombs, analogue, eventrule, thepage take the label their inputs give them, with
mitigation "inherited from <input>; nothing added here". sensitivities' rule says the carried exposure is
a look-back measure printed one month after formation and never used on the formation date.

### A3. What the ablation tests, and how text reaches the tail model  — DECIDE

Now: both text series are embedded by the same pre-date encoder, so 2a versus 2b is not "a rule against
a model". Worse, on the component set the loss share is price-only, so the two series differ only through
propagated in-book names; on the proof-of-concept path propagation is retrieval-only on both series, so
2a and 2b are identical and the registered test is empty as configured.

Proposal, two parts.

1. The text regressor becomes text-dependent. Steps 2a and 2b add, per leg, the theme's excess quote
   weight (from `cluster`) and the share of book weight in propagated in-book theme names, each computed
   on its series. The loss share stays on the page as a statistic but leaves the ablation, since it is
   price arithmetic once the theme is fixed.
2. The claim is stated as what it is: "whether the language model's extraction, naming and reranking add
   anything beyond a keyword rule run through the same embedding space". g_theme, severity, volvalidation
   and the change log say this; nothing says "rule against model".

### A4. A registered band that a calibrated model can pass  — DECIDE

Now: 3 to 7% breach rate at about 150 observations, which is about one binomial standard error each
side; a calibrated model fails it often.

Proposal: replace the band with Kupiec's unconditional-coverage test at the 10% level on the observation
count actually available, with the count and the implied acceptance range printed in the row (at 150
observations that range is roughly 2 to 9%). The pinball margins stay. `volvalidation` scores every
formation month, window and non-window alike, so the state-conditional breach rates and the threshold
trigger's unconditional VaR are tested on the same observations; "standard errors clustered by month"
is deleted.

### A5. The hedge is a computed line  — DECIDE

Now: the page "states the hedge" but no node computes one; options names a sector ETF, g_book names the
driving-series instrument, bridge picks between them at R² = 0.5.

Proposal: `options` outputs a hedge line: the instrument (the sector ETF, or the driving series'
instrument when the bridge puts the exposure first), the notional per $100m of book from the book's
126-day beta to it, the ten-day option premium in bp of book (illustrative where no history), and the
book's ten-day VaR with the hedge in place, recomputed by `severity` on the hedged return series. The page
item 3 prints it. This is the "cost of the hedge" the rubric's C6 asks for.

### A6. The random-ranking control  — APPLY

Now: six series, each with a 90% band, so the percentiles are withdrawn on about 47% of days by
construction.

Fix: the control is tested once, on the family: its largest spread percentile across the six must lie
below the 99.2nd, the same family threshold the six percentiles use. Failure withdraws that day's
random-portfolio percentiles.

### A7. Everything "printed" reaches the page  — APPLY

Edges and inputs added to `thepage`: `poscluster` (overlap and non-overlap by leg, off-book theme names),
`posdata` (short interest, the positioning lag), `refseries` (the bear state, in a state line), and
`themescore`'s edge label lists the loss share, the top-three entries and the book-effect split. `cluster`'s
split and `posdata`'s short interest gain consumers.

### A8. Inputs with no producer  — APPLY, one DECIDE

- `refseries` builds the mega-cap series from holdings: legend states that data nodes have no inputs and
  each names its feeds; the rule names the holdings file as its feed.
- `poscluster` needs position weights: edge `sort→poscluster`.
- `bombtest` needs sector codes: edge `prices→bombtest` carries them.
- `themescore`'s "placebo share" for the loss share needs propagation on 200 random portfolios, which
  nothing runs. DECIDE: drop it; the placebo comparisons are the variance share and the quote weight.
- `embedspace`'s filings-only fallback before GDELT's first date has no filings input. DECIDE: drop the
  fallback; the theme pipeline starts at GDELT's first usable date (EMPIRICS) and the tail model's text
  steps start there too, with the earlier months on steps 0 and 1 only.
- `riskextract`'s input from `labels` is unused in its rule: the rule says the error rates set the
  stratum weights of the next month's sample and nothing else; the feedback edge label says so.

### A9. Treatment and placebo on the same instrument  — DECIDE

Now: the language model reads the component set's documents; the distilled classifier reads the random
sets; the difference is called excess weight.

Proposal: the excess weight compares like with like. The distilled classifier runs on the component set
as well, and the excess weight is classifier-on-book minus classifier-on-random. The language model's
direct reading of the component set supplies the quotes and the naming, and its agreement with the
classifier on the component set is printed as the distillation check. In the ablation, the
language-model series is the classifier distilled from the model; the keyword series is the keyword rule.

### A10. The news classifier's training window  — APPLY

Now: the classifier head is trained on labels stratified across all years and applied to every year.

Fix: one head per calendar year, trained only on labelled items dated before that year, on that year's
encoder. The first year with enough labels is stated (EMPIRICS).

### A11. When the book is the theme  — APPLY

Now: a theme the sort has fully aligned with is treated as the factor, so the named component is a
smaller theme and the real one's name is a diagnostic.

Fix: page item 1 opens with the leading component's case. If it is flagged factor, item 1 says "the
leading co-movement is the momentum factor itself, named as <diagnostic name>", and the named theme is
printed second, labelled as the second component with its variance share. The reader sees both.

### A12. One horizon  — DECIDE

Now: the horizon is ten trading days "for every number on the page", but the vulnerable-name lists use
trailing 20-day returns and the event study scores twenty sessions.

Proposal: the lists' trailing window stays at 20 days (it is a look-back, not a forecast) and the
problem block says "every forecast on the page"; the event study scores ten sessions after the freeze,
matching the horizon.

### A13. The proof-of-concept path, sized  — DECIDE

Now: the path includes a yearly-cutoff encoder family, weekly HDBSCAN over a twelve-month archive for
660 weeks, and universe-wide extraction, under "about twenty hours", with no path note on any of them.

Proposal, added as path notes and one sentence in `hours`: N = 50 random portfolios; the embedding
space is rebuilt monthly, not weekly, in the proof of concept; the encoder is one public family with
yearly cutoffs (EMPIRICS), and if none is available a single fixed encoder is used and every text
statistic is labelled model look-ahead; extraction uses the keyword rule and the distilled classifier
over the universe, with the language model reading only the component sets; the ablation compares steps
2a and 2b on extraction and naming only. The `hours` line says what the twenty hours buy and what they
do not.

### A14. The decision and the withheld lists  — APPLY

Problem block: "which names to trim, once the event study on the vulnerable-name lists has run". The
meta note's 77-of-86 sentence says "with no prior bear state; whether a theme had appeared in the news
before those episodes has not been measured" (EMPIRICS).

---

## B. The rubric

| # | Cap | Now | Fix | Tag |
|---|---|---|---|---|
| B1 | C3, comparator | Evaluator C exempted the live-only catalyst proposer; evaluator D did not, and the category swung from 4 to 2 on that reading. | Two changes. `catagent` gets a comparator: a deterministic extractor over the same five sessions of news and 8-K text that takes dated sentences matching the registered term list and naming a component-set entity, printed beside the model's proposals with the PM's approval share for each. And the rule is reworded: "a model step whose output is printed or enters a claim needs a printed comparator; a live-only step needs one from the day it goes live". | APPLY |
| B2 | C8, direction of bias | Evaluator D applied the cap to the taxonomy look-ahead and the coverage gaps; C did not. | Rule reworded: "a limitation is any caveat on a number the page prints, including a labelled look-ahead and a coverage gap; each needs a direction sentence." Directions added to taxonomy (backtest theme weights are overstated, since the list holds the themes that later mattered), filings and pc1text coverage (the loss share and quote weights are understated on names without text), prices' delisting return (the loser leg's return is understated where −30% is too mild), cluster's no-decay rule (stale risks are overweighted), analogue's pre-2014 states (distances understate similarity on the missing dimensions), propagate's pre-cutoff months (fewer theme names are found, so the loss share is understated). | APPLY |
| B3 | C5, band | The rubric does not say a registered band must be passable by a calibrated model. | Add to section 4: "a registered pass band that a correctly calibrated model would fail more than 10% of the time counts as no band." | APPLY |
| B4 | C7, writing | Rules 11 to 22 from the draft-7 pattern report. | Appended to section 6. | APPLY |

---

## C. Contradictions and dangling references, mechanical

| # | Where | Fix | Tag |
|---|---|---|---|
| C1 | options rule vs on_failure | one form: "the comparison is marked illustrative and the hedge line is left off" | APPLY |
| C2 | g_name "larger than random companies ever give" | "larger than random companies give on 95% of draws" | APPLY |
| C3 | g_severity "2a and 2b add" | "2b replaces 2a" | APPLY |
| C4 | g_book "same size and sector mix" for the exposure null | "same size and capitalisation profile; the text null adds sector" | APPLY |
| C5 | refseries family percentile with no output | outputs "per series: its time-series percentile, family-adjusted"; zscore consumes it instead of recomputing; eventrule's maximum is over these | APPLY |
| C6 | eventrule backtest calendar trigger undefined | "in the backtest the calendar trigger uses the scheduled macro releases and the component earnings that pass the 10% weight floor" | APPLY |
| C7 | register rows 13, 10, 02/03/05/23 cited, no register in the files | a `register_rows` list in `register.rule` naming each cited row's test in one clause | APPLY |
| C8 | taxonomy's 'other' entry gets a reference point | "'other' has no reference point; it is the label for quotes beyond the distance from every entry" | APPLY |
| C9 | pmworries "with no language model" for an encoder-built baseline | "with no language-model step; the encoder still places the entries" | APPLY |
| C10 | propagate→themescore at rebalance vs weekly | "weekly" on both edges; propagation reruns weekly on the cached embeddings | APPLY |
| C11 | classify vs meta note | A14 | APPLY |
| C12 | bombtest "early 2021"; freeze dates chosen knowing the breach day | dates EMPIRICS; the rule says "the test is of list content, not of timing, since the freeze dates are set from the record" | APPLY |
| C13 | bombtest sign test floor | "the same-sign requirement of four in five has a 19% chance under the null; the row states this" | APPLY |
| C14 | analogue: two eras, two distances | "nearest dates are ranked within each era and the page shows the five nearest from each" | APPLY |
| C15 | g_output production feeds | one sentence per data node naming the feed that replaces which layer first, gathered in the g_output synthesis | APPLY |
| C16 | labels: monthly live sample stratified by historical era | "a one-off backtest sample of 270 records, stratified by era and cutoff side, plus the monthly live sample of 90" | APPLY |
| C17 | register: confirmatory evidence accrues after the review | proof_of_concept.status says so | APPLY |
| C18 | sensitivities takes cap-matched only | as C4 | APPLY |
| C19 | timebombs list rule uses no catalyst date | "the pre-catalyst list is computed daily and read on the day a calendar page is produced" | APPLY |
| C20 | thepage 154-word sentence | items become a YAML list `items:` rendered by the viewers | APPLY |
| C21 | undefined at first use: text placebo, second search scope, c-TF-IDF, HDBSCAN, BM25, Marchenko-Pastur, Mahalanobis, Jaccard, GDELT, ALFRED, prediction-powered inference, expected shortfall | each defined in a `terms` block in the legend (one line each), per pattern rule 16; rules refer to the legend | APPLY |
| C22 | "about 300 names per leg", ETF identity, holdings start | "the iShares Russell 3000 ETF (IWV), whose archived holdings begin in December 2013, which is why the reconstructed book starts there" (EMPIRICS to confirm) | EMPIRICS |
| C23 | tail model's first fit date and minimum history | "first fitted with 24 months of history, December 2015; earlier months are not scored" | APPLY |
| C24 | placebo weight aggregation over 200 draws | "the placebo weight is the mean over the random portfolios; the 95th percentile of the largest excess is taken over the same draws" | APPLY |
| C25 | momentum-style filer count; GDELT volume and filter | EMPIRICS | EMPIRICS |

---

## D. Writing

| # | Rule | Fix | Tag |
|---|---|---|---|
| D1 | rule 2, "carry" | The edge field is renamed `sends` in the schema and both viewers; "carried forward", "carries no article text", "page carries" rewritten. Only conferred/carried remain. | APPLY |
| D2 | rule 12, one sense per word | name: a company is "a name" only in "vulnerable names"; the theme's name is "the theme label"; propagate's output is "companies outside the component set with the theme". step: ablation only; pipeline steps are "nodes". sign: always qualified; the PM "acknowledges". state: bear state only; the page is "kept current". list: worry list only; "the two vulnerable-name lists". series: the six are "reference series", the text ones "the keyword run and the model run". component: principal component only; system parts are "nodes". window: qualified every time. | APPLY |
| D3 | rule 1, speech verbs (22 left) | "the page says so" and kin become "with a note on the page"; "when the bridge says so" becomes "when the named component's R-squared is above 0.5"; "the memo says" becomes "the memo reports". | APPLY |
| D4 | rules 3, 4, 11 | 12 label-colons and 9 announced counts rewritten; "four jobs" lists four. | APPLY |
| D5 | rule 5, 16 | the nine mid-sentence definitions move to the legend's `terms` block. | APPLY |
| D6 | rule 10 | eight sentences of document history removed from rules ("keeps its v1 id", "v1 used 500", "in v1 this rule ran alongside"); the change log holds them. | APPLY |
| D7 | rule 15 | every rule sentence under 45 words; enumerations of more than four items become YAML lists (thepage items, severity regressors, refseries series, the ablation steps). | APPLY |
| D8 | the three stops | "name the named component" becomes "label the named component"; "long crowding in a short" becomes "on the loser leg the 13F count measures how many momentum funds are long a name the book is short"; the alignment sentence in cluster becomes three short sentences with the sign table in a YAML list. | APPLY |
| D9 | coinages dropped | the daily loop, gain to give back, ships, Parked, earns its place, under watch, lives with, sit, and the change log's spine/joints/thread/surgical/residue. "case flag" stays. | APPLY |
| D10 | rules 13, 14, 18, 20, 21 | subjects that act; who froze and labelled; no data verbs of living; "because" clauses state mechanisms; retired and open items as full sentences. | APPLY |
| D11 | the syntheses | the report's rewrites applied; the named component, case flag, agreement line and excess weight defined in the synthesis where first used. | APPLY |

---

## Order of work

A1 to A14 in one pass, then B into the rubric, then C, then D as a read-through with the pattern
report's tables beside the text, then the viewers (the `sends` field, the `items` and `terms` lists),
then the snapshot, the change-log entry, and three fresh evaluators.
