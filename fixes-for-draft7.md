# Surgical fixes for draft 7

Sources: the clarity report (`docs/reviews/clarity-v2-draft-6.md`) and the LLM-pattern report
(`docs/reviews/slop-v2-draft-6.md`), both on draft 6. The parsimony cuts stay a separate decision.

Tags: **APPLY** (I do it as written), **DECIDE** (a design choice; my proposal is given and is what I
will do unless told otherwise), **EMPIRICS** (a number or name that must come from the package).

Section A is the substance: the four joints where the skeptic could not follow the thread, plus the
three "consumed but never computed" gaps. Sections B to E are mechanical. Section F is the writing pass.

---

## A. The joints

### A1. How a component gets one theme name  — DECIDE

Now: `cluster` outputs a quote weight per list entry and per residual cluster; `namecluster` outputs
"theme name per component" with no rule choosing which.

Proposal, added to `cluster.rule` and reflected in `namecluster`:

> For each theme-case component, the excess weight of a list entry or residual cluster is its quote
> weight minus its placebo weight. The component's theme is the entry or cluster with the largest
> excess weight, provided that excess exceeds the 95th percentile of the largest excess any single
> entry reaches on the random portfolios' own component sets; otherwise the component is marked
> "no theme above placebo" and is not named. The top three entries are printed with their excess
> weights. If the second entry's excess is within 10% of the first's, both are printed and the first
> leads. Residual clusters compete on the same footing, with their placebo weight being the weight of
> random-set quotes that fall into the same cluster.

Only quotes whose risk is aligned with the component (A3) count toward the weight.

### A2. What the ablation swaps, and what "carriers" is as a regressor  — DECIDE

Now: `groups` says the ablation swaps the extraction; `severity` says it swaps "the theme carriers
found with the keyword extractor", which nothing produces; carriers are a list of names, not a number;
the full model (loss share, catalyst terms, case flag) is not the last ablation step; `volvalidation`
requires step 0 to beat a calendar baseline while step 0 knows no calendar.

Proposal. Two series run through the whole text chain, not one step of it:

> The keyword series is the keyword extractor's statements, assigned in the same embedding space, named
> by the keyword label, and propagated by retrieval alone. The language-model series is the model's
> statements, the model's name for residual clusters, and the model's reranking of the retrieved
> candidates on post-cutoff months. Every text statistic is computed on both series.

The text enters the tail model through one number per leg: the share of book weight in names that lose
if the theme reverses (the loss share, A3), which counts the component set and the in-book theme names
found by propagation. The ablation becomes:

| step | adds |
|---|---|
| 0 | trailing volatility, the bear state, the case flag as an indicator, the catalyst-window indicator and days to the nearest catalyst, and the GARCH and calendar baselines as controls. Everything price and calendar, no text. |
| 1 | the book's variance share on the named component, and the share of book weight in price-correlated names |
| 2a | the loss share computed on the keyword series |
| 2b | the loss share computed on the language-model series, in place of 2a |
| 3 | the positioning overlap. This is the full model. |

Registered margin unchanged: 2b must cut 2a's pinball loss by at least 2% for the language model to be
judged to add anything. Note added to `volvalidation`: on months before the language model's training
cutoff the two series differ only in extraction and naming; the reranking difference is measured on
post-cutoff months only, and the count of those months is printed with the result (EMPIRICS).

Consequence for `volvalidation`: the 5% margin against the calendar baseline applies at every step,
which is now fair because step 0 has the calendar.

### A3. "Book effect": two questions, two signs  — DECIDE

Now: `cluster` defines a three-sign product (leg, loading, company loses or gains) and says −1 means
"the book loses if the risk materialises". For a shorted name with a negative loading that loses when
the risk hits, the product is −1 but the book gains. `themescore` then uses "book effect" per name for
"loses if the theme reverses", a different question.

Proposal. Each quote gets two tags, and the term "book effect" keeps only the first:

> **Book effect** (per quote): does the book lose if this risk materialises? Sign = leg sign × company
> sign, where leg is +1 winner, −1 loser, and company is −1 if it loses when the risk hits, +1 if it
> gains. −1 means the book loses.
>
> **Alignment** (per quote): does this risk materialising move the name the same way a reversal of the
> component would? Reversal means the component's return is negative (its sign is fixed so that
> w'v_k > 0). A name falls on reversal when its loading is positive. So a quote is aligned when company
> sign × loading sign = −1. Only aligned quotes count toward a component's theme weight; an unaligned
> quote is evidence of a different theme.

And in `themescore`, the loss share is price-only:

> A name in the component set loses if the theme reverses when leg sign × loading sign > 0. A theme name
> found by propagation that is inside the book loses when leg sign × its beta to the component > 0.
> Theme names outside the book have no weight in the book and do not enter the share; they appear only in
> the positioning overlap.

The text sign still does work: the share of a theme's quote weight on which the book loses if the risk
materialises is printed beside the theme as its book-effect split.

### A4. The proof-of-concept path  — DECIDE

Now: the path omits `refseries`, `pc1text`, `embedspace`, `themescore`, `register`; defers `propagate`
and `poscluster`; seventeen nodes have no status; "produces" has no tense; the hours line is broken.

Proposal for the `proof_of_concept` block:

```yaml
proof_of_concept:
  status: "planned; as of the memo date no v2 component has run. The path is what the twenty hours buy on public, as-of data."
  path: [prices, refseries, french, sort, random, covariance, pca, bridge,
         filings, news, newsagent, taxonomy, embedspace,
         pc1text, riskextract, cluster, namecluster, propagate, themescore,
         garch, eventbaseline, severity, register, volvalidation]
  path_notes:
    newsagent: "keyword comparator only; the language model is not run on news in the proof of concept"
    taxonomy: "the initial list, written on the memo date and labelled as such (B14)"
    propagate: "retrieval only, over the rest of the book; the positioning scope and the language-model reranking are deferred"
    register: "the rows for the tail-model scoring only"
  produces: "the tail-model scoring, steps 0 to 2b, with the keyword-versus-model ablation as the one registered test, on the full sample from December 2013; the result is design tier"
  deferred: [posdata, poscluster, timebombs, bombtest, options, catagent, catapprove, analogue, composer, sensitivities, zscore, route2, controls, labels]
  described_only: [pmworries, eventrule, thepage, signoff, responselog, themevalidation]
```

`hours` becomes: "about twenty for the whole project. The path below is the part of the design that
runs today on public, as-of data."

The three statuses are rendered in the legend panel with the retired nodes as a fourth. Every node
then has exactly one.

The path now closes: `embedspace` needs `news` and `newsagent` (comparator mode) and `taxonomy`; `bridge`
needs `refseries`; `severity` needs `themescore` and the bear state (A6); `volvalidation` needs
`register`. `sensitivities`/`zscore`/`route2` move to deferred because nothing on the path consumes
them (the driving-series exposure is v1 code and could be re-run, but it is not part of the registered
test).

### A5. Who computes the random-portfolio statistics  — DECIDE

Now: `random` lists as an output "exposures, eigenvalues, variance shares, quote weights" on each random
portfolio, and describes computing none of them; `cluster` needs random names' filings and loadings that
nothing supplies.

Proposal. `random` outputs portfolios only. Each statistic is computed on the random portfolios by the
node that computes it for the book, and that node's rule says so:

- `sensitivities` and `zscore`: exposures (already implied).
- `pca`: a covariance and eigen-decomposition per random portfolio, hence its variance shares and its
  component set with loadings. New output: "per random portfolio: its component set with loadings".
- `bridge`: the R-squared on each random portfolio's named component (already in checks).
- `pc1text`: gathers text for the book's component sets and for each random portfolio's component set.
- `riskextract`: "The language model reads the component set's documents directly. Documents outside
  the component set, which includes the random portfolios' sets and the propagation scope, are
  labelled by a classifier distilled from the model's labels on the pre-date encoder, in the backtest
  and in production alike. Every filing in the universe is extracted once and cached, so the random
  sets cost nothing extra after the first pass." This also resolves the newsagent/riskextract
  inconsistency about where distillation is used (B20).
- `cluster`: placebo weight per entry from the random sets' extractions, weighted by their own loadings.

Edges: `random→pca` carries "random portfolios"; `random→cluster` is deleted; `pca→pc1text` carries
"component sets of the book and of the random portfolios". The alternative, equal-weighted placebo on
random names without loadings, is cheaper but compares a loading-weighted number with an unweighted
one; not proposed.

### A6. The bear state  — APPLY

`refseries` gains the output "the bear state: an indicator that the trailing 24-month S&P 500 return
is negative, and the trailing 126-day market variance (Daniel and Moskowitz)". Edges
`refseries→severity` and `refseries→analogue` carry it. Both rules cite it as an input.

### A7. Page items with no producer  — APPLY

| item | producer | fix |
|---|---|---|
| (1) agreement line, variance share | `themescore` | edge `themescore→thepage` carries "theme statistics, the agreement line and the bp loss"; both added to `thepage.inputs` |
| (3) expected shortfall | `severity` | `thepage.inputs` gains "ten-day 5% VaR and expected shortfall, in bp of book" |
| (4) the two lists | `timebombs` | item text becomes "the two lists of vulnerable names by leg, once their event study has run; until then the item says that it is withheld" |
| (8) what changed | `eventrule` | `eventrule` outputs "the page type and its fields, with each field's change since the last page"; `thepage.rule` says item 8 is that change |
| (9) coverage by layer | `filings` | the coverage check becomes an output "coverage per name, by leg and by layer"; edge `filings→thepage` |

---

## B. Contradictions between nodes, or between nodes and syntheses

| # | Where | Now | Fix | Tag |
|---|---|---|---|---|
| B1 | legend, all nodes, both viewers | legend says clean / as-of / model / live only / human; field values are none / data / model / model-unmitigable / human | Rename the field values to `clean`, `as-of`, `model`, `live-only`, `human` in the spec and the v1 baseline; update the chip classes and the detail panel in both viewers. One vocabulary. | APPLY |
| B2 | legend, data nodes | `access` takes public or mixed; prose says PUBLIC / LICENSED / DESK-ONLY | Legend entry: "access: public = every feed the node uses is public; mixed = public feeds now, with licensed or desk-only feeds in production, each labelled in the rule." | APPLY |
| B3 | legend | `kind`, `lane`, edge `when`/`mode`/`feedback` only in the header comment | Add legend entries for kind (the five shapes), lane (a rendering row; the seven steps are the reading order), and the three edge fields | APPLY |
| B4 | g_text vs `filings` | two layers vs three | g_text: "Company text has two layers we can use now ... A third, research and dealer notes, is production-only." | APPLY |
| B5 | `news` | outputs "headlines and articles"; rule says no article text | outputs: "headlines and release text, timestamped, rolling twelve months" | APPLY |
| B6 | `refseries`, g_market | lookahead `data` with "none of the six is revised"; synthesis says "first-print vintages where a series is revised" | lookahead `clean`; mitigation "none of the six is revised; a revised series, if ever added, is taken from ALFRED first prints". g_market drops the vintage clause. | APPLY |
| B7 | g_theme vs `pca` | "the single factor" vs "at most three" | "First find the leading co-movements among the book's names, at most three." | APPLY |
| B8 | g_theme | "three separate jobs" | "four jobs in this step: it extracts risk statements from news and from filings, names a cluster that matches no list entry, and scores candidate names" | APPLY |
| B9 | `sensitivities` | slopes on market-residualised returns while series one is the market | "on market-residualised returns for series two to six; the market series uses the raw slope" | APPLY |
| B10 | `zscore` vs `eventrule` | "the v1 family-maximum statistic is not used" vs a maximum trigger | `zscore`: "The v1 test of the family maximum against random portfolios is not used." `eventrule`: "the maximum of the eight time-series percentiles (the ten-day VaR, the named component's variance share, the six exposures) crosses 95" | APPLY |
| B11 | `options`, `eventrule`, `analogue` | "first component" | "the named component" in all three; `analogue.inputs` matches its rule | APPLY |
| B12 | `options` | output per name; rule and page use one aggregate; no ten-day conversion | outputs: "per component name: implied earnings move" and "the component set's implied ten-day move, loading-weighted, in per cent". Conversion: "the earnings move is a one-day move; the ten-day figure adds the name's implied variance over the other nine days, sqrt(m² + 9 σ²/252) with σ the 30-day implied vol". "cost of the hedge" becomes "the implied move of the hedge instrument" here, in g_output and in `thepage`. | DECIDE |
| B13 | `posdata` vs `propagate`, `poscluster` | the score is a within-leg rank; used for names outside the book | `posdata`: "For names outside the book the same two inputs are ranked within the universe; the universe's top quintile by that score is the second search scope. On the loser leg 13F crowding counts long holders, so it measures long crowding in a short; short interest is the short-side measure and is printed beside it." `poscluster`: "Theme names outside the book have no leg; they are listed separately as off-book theme names and enter the overlap by the universe quintile." | APPLY |
| B14 | `taxonomy` | backtests use "the list as it stood on the date" for dates before the list existed | "For dates before the list existed, backtests use the initial list written on the memo date, which was written knowing 2014 to 2026 and is labelled human look-ahead; the run with no list is the control for that." | DECIDE |
| B15 | `taxonomy→themescore` edge | carries "the leading entry", which needs news weight from `embedspace` | Retarget: `embedspace→themescore` carries "news weight per entry, for the agreement line"; `themescore.inputs` gains it and drops the list | APPLY |
| B16 | `pmworries` | no inputs; edge from `thepage` carries edits | inputs: "one page, pushed to the reader"; drop "promotes" | APPLY |
| B17 | `newsagent` | returns the item's date after redacting it | "the pipeline attaches the item's date" | APPLY |
| B18 | `newsagent` check vs `signoff` | a hand-labelled news sample that nobody produces | `signoff`: "about 90 extracted records each month, 60 from filings and 30 from news" | DECIDE (the split) |
| B19 | `newsagent`, `riskextract` | "registered term list" confusable with the worry list | first use: "the registered term list, a list of risk terms and modal phrases kept in the register and separate from the worry list" | APPLY |
| B20 | `newsagent` vs `riskextract` | distillation is a backtest device in one and a production step in the other | Resolved by A5: the model reads the component set's documents directly and the distilled classifier labels everything else, in both nodes, in backtest and production alike | APPLY |
| B21 | `severity` check, g_validation | "2 of 42" presented as this model's check | "prior result: v1's tail model, without the text regressors, breached 2 of 42 held-out forecasts" in both places | APPLY |
| B22 | `severity` on_failure vs meta note | "unconditional quantile" vs "falls back to price-only steps" | on_failure: "the step-0 model is reported in place of the full model, with a note on the page" | APPLY |
| B23 | meta note vs residual clusters | "does not try to discover the theme" vs naming residual clusters | "It names the theme from the list where an entry fits and from the residual clusters where none does; it cannot name a theme that is absent from the news." | APPLY |
| B24 | meta note vs `classify` | "no theme in advance" vs "no prior bear state" | Use the measured claim: "in a rising market with no prior bear state" | APPLY |
| B25 | `analogue` | six exposures before December 2013, where none exist; aptness needs a theme; "sign of its case flag"; "pre-sample covariance" | "Before December 2013 the six exposures are the French factor's own 126-day slopes on the six series (those with history), labelled factor-level. Aptness before 2014 is judged on the bear state and the case flag only, and the page says so. The case flag must take the same value (factor or theme). The covariance for the distance is estimated on dates before December 2013 for the price dimensions and on the expanding window since 2014 for the theme and positioning dimensions." | DECIDE |
| B26 | `thepage` vs `timebombs`, `bombtest` | lists on the page before the test runs; the PoC defers the test | A7 item (4) | APPLY |
| B27 | `french` | "the record feeds the validation"; no validation node takes it | `bombtest.inputs` gains "the reversal record"; edge `french→bombtest` carries "the five unwind dates" | APPLY |
| B28 | `register` | inputs empty; hidden edge from `thepage` with no label | Delete the hidden edge | APPLY |
| B29 | `posdata` check | "the history of the overlap statistic is kept" | Move to `poscluster.checks` | APPLY |
| B30 | `catagent` | check "PM approval" is a node; lookahead label | Drop the check; label per B1 | APPLY |
| B31 | g_output vs `eventrule` | "one of the book's own statistics" vs the maximum | "whenever the maximum of the book's monitored percentiles crosses 95" | APPLY |
| B32 | `controls` outputs | 6-1, 24-13 and the random-ranking control have no consumer | outputs: "the cross-sort comparison, for the appendix" and "the random-ranking control's spread per series"; edge `controls→zscore` carries the latter; rule: "the control's spread must lie inside the middle 90% of the random portfolios' spreads that day; if it does not, the random-portfolio percentiles are withdrawn from the page for the day" | APPLY |
| B33 | `sensitivities` | the carried spread has no consumer | `zscore.rule`: "the carried spread is printed beside the conferred one, in the same units" | APPLY |
| B34 | `prices` | membership "at the announcement date" from holdings files | "taken from the archived daily holdings at the effective date of each change; the announcement precedes it, so the backtest is late, not early" | APPLY |
| B35 | `prices`, `severity` | earnings dates from 8-K filing dates are not known five sessions ahead | "In the backtest a name's next earnings date is projected as its 8-K Item 2.02 date one year earlier, moved to the same weekday; companies report on a stable annual cycle and the error is a few days. The realised date is used only to score the page. Live, company calendars give the date." Lookahead stays clean. | DECIDE |
| B36 | `severity` | with 150 component names some name reports on most days of the season | "a component name's earnings count as a catalyst only when the names reporting inside the window hold at least 10% of the component set's weight" | DECIDE |
| B37 | `themescore` vs `bridge` | both decide which statistic is printed first | `bridge` decides; `themescore` reports it | APPLY |
| B38 | `themescore` vs `themevalidation` | the quarterly PM-entry measure appears in both | Delete from `themescore` | APPLY |
| B39 | `timebombs`, `bombtest` | three names for two lists | "the pre-catalyst list" and "the post-unwind list" everywhere | APPLY |
| B40 | `volvalidation` | the 5% margin at step 0 | Resolved by A2 | APPLY |
| B41 | `eventrule` | "at most two expected false pages a month" | "the maximum's own 95th percentile is crossed on 5% of days, about one day a month, by construction" | APPLY |
| B42 | `eventrule` | a calibrated conditional VaR breaches 5% on page days too | "A hit is a realised loss beyond the unconditional 5% quantile of the book's ten-day return. A threshold page earns its place if hits on page days exceed the 5% any day gives." | DECIDE |
| B43 | `pca` | naming skips a flagged first component; a theme the sort has fully aligned with is indistinguishable from the factor | "A theme the sort has fully aligned with, where winners are beneficiaries and losers victims, has the same loading pattern as the factor and is treated as the factor. The flag decides only that the component enters the tail model as a state indicator; naming still runs on it and its name is printed as a diagnostic. If no component passes the noise threshold, the page says so and naming does not run." | DECIDE |

---

## C. Definitions and numbers

| # | Where | Term | Fix | Tag |
|---|---|---|---|---|
| C1 | `french`, g_market | WML | "WML, French's winners-minus-losers momentum factor" at first use | APPLY |
| C2 | `zscore` | DV01; units of the other four | "DV01, the dollar change in value for a one basis point move in yield"; "for WTI, the dollar and the credit spread: notional dollars of the series per $100m of book; for the mega-cap series: a beta" | APPLY |
| C3 | `volvalidation` | pinball loss | "pinball loss, the scoring rule for a quantile forecast, which penalises a breach by 0.95 times its size and a non-breach by 0.05 times the distance" | APPLY |
| C4 | `eventbaseline` | reporting weights; event density; value outside windows | Rename "calendar baseline" everywhere. Rule: "For each catalyst window, 1,000 draws: each name reporting inside the window contributes one of its last eight announcement returns, drawn at random, times its book weight; names not reporting contribute a ten-day return drawn from the trailing year; a macro release contributes the book's return on the last eight releases of that type. The 5th percentile of the draws is the baseline VaR. Outside a window the baseline is the trailing year's ten-day 5% quantile." | DECIDE |
| C5 | `riskextract`, `labels` | era | "three eras: December 2013 to 2019, 2020 to 2022, 2023 onward" | APPLY |
| C6 | `embedspace`, `taxonomy` | news weight | "news weight: the number of news risk statements within the assignment distance of the entry's reference point" at first use | APPLY |
| C7 | `namecluster`, `themescore`, `signoff` | second reader | "the second reader, a second research analyst who checks the first's labels" at first use; `signoff` names the role | APPLY |
| C8 | `filings` | MD&A overview; outlook | "the Overview subsection of Item 7, where present"; outputs say "risk-factor and MD&A text" | APPLY |
| C9 | `filings` | transcript feeds and coverage | EMPIRICS: name the free feeds and the share of names covered | EMPIRICS |
| C10 | `filings` | production layer with no consumer | "In production the third layer feeds the same two steps as the first, text gathering and propagation." | APPLY |
| C11 | `news` | first date with coverage; GDELT start | EMPIRICS: GDELT's first usable date; before it the space is built from filings text alone, and the page says so | EMPIRICS |
| C12 | `posdata` | comomentum residual; filer formula; count | "residual to the market and the six series"; "a filer whose holdings, value-weighted, have an average 12-1 rank in the universe's top decile as of the filing quarter"; count of such filers | APPLY; count EMPIRICS |
| C13 | `prices` | delisting return | "Stooq and Tiingo carry no delisting returns; a name delisted for performance takes −30% (Shumway), otherwise the last trade" | DECIDE |
| C14 | `prices` | on_failure referent; value-weighting sentence | "if a day's price or holdings file is missing"; the value-weighting sentence moves to `sort` | APPLY |
| C15 | `refseries` | which spread, which dollar index, which index for the mega-cap series; the family correction | "ICE BofA US corporate OAS (FRED)"; "the Fed's broad dollar index (FRED)"; "the ten largest Russell 3000 names minus the equal-weighted Russell 3000"; "a series is called unusual only above the 99.2nd time-series percentile, which is 95 adjusted for six series" | APPLY |
| C16 | `sort` | formation date | "the last trading day of each month; formation and rebalance coincide" | APPLY |
| C17 | `random` | sign of a random portfolio's spread | "the first-drawn leg of each random portfolio plays the winner leg, so its spread is signed the same way as the book's and the percentile is one-sided" | APPLY |
| C18 | `controls` | "largest exposure"; "book ranked 24 months earlier" | "largest absolute exposure to the driving series"; "the 12-1 book formed 24 months ago and held to today" | APPLY; 42.6% EMPIRICS to confirm |
| C19 | `sensitivities` | the two windows; how the spread is averaged | "the conferred exposure is the spread of slopes from the 126-day window ending at formation; the carried exposure from the window ending at the next formation, on the same names; each leg's slope is value-weighted" | APPLY |
| C20 | `route2` | winner leg only; "carry most of it" | "the leg holding the larger share of the exposure, named on the page"; "a name's contribution is its weight times its slope" | DECIDE |
| C21 | `covariance` | "remove the market return" | "regress each name's return on the market and keep the residual" | APPLY |
| C22 | `pca` | noise threshold on a shrunk matrix; sign; case-flag formula and scale | "The threshold is the Marchenko-Pastur upper edge computed on the raw correlation matrix with q = N/T; components of the shrunk matrix whose eigenvalue exceeds it are kept." "The sign is that of w'v_k." "The leg mean loading is the |w|-weighted mean of the loadings over the leg's names; the flag requires the two means to have opposite signs and each to exceed half the root-mean-square loading." | DECIDE |
| C23 | `pca` | "lowest name in the set"; the shorthand for price-only carriers | "the lowest correlation among the set's names"; rename "price-correlated names" | APPLY |
| C24 | `bridge` | which component's R-squared decides | "the named component's" | APPLY |
| C25 | `newsagent` | sample; borrowed paraphrase; headline example | "a sample of 2,000 items, stratified by year, labelled once by the current model"; "the paraphrase is only used for embedding, so a near neighbour's paraphrase is acceptable"; one example: the headline "Chipmakers warn tariff ruling could hit margins" gives the span "tariff ruling could hit margins" | DECIDE |
| C26 | `embedspace` | encoder schedule; reference point seeding; "leading theme" with no list; BM25 setup | "one encoder per calendar year with that year's cutoff (EMPIRICS: the family and its cutoffs)"; "the phrase embedding seeds the search and the centroid replaces it"; "the largest cluster by quote weight"; "BM25 queries are each entry's phrase plus its top 20 c-TF-IDF terms, over the paraphrases; agreement is the share of quotes both methods assign to the same entry" | APPLY; EMPIRICS |
| C27 | `pc1text` | passage | "passage: a paragraph" | APPLY |
| C28 | `riskextract` | context length; "significant"; keyword score; recall | "one section per call, split at paragraph boundaries above 6,000 tokens"; drop "significant"; "score: the count of matched terms in the sentence"; "recall is measured on thirty whole documents a quarter, labelled in full" | DECIDE |
| C29 | `namecluster` | "more specific", "no news within the distance" | "rated on a three-point scale by the second reader"; "no news cluster within the assignment distance of the theme's centroid" | APPLY |
| C30 | `propagate` | the 0-3 rubric; cutoff and month count; the wrong-theme entry equal to the current one | "0 no mention; 1 the topic is mentioned without a risk statement; 2 a risk statement on the theme; 3 a risk statement naming it as a principal risk"; cutoff EMPIRICS; "if that entry is the current theme, the next by news weight" | APPLY; EMPIRICS |
| C31 | `poscluster` | overlap unit; what confirms the claim | "the overlap is the share of the theme names' book weight that is heavily positioned, by leg; the non-overlap is the share of heavily positioned weight not on the theme. Random assignment gives 20%; the claim is supported if the overlap's median since 2014 is above it." "when the reconstructed book begins" | APPLY |
| C32 | `timebombs` | the standard deviation; "same direction" | "standard deviation of rolling 20-day returns over the trailing year"; "sign of the name's loading times the sign of the component's move" | APPLY |
| C33 | `severity` | which states | "bear state on or off, case flag factor or theme, inside or outside a catalyst window" | APPLY |
| C34 | `catagent` | the example's status; the type vocabulary | "an illustration written by hand, not a system output"; "type: scheduled or unscheduled" | APPLY |
| C35 | `catapprove` | unit | "fewer than ten a week" | APPLY |
| C36 | `analogue` | quiet dates | "quiet dates: dates at least 21 days from any episode, drawn at random" | APPLY |
| C37 | `composer` | register row 13; blind comparison | "the blind comparison: two readers score the prose page and the template for the same date without knowing which is which" | APPLY |
| C38 | `thepage` | the reader; the decision | See D1 | APPLY |
| C39 | `responselog` | "the relevant position" | "the PM's momentum exposure, measured as the beta of the PM's book to the 12-1 book" | APPLY |
| C40 | `labels` | "Tim" | "the author" | APPLY |
| C41 | `volvalidation` | observations; power; GARCH margin; catalyst types | "scored on the monthly catalyst-window observations, about 150 from December 2013"; power EMPIRICS by simulation before the run; "the same 5% margin against GARCH"; "types: earnings, macro release, and live only, unscheduled" | APPLY; EMPIRICS |
| C42 | `bombtest` | the five dates; the timeline; the detection floor | EMPIRICS: the five first-breach dates from the record; "the pre-catalyst list is frozen 21 sessions before the first breach day; the post-unwind list five sessions after it; each is scored over the twenty sessions that follow its freeze"; "the detection floor at n = 5 is stated in the row" | APPLY; EMPIRICS |
| C43 | `covariance` open | "Parked by the advisor" | "Parked:" | APPLY |
| C44 | retired | "condition concentration", "three model roles debated five rows" | "the share of the loser leg's quotes on its top condition"; "three model roles that argued over five candidate analogues" | APPLY |

---

## D. Brief coverage

| # | Element | Fix | Tag |
|---|---|---|---|
| D1 | 1, problem definition | Add `meta.problem` with five lines, rendered at the top of the legend panel: exposure (the 12-1 decile book, value-weighted, dollar-neutral, rebuilt monthly); event (a ten-day book return at or below −432bp; the tail model targets the rolling 5% quantile, of which −432bp is the long-run value); horizon (ten trading days); user (the PM running momentum, or the risk manager covering that book); decision (whether and how much to hedge the book's exposure to the named theme before the next catalyst, and which names to trim). `thepage.rule` and g_book's brief line point to it. | APPLY |
| D2 | 6, example output | Out of scope for the spec; the memo repo carries the example page. The spec says so in `thepage.open`. | APPLY |
| D3 | 7, production path | g_output synthesis gains: "In production the page is a continuously maintained state pushed on change, the response log is the first item, and the licensed feeds replace the public ones layer by layer; each data node names its production feed." | APPLY |
| D4 | 3, tradeoffs | The "Direction" sentences stay where they are; the legend gains an entry "direction: every stated caveat says which way it biases the page" so a reader knows to look for them. | APPLY |

---

## E. Viewer changes implied

- B1: chip class names and `laText` maps in `index.html` and `levels.html`; the detail panel shows the
  same word as the chip.
- A4: the legend panel renders path, deferred and described-only with the path notes.
- D1: the legend panel renders `meta.problem` first.

---

## F. The writing pass

Applied from the LLM-pattern report, in this order of precedence: where an A or B fix rewrites a
sentence, that rewrite wins; otherwise the report's plain rewrite is applied as written.

| # | Class | Rule applied | Tag |
|---|---|---|---|
| F1 | Personification (about 30) | Pages, records, rules and baselines get no verbs of speech or thought. The ten `on_failure` variants of "the page states it" become "with a note on the page". "knows the calendar" becomes "uses the calendar". | APPLY |
| F2 | "Carry" in five senses | Reserved for the conferred/carried pair. "theme carriers" becomes "theme names outside the component set"; "price-only carriers" becomes "price-correlated names"; "carries the theme" becomes "contains the theme"; "the sentence the memo will carry" becomes "the sentence that goes in the memo". Edge labels likewise. | APPLY |
| F3 | Label-colon fragments and announced counts | "Direction:", "Case flag:", "Control:", "Calendar:", "Threshold:" written into sentences; "Three controls.", "News is processed twice.", "A page has two triggers." replaced per the report. | APPLY |
| F4 | The three stop sentences | "builds in the news" → "has been building in the news for some time"; the conferred/carried aphorism → "If an exposure is conferred but not carried, the ranking selected it and the book lost it during the holding period"; the hours line per A4. | APPLY |
| F5 | Definitional padding | The 75-word look-ahead sentence in g_inputs becomes one sentence pointing to the legend plus five short definitions; the g_market 74-word sentence is split as the report has it. | APPLY |
| F6 | Over-correction | The three declarative stacks (g_positioning_data, g_severity, g_analogue) take the report's rewrites with connectives. | APPLY |
| F7 | Meta-writing | "no longer called a route", "This replaces what v1 called Route 3", "this is the quote gate referred to throughout", "the panel is gone and the rule remains" deleted or folded. | APPLY |
| F8 | Coinages dropped | leads the page → printed first; the reading → the result; fired → triggered; consensus bet, shared bet → the names where positioning and the theme overlap; catalyst proposer → the step that proposes catalysts; aptness verdict, both matchings, cutoff side, loss-direction share, theme-case expanded in edge labels. | APPLY |
| F9 | Coinages kept | quote gate, conferred/carried, case flag, context layer, event stream, catalyst window, hit/miss/silence, placebo, book effect (as redefined in A3), driving series, design tier, seal (one verb: opened), known-theme assumption, comparator, reference point, assignment distance, residual cluster, comomentum. | APPLY |
| F10 | Group titles | Keep "1. Inputs, dated when they became public" style throughout: "3. Naming the theme and finding where it has spread"; "5. Severity and timing". | DECIDE |
| F11 | Change log | The draft-6 entry's fragments rewritten per the report; older entries left as history. | APPLY |
| F12 | Ten rules | The report's ten rules are appended to `eval-rubric.md` as the writing standard for every later draft. | APPLY |

---

## What I would do first

A1 to A7 in one pass (they touch the same nodes: cluster, namecluster, themescore, severity, pca,
random, refseries, thepage, eventrule), then B and C node by node, then D, then the viewers, then F
as a read-through of every rule and synthesis. Snapshot as `versions/v2-draft-7.yaml`, changelog
entry with the reasoning, re-run the three evaluators (rubric, skeptic, slop) on the result.
