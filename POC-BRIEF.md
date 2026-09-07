# Proof-of-concept brief for the executor

Design: `docs/design/spec.yaml`, draft 15. Section 2 lists the corrections made since the executor may have
started; the spec is the authority where the two differ. House rules of the repo apply
(`CLAUDE.md` section 9): an experiment is created in `project/experiments.yaml` before it runs, with
hypothesis, prediction and method frozen; an implausible number is an instrument bug until proven
otherwise, a good one included; a null is a finding only once the instrument is shown able to see the
effect. Every experiment below is registered with both outcome sentences before it runs.

The selection principle. The experiments are chosen to be narrow, interpretable, and to show the design's
premises where they should show most clearly: the tail model on the full price history, and the theme
pipeline on the dates the design was built for. Choosing the experiments is legitimate and stated;
choosing the results is not. Each experiment has a pass and a fail sentence, and the fail sentence goes
in the memo if it fails.

## 1. What is on disk that binds the scope

- Holdings (IWV) daily from 2013-12-02, with 2017 at 7% and 2018 at 26% coverage. The reconstructed
  book, the conferred-exposure panel and the cap-matched placebo books exist (`factor/`, `features/conferred`,
  `factor/placebo`). The severity module already computes the vol-scaled climatology on 6,269 dates.
- News is not a daily archive. It is headline sets for eight registered episode windows (2018-02
  volmageddon, 2019-09 rotation, 2020-11 vaccine, 2021-01 squeeze, 2022-11 CPI, 2024-08 unwind, 2025-01
  DeepSeek, 2025-04 tariff), about 86k titles entity-matched to book constituents, plus calm windows for
  2016, 2017 and 2018 (`data/corpus/gdelt/episode_titles/`). The theme pipeline therefore runs on those
  windows, not on 130 months. The spec's proof-of-concept block is corrected to say so in draft 12.
- Filings: 8-K full text (57k), 10-K and 10-Q with Item 1A extracted per ticker (`data/raw/edgar_sections/`).
- Positioning: 13F as first filed, bi-monthly short interest, daily short volume. The comomentum panel is
  not used (draft 11 dropped it).
- Options end 2024-01-03; nothing options-based informs a live page.
- 90 gold labels for the v1 extractor are reserved for Tim in `reports/harvest059/gold_sheet.csv` and must
  not be touched by any model before he labels.
- Encoders: ChronoBERT vintages exist (`embed/chrono`); draft 11 uses one named encoder on every date, and
  the vintage family is a production-path item. Use one encoder and name it.

## 2. Corrections since draft 11 that the executor implements

1. Hedge ratio (as amended in draft 14): the candidate instrument is residualised on the market, giving $u_{Ht}$, and the
   component is regressed on it, $f_{kt} = a + b_k u_{Ht} + e_t$; the notional per $100m is $100\text{m} \cdot g_k b_k$ with
   $g_k = w'v_k$. This is the minimum-variance hedge. The draft-12 form, $g_k / h_k$ with $h_k$ the slope of $u_H$ on $f_k$,
   over-hedges by $1/R^2$ and is not used. The hedged return is $R_t - (n/100\text{m})\, u_{Ht}$.
2. Alignment on the loser leg: a company counts toward a theme when $\ell_i v_{ik} > 0$ (leg sign times
   loading sign), not $v_{ik} > 0$.
3. Overlap null: the null for $O$ is the crowded set's share of the leg's gross weight that month,
   $\sum_{i \in C} |w_i| / \sum_{i \in \text{leg}} |w_i|$, not a constant 0.2.
4. Calendar state: only FOMC decision days and earnings days on which reporting companies hold at least 10%
   of gross book weight open a window; CPI and payrolls are catalysts on the page but do not define the
   state. The counts of starts in each state are an output.
5. Theme identity across dates: two dates share a theme when their cluster centroids are within $d^*$.
6. Superseded by correction 9: there is no BM25 or c-TF-IDF assignment; a statement belongs to a cluster when it lies
   within $d^*$ of its centroid.
7. Probability line: $P_t$ is the share of past scaled returns $z_u$ in today's calendar state at or below the
   unconditional 5% VaR divided by today's sigma, $\mathrm{VaR}^{\text{unc}}_t / \sigma_t$. No fixed bp threshold.
8. The implied-move comparison and the options feed are dropped; the hedge line is a short in the instrument,
   sized $100\text{m} \cdot g_k / h_k$ with the instrument residualised on the market first, and the page prints the
   VaR before and after the hedge (the hedged sigma over the current window times the state quantile).
9. News and filing risk statements are clustered together; $d^*$ is calibrated on that pooled population, and a
   cluster with fewer than 25 news members is company-specific. There is no BM25 run.
10. The excess weight $E_e$ is a share of the component set's total absolute loading. The pre/post-cutoff split
    of the labels, the wrong-theme control and the breach sort are dropped; coverage is scored by state.
11. The calendar state of a start $t$ is whether the sessions $t+1$ to $t+10$ contain a window catalyst (FOMC, heavy earnings
    day at or above 10% of gross book weight, or an approved catalyst); CPI and payrolls do not open windows.
12. The ablation has four lines: unconditional (no scaling, no state); calendar (state only); scaled (scaling only,
    $\sigma_t q$ with $q$ the pooled 5% quantile of $z$); model (both). E1 reports the pinball ratio of the model to each.
13. Scored beside the coverage test, with counts and no threshold: the mean realised return on breach months against the
    ES line, by state; the share of months below the unconditional VaR against the mean $P_t$, by state. The bear state
    is not used for any split; print the count of bear months in the sample once.
14. The threshold trigger reads the largest $\mathrm{VS}_k$ among components above noise, not the named component. If E5
    renders a threshold page, this is the statistic.
15. Theme companies $T$ are the component-set members whose nearest statement is within $d^*$ plus the propagated
    companies; the overlap $O$ is computed on $T$, not on the whole component set.
16. The unexplained-share line is gone; the page prints instrument, notional and the VaR before and after the hedge.
17. The market line: $\beta^{\text{net}} = S_1 - (n/100\text{m})\,\beta_H$ with $\beta_H$ the instrument's first-stage market beta;
    the index notional per $100m is $100\text{m} \cdot \beta^{\text{net}}$. Print $g_k$ and $\|w\|_2$ on every date; $g_k$ should
    be a few tenths at most.
18. The exposure percentile is of $|S_s|$ with the sign printed. The trigger's seventh statistic is the own-history
    percentile of the largest $\mathrm{VS}_k$ above noise, computed in the trigger, absent when none is above noise.
19. The placebo compares the book's component $k$ with each random portfolio's component of the same rank. $d^*_c$ is the
    10th percentile of nearest-centroid distance. The premise rule: demote if the episode share is at or below the
    calm-window share, on the model run.

## 3. The experiments, in order

Each has: prior (what the design expects), prediction (the registered number), method, inputs, artifact,
the two outcome sentences, and effort. Register all six before running the first.

### E1. The tail model and its two baselines

Prior: dividing by trailing volatility and conditioning on the calendar state each improve a 5% ten-day
quantile forecast of the 12-1 book; the design's page number is this quantile.

Prediction: the model's pinball-loss ratio to the unconditional baseline is below one with a 90% block
bootstrap interval excluding one; coverage passes Kupiec at the 10% level (3 to 10 breaches at 130
months) for all three lines.

Method: for every formation month from 2015-12, on daily starts $u \le t-10$ since 2013-12: unconditional
5% quantile of $R_{u,u+10}$; the same within calendar state; the 5% quantile of $z_u = R_{u,u+10}/\sigma_u$ over all
starts, times $\sigma_t$; the same within state, times $\sigma_t$ (the model). Breach and pinball on the realised ten-day return from the formation date. Block
bootstrap in blocks of six months. Also: the count of starts in each state per year, the ES and
probability checks of correction 13, and the probability line of correction 7.

Inputs: the reconstructed book's daily returns (`factor/`), FOMC dates (`data/fedcal`), earnings dates
(`data/earnings`), weights for the 10% floor.

Artifact: `reports/poc/e1_tail.csv` (one row per formation month, three VaRs, realised return, breaches),
`e1_summary.json` (coverage, ratios, intervals, state counts), one figure of the three lines against
realised returns.

Pass: "The volatility-scaled, calendar-conditioned quantile beats the unconditional quantile on pinball
loss by [x]% with a 90% interval of [a, b], and all three lines pass coverage; the calendar state adds [y]%
over scaling alone." Fail: "The model does not beat the unconditional quantile at 130 months (ratio [x],
interval [a, b] includes one); the page prints the calendar baseline, and the scaling is reported as not
resolved at this sample."

Effort: one day. The severity module gives most of it.

### E2. The theme before each episode

Prior: on the formation date before an episode the design was built for, the component set's filings
concentrate on one risk cluster that the random books' filings do not, and the cluster is the one a
reader would name (vaccine timing before 2020-11; tariffs before 2025-04; inflation and rates before
2022-11). On calm windows, nothing rises above the placebo.

Prediction: on at least five of the eight episode formation dates a theme rises above the 95th percentile
of the random books' maximum excess weight, and its keyword label is recognisably the episode's; on the
three calm windows none does.

Method: on each of the eleven dates, build the book, the 200 sector-matched random books, $\Sigma$, the
three components, the sets; gather Item 1A sentences for set companies and random-set companies; run the
classifier (E3's, trained on 2,000 language-model labels) and the keyword rule; embed news headlines of
the window's prior twelve months (only the episode windows have them; for calm windows use the calm
files), cluster with HDBSCAN at 25, set $d^*$; compute $Q_e, P_e, E_e$ with alignment $\ell_i v_{ik} > 0$,
one company one vote; theme, runner-up, quotes, on both runs; the leg-mean loadings; $\mathrm{VS}_k$ with
its percentile.

Inputs: holdings, prices, `edgar_sections`, episode titles, placebo books.

Artifact: `reports/poc/e2_themes/<date>.json` per date, and `e2_table.csv`: date, named component,
$\mathrm{VS}_k$ percentile, theme label (model run, keyword run), $E_e$, placebo 95th percentile, runner-up,
three quotes. The November 2020 row is the memo's worked example.

Pass: "On [n] of eight episode dates a theme rose above the placebo, and on [m] of those its label matches
the episode; on the calm windows [k] of three did." Fail: "Themes rose above the placebo on fewer than five
episode dates, or on the calm windows as often as on episodes; the theme pipeline does not separate the
cases it was built for, and the memo says so."

Effort: two to three days; the clustering and the placebo runs are the cost.

### E3. Hand labels: the classifier against the keyword rule

Prior: a classifier trained on language-model labels reads risk statements with higher recall than a
keyword rule at similar precision, which is the design's claim for where the language model adds value.

Prediction: on 100 hand-labelled filing sentences, classifier recall exceeds keyword recall by at least
15 points at precision within 10 points.

Method: the language model labels 2,000 Item 1A and 8-K sentences, stratified by year, leg and layer,
company identity and dates redacted; a classifier head on the encoder is trained on them. Tim labels 100
sentences (the 90 gold plus 10), drawn stratified the same way, before seeing either output. Precision and
recall for both, with binomial intervals; precision's standard error is about ten points at 100 sentences.

Artifact: `reports/poc/e3_labels.csv` (sentence, hand label, classifier, keyword), `e3_summary.json`.

Pass: "The classifier's recall is [x] against the keyword rule's [y] at precision [p] and [q]; the gap is
the language model's measured contribution to extraction." Fail: "The keyword rule matches the classifier
within the intervals; the language model adds nothing to extraction that a rule does not, and the design's
extraction step runs on the rule."

Effort: one day of compute and prompts, two hours of Tim's labelling.

### E4. The premise share, with its base rate

Prior: a theme is visible before the episodes the design describes; the share on calm windows is lower.

Prediction: E2's counts, stated as shares with their counts, episode against calm.

Method: from E2; no new run. Register the sentence before E2 runs.

Pass and fail: as E2's, restated as the premise share on episodes and its base rate on calm windows.

Effort: none beyond E2.

### E5. The page for 2020-10-30 and for the memo date

Prior: the page as designed can be rendered from stored outputs, and on 2020-10-30 it names the vaccine
theme, sizes the hedge, and prints a VaR that the November 2020 reversal breached.

Method: render the nine items from E1, E2 and the exposure panel (conferred exposures, driving series; the
overlap from 13F and short interest with the corrected null). The hedge line from the bridge with
corrections 1, 8 and 16, with the VaR before and after the hedge; no premium. The
memo-date page uses the live worry list, labelled as written with hindsight, and the latest filings; its
news window is whatever GDELT GKG holds for the trailing twelve months, and if that is thin the footer
says the theme rests on filings.

Artifact: `reports/poc/page_2020-10-30.html`, `page_<memo date>.html`, and the JSON of stored outputs each
number links to.

Pass: "The 2020-10-30 page names [label], sizes a [notional] short in [instrument], prints a ten-day 5% VaR of
[x]bp, and the realised return was [y]bp." Fail: "The page on 2020-10-30 names no theme above placebo, or
its VaR was not breached; the design's worked example does not work as designed, and the memo shows the
page as it is."

Effort: two days, mostly rendering.

### E6 (if time allows). The event study and the analogues

The event study on the vulnerable-name lists needs positioning on the five unwind dates and is the first
cut if hours run short. The analogue section can reuse the existing engine's states restricted to
post-2013 formation dates with Euclidean distance on standardised dimensions; it is description and
carries no test.

## 4. What the artifacts map to

The spec's proof-of-concept block lists five products: (1) E1; (2) E3; (3) E2 on the memo date; (4) E2 on
the episode dates; (5) E4. E5 is the example output the brief requires. The README documents each with
the command that produced it, the data dates, the encoder and labelling model named, and the limitations
(episode windows rather than a daily archive; no options surface on the live date; 100 labels).

## 5. Reporting

One `results.yaml` per experiment under `project/`, in the repo's format, with the registered prediction
beside the result and the outcome sentence chosen. Numbers go to the memo only from these files. Any number
that looks better than expected is checked for an instrument bug before it is reported, per the house rule.
