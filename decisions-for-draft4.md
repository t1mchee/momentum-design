# Decisions for draft 4: alternatives per issue, and the look-ahead map

Input: the three-reviewer panel on draft 3 (`docs/reviews/panel-v2-draft-3-collated.md`). For each issue,
the alternatives worth choosing between, the trade-off, and my pick. Nothing here needs to be causal to be
in the design; the second part labels which components carry look-ahead so the proof of concept can be
scoped to the parts that do not, or that can be made clean.

---

## Part 1. Choices

### 1. One tail model or two

- **A. Fold.** Put the vol regressors (theme share, signature share, positioning overlap, days to catalyst,
  catalyst-window indicator) into the existing `severity` quantile regression; target the lower tail of
  forward book return; print VaR and ES as the element-6 number; report the ablation with and without the
  text features. One model, one breach test, one horizon.
- **B. Two models, chained.** Keep `volmodel` for the catalyst-window bump and feed its forecast into
  `severity` as a regressor. Two numbers on the page (bump, VaR), two validations.
- **C. Vol only, severity derived.** Keep `volmodel`; derive severity as vol forecast × the standardised
  left-tail quantile from the historical record with its skew. No separate quantile regression.
- **D. Event-window quantile.** A second quantile regression fitted only on catalyst windows, beside the
  daily one. Directly answers "what does the book lose around this catalyst" but has ~150 monthly
  observations to fit on.

Trade-off: A is the cleanest and answers the brief; B keeps the advisor's vol framing visible; C is the
practitioner shortcut; D is the most specific and the least identified. **Pick: A**, with the
catalyst-window indicator so the bump still appears as a conditional VaR difference.

### 2. The implied comparator

- **A. Component-set event-implied move only.** Aggregate the single-name implied earnings moves of the
  component set, weight by loading. Honest, constructible from listed options, and it is where the claim
  lives ("the market underprices this catalyst for these names").
- **B. Book-level implied.** Loading-weighted single-name implied event moves combined with index implied
  correlation to a book variance. Needs the correlation assumption stated and a full options surface.
- **C. Sector ETF implied as proxy.** SMH or the relevant sector ETF's implied move around the date. Cheap,
  tradeable, but it is the market's price for the sector, not the book.
- **D. No implied comparator.** Compare against the historical-bump baseline and the earnings-density model
  only; say the market comparison is a production item.

Trade-off: A is defensible and narrow; B is what the page claims and is hard; C is what a desk would trade;
D concedes the claim. **Pick: A for the design, with C printed beside it as the hedge instrument's price.**

### 3. The PCA object

- **A. Full fix.** Book variance share with position weights, λ_k (w'v_k)² / (w'Σw); sign fixed relative to
  the book; leg × loading sign × quote sign composed into a loss-direction share; placebo from cap- and
  sector-matched random books; the same-sign versus opposite-sign rule to detect when PC1 is the momentum
  factor itself; the bridging regression of each component on the eight series.
- **B. Minimal.** Keep name-level variance explained, add the placebo and the same/opposite-sign rule only.
- **C. No PCA.** Regress the book's return on a fixed set of named candidate themes (industry baskets, the
  eight series, a memory basket) and take the theme with the largest R² share. Everything is named by
  construction; nothing emergent can be found.
- **D. PCA per leg.** Decompose the winner leg and the loser leg separately, so PC1 cannot be the
  winner-minus-loser factor; then ask whether the two legs' first components are the same theme with
  opposite sign.

Trade-off: A is arithmetic on data already on file and is what the page claims; B leaves the headline number
meaning the wrong thing; C is the crescendo view taken to its end and loses the discovery claim; D is
elegant and adds a second decomposition to explain. **Pick: A, with D as a printed diagnostic** (the
per-leg first components beside the joint one).

### 4. Look-ahead in the text layer

Not exclusive; a bundle.

- **A. Date-constrained encoders for everything that embeds.** Use a ChronoBERT-class model whose training
  cutoff precedes each backtest date for `embedspace`, `cluster` and the retrieval half of `propagate`. This
  is exactly what such models are for and it makes the clustering and retrieval clean.
- **B. Blind prompts plus a cutoff split for the LLM roles.** Strip names and dates from the context given
  to `riskextract` and `propagate`; measure extraction and scoring error before and after the LLM's
  training cutoff; the difference bounds the contamination.
- **C. Post-cutoff claims only.** Make every predictive claim about the text layer on months after the
  models' training cutoffs; label earlier months, including 2020, as illustration.
- **D. Distil to a dated classifier.** Use the LLM once as a labeller, train a small classifier on a
  date-constrained encoder from its labels, and run the classifier historically. The LLM never touches
  pre-cutoff text in the backtest.
- **E. Anonymised ablation.** Re-run 2020 with entities stripped and report the difference.

**Pick: A + B + C**, with D as the production path for the extraction and propagation roles. E is cheap and
worth a line.

### 5. Embedding and clustering mechanics

- **A. Fix the mechanics.** Name the model and algorithm; PM phrases as queries whose retrieved neighbours'
  centroid is the anchor; a canonical short paraphrase for embedding with the verbatim span kept; threshold
  from the within-cluster distance distribution; supersession instead of decay; re-assign every in-window
  quote at each rebuild; text mass measured against sector-matched random sets; run with and without PM
  centres.
- **B. Fixed taxonomy, no clustering.** A registered list of about thirty external conditions with an
  "other" bucket; the extractor maps each quote to it directly; the news space is used only to rank the
  taxonomy entries by current mass. Comparable across dates by construction; nothing emergent until the
  quarterly "other" review.
- **C. Seeded topic model.** A BERTopic-style model on the pooled news and filings corpus with the PM's terms
  as seed topics and c-TF-IDF labels; the LLM names only the residual topics.

Trade-off: A keeps discovery and costs the most specification; B is the reviewers' repeated suggestion and
loses emergent themes between reviews; C is a middle path with a standard tool. **Pick: A for the design,
with B's taxonomy as the fixed centroid set** (replacing "about five PM worries" with "a registered list the
PM edits"), so the space has stable anchors and still finds residuals.

### 6. Retirements

- **A. Retire all eight.** `route1`, `route3`, `classify` as nodes, `labeller`, `panel`, `referees` from the
  graph, the two unnamed PCs, the product formula, PPI at 90 labels.
- **B. Retire and archive.** Same, but each retired node stays in the spec with status `retired` and a
  one-line reason, so the history is on the canvas.
- **C. Partial.** Keep `panel` as an ablation, keep the two PCs named by their loadings, keep Route 2 as a
  labelled reading.

**Pick: B**, with Route 2's reading kept as the z-score line in hedgeable units and the route vocabulary
gone from the page.

### 7. What fires a page

- **A. Calendar plus threshold.** A page five sessions before each approved catalyst carrying the
  conditional VaR and the bump; a threshold page when the severity VaR or the book's component share
  crosses a time-series percentile of its own history.
- **B. Standing state, pushed on change.** No pages; a state (theme, share, bombs, next catalyst, VaR)
  always on screen, with a push when any element changes by more than a registered amount.
- **C. Threshold only, on time-series percentiles.** Drop the calendar trigger; the catalyst enters as a
  regressor and the VaR moves.

**Pick: A**, because the brief asks for an example output and a page is that output; B is the production
form and should be named in §7.

### 8. Time bombs

- **A. Pre-catalyst object.** Carriers of the theme signature that have rallied with the component and are
  crowded: the names with the most to give back.
- **B. Contagion object.** As written: carriers that have not moved while the component has, read after the
  unwind starts.
- **C. Both, as two lines**, with the event study registered for each on the in-sample unwinds (2020-11,
  2021-Q1, 2022-11, 2025-01, 2025-04), split by leg, positioning as of the date.

**Pick: C.** The two objects answer different questions and the test is the same design.

### 9. The positioning composite

- **A. Two named components with weights.** Comomentum (Lou-Polk) and 13F crowding (Brown-Howard-Lundblad)
  as the score; short interest as the loser-leg reading; quintile over the book; maximum input lag printed.
- **B. Daily-available core, lagged overlay.** Score from lending utilisation, ETF flow, options open
  interest and co-movement; 13F and short interest printed as separate lagged lines, never mixed in.
- **C. No composite.** Print each measure separately with its lag; let the PM read them.

**Pick: A for the score, with B's daily measures as the first purchase in production**, and the lag printed
either way.

### 10. The page

- **A. Full.** bp loss under a minus-two-sigma component scenario including signature carriers; direction
  from the composed sign; hedge instrument and its cost; beta mapping to the reader's book; one horizon for
  the headline number; what changed since the last page.
- **B. Direction and loss only.** Add the bp loss and the direction; leave instrument and mapping to
  production.
- **C. As is, relabelled.** Keep the current contents; label the book as the paper 12-1 book; drop "get out
  now or hedge now".

**Pick: A**, since the brief scores usefulness of the example output directly and every element in A is
computable from the design.

### 11. Text sources

- **A. Layered.** 10-K and 10-Q risk factors as the annual and quarterly context; 8-Ks (Items 2.02, 7.01,
  8.01) and transcripts as the intra-quarter event stream; a free timestamped news archive (GDELT, Fed,
  Treasury, BLS) for the context space, with Bloomberg named as the production feed.
- **B. 8-K as the only stream** plus 10-K annual context; no news archive.
- **C. Transcripts as the primary stream**, 10-K for context, no 8-K.

**Pick: A.** It meets the brief's timestamped requirement on public data and gives the news space an archive
back to 2014.

### 12. Organising principle

- **A. PCA first.** The decomposition finds the component; text names it; the PM's list is the comparator.
- **B. PM list first.** The list names the theme; `propagate` measures its spread; PCA runs monthly as the
  check for a component the list did not name.
- **C. Both in parallel**, with the agreement between the list's theme and PC1's name printed as a line.

**Pick: A, with C's agreement line**, because A is the half that can be validated without a PM, and the
crescendo view predicts the agreement line will usually read "same", which is itself the finding.

### 13. Two smaller ones

- **News cadence.** A: twelve-month space rebuilt weekly (context). B: daily incremental with a fast lane for
  new dense regions. C: both, with the fast lane feeding `catagent` only. **Pick: C.**
- **Number of components.** A: PC1 only. B: top three behind a bulk-edge test. C: as many as clear the
  placebo. **Pick: B.**

---

## Part 2. The look-ahead map

Three kinds of look-ahead, each with a different remedy:

- **Data look-ahead**: using a value before it was public. Remedy: as-of dating. Fully fixable.
- **Model look-ahead**: a model trained after the period reads text from inside it and selects, scores or
  associates with knowledge of what followed. Remedy: date-constrained models, blind prompts, cutoff
  splits, or post-cutoff claims only. Partly fixable.
- **Human look-ahead**: a person in 2026 supplies a list, a merge or a label for a historical date. Remedy:
  registered lists frozen before the run, or the backtest run without the human input. Fixable by design.

| Node | Look-ahead | Kind | Mitigation | Clean for the PoC? |
|---|---|---|---|---|
| `prices`, `sort`, `random`, `controls` | none | — | already point-in-time | yes |
| `refseries` | data, mild | data | ALFRED first prints; the two PCs need a pre-sample | yes |
| `french` | none | — | frozen thresholds | yes |
| `filings` | none | — | dated at acceptance; quote gate | yes |
| `news` | data | data | rebuild the space as-of each backtest date from an archive | yes if the archive is used as-of |
| `posdata` | data | data | key every source to release, never settlement | yes |
| `options` | data | data | historical surfaces as-of | yes if the history exists |
| `sensitivities`, `zscore` | none | — | rolling windows closed before formation | yes |
| `covariance`, `pca` | none | — | trailing window closed at formation | **yes: the causal spine** |
| `newsagent` | model, selection | model | date-blind prompt; or a dated classifier distilled from LLM labels | partly |
| `embedspace` | model, association | model | **ChronoBERT-class date-constrained encoder**; BM25 as the lexical twin | **yes with a dated encoder** |
| `cluster` | model, association | model | same encoder; supersession not decay | yes with a dated encoder |
| `pmworries` | human | human | backtest without PM centres; registered taxonomy frozen before the run | yes by design |
| `pc1text` | none | — | dated documents | yes |
| `riskextract` | model, selection | model | blind prompts; cutoff split; distil to a dated classifier | partly; post-cutoff months clean |
| `namecluster` | model, low | model | names grounded in the 20 nearest quotes; c-TF-IDF twin | low stakes; print the twin |
| `propagate` | model, scoring | model | retrieval with the dated encoder first; LLM rerank only post-cutoff; retrieval-only as the historical twin | **yes for the retrieval half** |
| `themescore` | none itself | inherits | clean if its inputs are | inherits |
| `poscluster`, `timebombs` | none | — | positioning as-of; the event study is clean | **yes: the second causal test** |
| `catagent` | model, not mitigable | model | none; a 2025 model reading 2019 news proposes what mattered | **no: live-only, excluded from the backtest** |
| `catapprove` | human | human | not in the backtest | live-only |
| `severity`, `garch`, `volvalidation` | none | — | earnings calendar known in advance | **yes: the third causal test** |
| `analogue` | none | — | one-year embargo | yes |
| `panel` | model, not mitigable | model | knows what followed 2009 | no; retire |
| `eventrule`, `composer`, `thepage` | none (composer prose is gated by numerals) | — | — | yes |
| `labels`, `register` | human, benign | human | labels are the audit, not an input | yes |
| `themevalidation` | human | human | no history until a PM list exists | production only |

**What this means for scoping the proof of concept.** The clean spine is: sort → covariance → PCA (book
variance share, placebo, per-leg diagnostic, bridging regression) → dated-encoder retrieval of theme
text and propagation → positioning overlap and time bombs → severity with the text ablation → the page.
Every arrow in that chain is either deterministic on point-in-time data or runs on a date-constrained
encoder. The LLM roles sit beside it: extraction and naming on post-cutoff months with blind prompts, the
catalyst agent live-only. The memo can then say exactly which numbers are out of sample, which are
illustration, and why the split falls where it does.
