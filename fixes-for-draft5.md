# Surgical fixes for draft 5

Sources: the clarity report (`docs/reviews/clarity-v2-draft-4.md`), the LLM-pattern report
(`docs/reviews/slop-v2-draft-4.md`), and the hygiene list from the parsimony review. The parsimony cuts
themselves are a separate decision and are not in this list.

Tags: **APPLY** (I do it as written), **DECIDE** (a value or design choice; I give a proposal), **EMPIRICS**
(a number that must come from the package).

---

## A. Mechanical: dangling references, contradictions, duplicates

| # | Where | Now | Fix | Tag |
|---|---|---|---|---|
| A1 | edges from retired nodes | `route1→severity`, `route1→eventrule`, `route3→eventrule`, `labeller→composer`, `panel→composer`, `classify→route1`, `analogue→panel`, `referees→register` still live | Add all eight to `drop_edges`. Retired nodes keep no edges. | APPLY |
| A2 | `refseries` outputs, `sensitivities` inputs, edge `refseries→sensitivities` | "eight daily series" | "six daily series" everywhere | APPLY |
| A3 | `random` inputs | "leg sizes and cap profile", produced by nothing | `sort` outputs gain "leg sizes and cap profile"; edge `sort→random` added carrying it | APPLY |
| A4 | edge `random→pca` | carries "placebo eigenvalues and shares" that `random` does not produce | `random` outputs gain "the same statistics on each random book: eigenvalues, variance shares, text mass"; `covariance.checks` sentence moves into `random.rule` | APPLY |
| A5 | edge `controls→zscore` | carries "same-rule and stale books"; `zscore` never uses them | Retarget to `sensitivities` (which mentions the stale-book control); `zscore` unchanged | APPLY |
| A6 | `random.checks` | "bootstrap interval on the placebo maximum's 95th percentile" (family-maximum form is retired) | Delete the check | APPLY |
| A7 | `themescore` inputs vs edges `bridge→themescore`, `taxonomy→themescore` | R² and top entry arrive but are not listed or used | Add both to inputs; rule gains "the bridge R² decides whether the exposure statistic or the theme leads the page (cutoff in D4); the agreement line compares the taxonomy's top entry by news weight with the component's name" | APPLY (cutoff: DECIDE, see D4) |
| A8 | edge `random→cluster` | "sector-matched random sets" not in `cluster` inputs | Add to `cluster` inputs | APPLY |
| A9 | `severity` inputs and edge `french→severity` | "event thresholds" and "the crash inventory" arrive and are unused | Remove both from `severity`; the inventory's home is D13 | APPLY |
| A10 | `timebombs` inputs | rule uses the component's return and the positioning quintile; inputs list neither | Add "component return (from pca)" and "positioning score per name"; add edges `pca→timebombs`, `posdata→timebombs` | APPLY |
| A11 | `responselog` inputs vs `signoff` outputs | "signed page" vs "acknowledged page" | "acknowledged page" in both | APPLY |
| A12 | edge `signoff→labels` | duplicate edges, one says "never done" | One edge, carries "monthly labelled sample"; the "never done" note moves to `labels.open` as "has not yet run" | APPLY |
| A13 | duplicate edges | `sort→severity` ×2, `zscore→route2` ×2, `eventrule→composer` ×2, `severity→composer` ×2, `thepage→falsifiers` ×2 | One edge each; merge the labels | APPLY |
| A14 | `thepage` item 7 | "what the usual screens show", produced by nothing | Replace with "(7) sector concentration of each leg and the index implied-correlation level, as the conventional screens a desk already has"; `prices` outputs already carry sector codes; add edge `posdata→thepage` for implied correlation? No: implied correlation is not in v2 data. Decide: drop item 7 or add Cboe implied correlation to `refseries`. Proposal: drop. | DECIDE |
| A15 | `composer.rule` | "When a model version changes, affected series are recomputed..." (composer has no series) | Move the sentence to `riskextract.rule` and `propagate.rule` as "When the model version changes, every series this role feeds is recomputed and the page shows the change as a step." | APPLY |
| A16 | `newsagent.on_failure` | "last space used" (that is `embedspace`'s failure) | "the previous week's statements are reused and the page states it" | APPLY |
| A17 | lanes | "Step 1: decomposition" ... "Step 4: propagate" against the 1 to 7 hierarchy | Lane names lose the step numbers: "Decomposition", "Context space", "Naming", "Propagation". Lane ids `routes`, `context2` renamed `tail`, `analogue` | APPLY |
| A18 | `register.rule` | "Sealed years (2023 onward) opened once" vs `bombtest` calling 2025 in-sample | Rule becomes: "The 2023-onward seal was spent in v1 on the severity breach test. Every v2 test runs on the full 2013-onward sample and is labelled design tier; a forward seal from the memo date is the confirmatory sample." `bombtest` drops "in-sample" and says "the five recorded unwinds since 2020" | APPLY |
| A19 | `register.rule` | "entropy withdrawn", "Route 1 severity state broadened" revisions from v1 | Delete both from the v2 rule; they stay in the v1 baseline | APPLY |
| A20 | `bombtest` vs `timebombs` | contagion list "read after an unwind starts" tested "the month before" | `bombtest.rule`: "the pre-catalyst list as of the month before each unwind; the contagion list as of five sessions after the unwind's first breach day; outcome over the following twenty sessions" | APPLY |
| A21 | `pmworries` vs `embedspace` | PM "can declare that a phrase should be an anchor" vs anchors are centroids of nearest news statements | `pmworries.rule`: "can add an entry to the taxonomy; every entry, PM-added or not, is placed the same way" | APPLY |
| A22 | `themescore.checks`, `composer.checks` | fragments split mid-phrase | Rewritten as full sentences under the quoting fix (done) and re-checked | APPLY |
| A23 | `route2.checks` | "check 5 recovered 3 of 4", a v1 artefact | Delete | APPLY |
| A24 | `classify` edge label | carries "two objects share the name Route 1" | Removed with A1 | APPLY |

---

## B. Definitions and missing numbers

| # | Where | Missing | Proposal | Tag |
|---|---|---|---|---|
| B1 | `zscore`, `route2`, `g_book`, `thepage` | "driving series" never defined | "The driving series is the one of the six on which the book's conferred exposure has the highest time-series percentile that month, re-chosen at each rebalance and printed by name." Define at first use in `g_book` and in `zscore.rule`. | DECIDE (proposal given) |
| B2 | `themescore`, `thepage` item 2 | the bp loss mechanism | "Sigma is the component's daily return standard deviation over the 126-day window, scaled to ten days. The loss is the sum over the component set of w_i × β_i × (−2σ) plus the sum over theme carriers of w_j × b_j × (−2σ), where β_i is the name's loading and b_j is the carrier's beta to the component over the same window. Reported in bp of book NAV, with the sign taken from the loss-direction composition." | DECIDE (proposal given) |
| B3 | `severity`, `eventbaseline`, `volvalidation` | historical catalyst dates; no node supplies an earnings calendar | Add to `prices` (renamed "Market data and calendars") the outputs "earnings dates per name (from 8-K Item 2.02 filing dates historically; from company calendars live)" and "scheduled macro releases (FOMC, CPI, payrolls, index rebalances)". Edges `prices→severity`, `prices→eventbaseline`, `prices→volvalidation` carry them. `catagent` keeps only unscheduled proposals. | APPLY |
| B4 | `posdata`, `poscluster`, `propagate` | positioning quintile defined three ways | One definition: "the top quintile of the positioning score computed within each leg of the book". `propagate` scope becomes "the rest of the book, plus names outside the book that sit in the universe's top quintile by the same score", stated as a second, separate set. | APPLY |
| B5 | `pca` | case-flag statistic and boundary | "Compute the loading-weighted mean loading per leg. If the two means have opposite signs and each exceeds 0.1 in absolute value, the component is the momentum factor; otherwise it is a theme. Mixed cases are themes with the leg means printed." Also: "If the first component is the factor, naming runs on the second." | DECIDE (proposal given) |
| B6 | `zscore`, `eventrule` | length of "own history" | "the book's own history from December 2013, with a minimum of 24 months before a percentile is printed" | APPLY |
| B7 | `eventrule` | eight daily 95th-percentile triggers cannot give two false pages a month | "The threshold trigger is joint: a page fires when the daily maximum across the monitored statistics (ten-day VaR, the first component's variance share, the six exposures) crosses the 95th percentile of its own history, the family form that gives at most two expected false pages a month; a page names which statistic crossed." | APPLY |
| B8 | `severity`, `thepage` | catalyst window length; "unconditional" in the bump | "The catalyst window is the ten trading days beginning five sessions before the catalyst, so it matches the ten-day horizon. The unconditional VaR is the same model with the window indicator set to zero." | DECIDE (proposal given) |
| B9 | `severity` ablation | "price-only signature" produced by nothing | Define in `pca` outputs: "price-only carriers: names outside the component set whose 126-day correlation with the component exceeds the correlation of the lowest name in the set". Rung 1 uses it. | APPLY |
| B10 | `bridge`, `themescore` | R² cutoff | 0.5. "Above 0.5 the exposure statistic leads the page and the theme name is printed as confirmation; below, the theme leads." | DECIDE (proposal given) |
| B11 | `cluster`, `namecluster` | one residual cluster or several | "Quotes beyond the threshold from every entry are clustered among themselves with the same HDBSCAN settings; each residual cluster is named separately." | APPLY |
| B12 | `embedspace` | HDBSCAN minimum cluster size; number of nearest statements per entry | Minimum cluster size 25; entry reference point = centroid of its 50 nearest news statements. | DECIDE (proposal given) |
| B13 | `embedspace` | "ChronoBERT-class" is a masked LM, not a sentence encoder | "a masked language model with a training cutoff before each date, mean-pooled over tokens to give sentence vectors, fine-tuned for sentence similarity on pre-cutoff text" | APPLY |
| B14 | `pca` | stability check threshold | "the Jaccard overlap of the component set with the previous month's, printed; below 0.5 the component is flagged as unstable" | DECIDE (proposal given) |
| B15 | `posdata` | how comomentum and 13F overlap become per-name ranks | "comomentum per name: the name's average 126-day residual correlation with the other names in its leg; 13F crowding per name: the number of momentum-style filers holding it, where a momentum-style filer is one whose holdings' 12-1 rank is in the top decile on average" | APPLY (definition: DECIDE) |
| B16 | `sensitivities` | window length; raw vs residualised; the "trend's own part" | Window 126 trading days; the printed line is market-residualised; delete the "trend's own part" comparison (its construction was never stated). | DECIDE |
| B17 | `zscore` | conversion to hedgeable units | "The slope on a series times the book's NAV is the notional of that series the book is exposed to; for the ten-year it is stated as DV01-equivalent dollars per $100m of book, for the index as beta." | APPLY |
| B18 | `refseries` | units of each series | "S&P 500 return; ten-year yield change in bp; WTI return; dollar index return; IG spread change in bp; the return of the ten largest names minus the equal-weighted index return" | APPLY |
| B19 | `prices` | which date ETF membership is keyed to; leg sizes | "keyed to the announcement date of each change, which precedes the effective date"; "about 300 names per leg" | APPLY |
| B20 | `sort` | dollar neutrality, book return | "Legs are dollar-neutral; the book return is the value-weighted winner return minus the value-weighted loser return" | APPLY |
| B21 | `french` | which sample the two thresholds come from; agreement statistic | "−432bp is the 5th percentile of overlapping ten-day French factor returns 1926 to 2022; −933bp is the 1st percentile of daily French factor returns over the same dates; the reconstructed book's monthly correlation with the French factor is [ρ]" | EMPIRICS for ρ and the −933bp definition |
| B22 | `options` | loading of which component; unit | "loading on the first component; unit is the implied ten-day move in per cent" | APPLY |
| B23 | `volvalidation` | what one monthly observation is | "the catalyst-window VaR on the window's first day against the realised ten-day book return; where a month has several catalysts, the nearest" | APPLY |
| B24 | `eventbaseline` | put on the same footing as a VaR | "the baseline's own 5% quantile: each name's historical announcement returns are resampled with the window's reporting weights to give a distribution of window returns; its 5th percentile is the baseline VaR" | DECIDE (proposal given) |
| B25 | `analogue` | why 2014; the field-comparison rule; embargo | "theme and positioning dimensions exist from January 2014, when daily holdings and 13F overlap both begin"; "the rule: an analogue is apt if its bear state and the sign of its first-component case flag match today's and its theme name is the same taxonomy entry"; "dates within one year of today are excluded" | APPLY (rule: DECIDE) |
| B26 | `falsifiers` | success rate; weekly summaries | "A page is scored only if it is a calendar or threshold page; the weekly summary is not scored. The register sets the hit rate a page type must beat: the 5% base rate for a threshold page." | APPLY |
| B27 | `responselog` | base rate | "the share of weeks in which the PM changes the relevant position with no page" | APPLY |
| B28 | `newsagent`, `riskextract` | what the distilled classifier classifies; how filings are made name-blind | "the classifier labels each sentence as a risk statement or not, and each risk statement's sign; the paraphrase comes from the LLM at labelling time and from the nearest labelled paraphrase thereafter"; "the company name, ticker and dates are redacted from the text before the prompt" | APPLY |
| B29 | `riskextract` | which model and cutoff | Claude Haiku-class for extraction, cutoff stated; the encoder's cutoff per backtest date | EMPIRICS (model id) |
| B30 | `thepage` | horizon of the catalyst-window VaR; is a beta printed | Window is ten days (B8), so one horizon holds; "the page prints the reader's beta to the paper book if positions are an input, and otherwise says how to compute it" | APPLY |
| B31 | `catagent` | type field | "type is scheduled (from calendars, no model) or unscheduled (model-proposed)" | APPLY |

---

## C. Vocabulary: global renames

Apply across `spec.yaml`, `groups.yaml`, `changelog.yaml` and the two viewers' legends. Definitions at first use are in section D.

| Drop | Use instead | Notes |
|---|---|---|
| twin | comparator; "retrieval-only run", "keyword comparator", "template" as appropriate | "twin" implies equality |
| canary (sort) | random-ranking control | |
| canary (daily) | daily test date | |
| anchor / anchored | reference point / fixed to | |
| signature / signature carriers | carries the theme / theme carriers | |
| lane (news) | slow process (archive) / fast process (last five sessions) | diagram rows keep "lane" only in code |
| line / reading / headline | statistic / printed as a line / leads the page | |
| fire / fires | trigger / is triggered | |
| bump | the catalyst-window increase in VaR | |
| rung / ladder | step / ablation sequence | |
| time bombs | vulnerable names, pre-catalyst / contagion | node id can stay `timebombs` |
| mass | weight (quote weight, news weight) | |
| crescendo view | define once (D2) then say "on that view" | |
| instrument | method | |
| machinery | pipeline | |
| banner | a note at the top of the page | |
| standing state | continuously maintained page | |
| the story | the seven steps | |
| bites | becomes relevant | |
| vehicle | expressed through | |
| flatten | carried at zero return | |
| fingerprinted | hashed and stored | |
| gap / gap token / losing branch | unresolved outcome / placeholder / the other outcome's sentence | |
| engine check | reconciliation against the French file | |
| object | vector / list / statistic | |
| noise edge | Marchenko-Pastur threshold (same as bulk edge; one term) | |
| conferred / carried | keep, defined at first use in `g_book` | |
| quote gate, case flag, context layer, event stream, catalyst window, hit/miss/silence, placebo, embargo, supersession | keep, each defined at first use | |

---

## D. Definitions to insert at first use

| # | Where | Insert |
|---|---|---|
| D1 | `g_book` synthesis, first sentence | "An exposure is conferred when the ranking window selected it and carried when the book still holds it over the holding period." |
| D2 | `meta.note` and `taxonomy.rule` | "The design assumes that the theme behind a reversal is known before the reversal, builds in the news, and can be named by the PM; the system's job is to measure how much of the book depends on it and where it has spread, not to discover it. Call this the known-theme assumption." (replaces "crescendo view" everywhere) |
| D3 | `g_theme` synthesis | "A comparator is a method that does the same job without a language model and is printed beside it." and "A name carries the theme when its filings contain a risk statement assigned to the theme, with the quote." |
| D4 | `g_inputs` synthesis | "Every node carries a look-ahead label: clean means it uses only values public on the date; as-of means the values exist but must be taken at their release date; model means a model trained after the date reads text from inside it, with the mitigation stated; live only means no mitigation exists and the node is excluded from every backtest; human means a person's input that a backtest must run without." |
| D5 | `meta` | a `legend` field: status settled = decided in v2; memo = a v1 component, unchanged and described in the v1 memo; retired = replaced, kept with its reason. row = a register row; role = a numbered model role in the v1 memo. |
| D6 | `filings.rule` | attach the name: "Every extracted span must string-match its source before storage; this is the quote gate referred to below." |
| D7 | `g_tail` synthesis | "The output in a PM's units is a ten-day 5% VaR and expected shortfall in bp of book, and how much worse both become inside a catalyst window." |
| D8 | `g_validation` synthesis | one clause per test on status: "run in v1 / not yet run" (B29 and register status) |
| D9 | `posdata.rule` | "comomentum" used only in the positioning sense; `pca` says "the momentum factor itself" and drops the word |

---

## E. Synthesis rewrites (groups.yaml)

Adopt the rewrites in the LLM-pattern report section "The seven syntheses" for every group and sub-group, with these substitutions applied on top: the renames of section C, the definitions of section D inserted at the first use in each, and these three corrections from the clarity report:

- `g_crowding`: both lists are drawn from crowded theme carriers (the overlap), not the non-overlap. Sentence: "Names that are both heavily positioned and carry the theme are the consensus bet, and the two lists of vulnerable names are drawn from them: names that have rallied with the component before the catalyst, and names that have not yet moved after an unwind has started."
- `g_market`: "six macro reference series with first-print vintages" becomes "six macro reference series, with first-print vintages where a series is revised".
- `g_output`: "readings cross their history" becomes "one of the book's own statistics crosses the 95th percentile of its own history".

Group names lose the comma-tail: "The book and the bets the ranking rule gave it", "Propagate and the two theme numbers", "How bad and when", "What the PM sees and does". APPLY.

---

## F. Rule rewrites (spec.yaml)

Adopt every rewrite in the LLM-pattern report's "Spec rules, node by node" table and its "Edges and short fields" table, with section C renames applied. Three the report did not cover and the clarity report needs:

| # | Node | Now | Replacement |
|---|---|---|---|
| F1 | `riskextract.rule` | "a sign (the company gains or loses if the risk materialises)" | "a sign: whether the company loses or gains if the risk materialises. Item 1A statements are losses by construction; the sign is informative for MD&A and event text, where a company may state that it benefits, for example from higher rates." |
| F2 | `cluster.rule` | "composed into loss direction (leg × loading sign × quote sign)" | "Each quote's book effect is the product of three signs: +1 for the winner leg and −1 for the loser leg; the sign of the name's loading on the component; and −1 if the company loses when the risk materialises, +1 if it gains. A product of −1 means the book loses if the risk materialises. Quote weights are summed separately for the two products." |
| F3 | `propagate.rule` | "Placebo: the same run with last year's headline theme; the false-signature rate" | "Control: the same run with a plausible but wrong theme, taken as the taxonomy entry with the most news weight twelve months earlier; the share of names it marks as carrying that theme is printed beside the true rate as the false-positive rate of the method." |

`when` on edges is split into two fields: `when` (daily, weekly, monthly, at rebalance, on change) and `mode` (backtest, live only, once). "at rebalance", "at formation" and "monthly rebuild" become one value, "at rebalance". APPLY.

---

## G. Viewer and files

| # | Change |
|---|---|
| G1 | Both viewers render `meta.legend` in the history or story panel, so the look-ahead, status, row and role labels are explained where the reader meets them. |
| G2 | The cards' look-ahead chip reads clean / as-of / model / live only / human, matching D4. |
| G3 | `versions/` gains `v2-draft-5.yaml` and `.merged.yaml`; the change log entry lists sections A to G by number. |
| G4 | The public repo is refreshed from the working copy after the commit. |

---

## H. What this list does not do

- It does not apply the parsimony cuts. Those are a separate decision and the list above is written so that it holds whether or not a node is later merged.
- It does not run any test; every EMPIRICS item stays a placeholder sentence until the number exists.
- It does not touch the v1 baseline snapshot beyond the edge quoting already done.

## I. Counts

| Tag | Items |
|---|---|
| APPLY | 45 |
| DECIDE, with a proposal given | 12 |
| EMPIRICS | 3 |

Decide items in one line each: B1 driving series, B2 bp-loss mechanism, B5 case-flag boundary, B8 catalyst window and unconditional definition, B10 R² cutoff, B12 cluster sizes, B14 stability threshold, B15 positioning constructions, B16 sensitivities window and the dropped comparison, B24 baseline quantile, B25 aptness rule, A14 item 7 on the page.
