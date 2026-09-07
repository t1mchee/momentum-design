# Triage of the draft-13 PM read

Source: `docs/reviews/pm-catchout-v2-draft-13.md`. Each finding is classed A (fix, no tradeoff), B (changes the design;
decision recorded with the recommendation), or C (not applied, with the reason). The draft-14 patch applies every A and
the recommended side of every B unless overruled.

## A. Fix, no tradeoff (36)

| # | Finding | Fix |
|---|---|---|
| 4b | Hedged-return formula mixes a dollar notional with returns and uses raw $r_H$ where $h_k$ was fitted on $u_H$ | Hedged return is $R_t - (n/100\text{m})\,u_{Ht}$; the market beta of $H$ is hedged with the book's market exposure in item 6, stated once |
| 3j, 7e | `g_analogue` says Euclidean, ten dimensions, theme in aptness; `analogue` says Mahalanobis, eight, theme as annotation | Rewrite `g_analogue` to the node (as amended by B2) |
| 3c, 7e | "Theme companies" is the component set plus propagated companies in `poscluster`, but component-set membership does not require a matching statement | $T$ is the companies that hold the theme: component-set members whose nearest statement is within $d^*$, plus the propagated companies. `g_crowding` unchanged |
| 3l, 7e | `g_positioning_data` claims the inputs are not computed from returns | Synthesis says "not functions of the residual covariance", as `posdata` does |
| 4h, 7b | "About twelve threshold pages a year" contradicts the crossing rule | Remove the number; the count of pages per year by trigger is an output of `eventrule` and an EMPIRICS item |
| 4f | "Covered by the same coverage test" is false for $P_t$ | Delete the sentence; `volvalidation` scores $P_t$ by the same breach test at its own threshold (the share of realised returns below the unconditional VaR against $P_t$, by state) |
| 3h | ES, $P_t$ and the catalyst increase reach `volvalidation` and are not scored | ES: mean realised return on breach months against the ES line, by state. $P_t$: as above. The catalyst increase: the coverage-by-state table already scores it; say so and drop it from the edge |
| 1g | Silence rate defined and never reported | `volvalidation` outputs the hit rate on threshold pages and the silence rate over event days; both go to the memo |
| 4j | Ablation lacks scaling without state | Four lines: unconditional; state only; scaling only; scaling and state. Matches E1 in the executor brief |
| 4d | Window $\{t,\dots,t+9\}$ against return $R_{t,t+10}$ | Window is $\{t+1,\dots,t+10\}$ |
| 4c | Pinball argument written as $z$ | $\rho(e) = e\,(0.05 - \mathbf{1}[e<0])$ with $e = R_{t,t+10} - \mathrm{VaR}_t$ |
| 4g | Loser-leg null "above one fifth because large companies have more 13F holders" | The null is the crowded quintile's value-weighted share of the leg; above one fifth on the winner leg, typically below on the loser leg because short interest as a share of float falls with size. No direction is assumed |
| 3a | `bridge` decides page order using the named component it does not receive | The R-squared gate moves to `thepage`: it receives $R^2_k$ per component from `bridge` and the named component from `cluster` |
| 3b | Two "driving series" | `bridge` reports the series with the largest $\lvert\gamma_{ks}\rvert$ per component; when the gate fires the page opens with that series' exposure and percentile from `percentiles`. `percentiles` keeps "driving series" for the book-level item |
| 3d | Squeeze state needs the market; no edge | Edge `refseries` to `timebombs` carrying the market return |
| 3e | One residualisation not carried by edges | Edges `sensitivities` to `covariance` and to `bridge` carrying $u$; `covariance` no longer takes daily returns from `prices` |
| 3f | Window catalyst days computed in `baselines` and again in `eventrule` | `baselines` outputs the window catalyst days; `eventrule` takes them and drops the four raw inputs |
| 3g | c-TF-IDF labels computed twice | `embedspace` computes; `namecluster` prints the model label beside it and does not recompute |
| 3i | `themescore` prints $R^2$ it does not receive | Dropped with B1 (no unexplained-share line). The edge from `bridge` carries instrument, slope and $R^2$ for the page's gate |
| 4m | Weekly approval; pages five sessions ahead | The PM approves proposals as they arrive, at most once a day; the weekly review is of the term list |
| 2a | Random draw "in sequence" on three marginals | Draw by joint (decile, sector) cell counts of each leg, with replacement across months and without within a book; if a cell is short in the universe, the count moves to the nearest decile in the same sector |
| 2b | Worry-list entry's reference point | The entry's phrase is embedded with the same encoder; its reference point is the centroid of its 50 nearest news statements; it labels a cluster whose centroid is within $d^*_c$ (B4) of that point |
| 2c | Coverage gate has no rule | Items 1, 2 and 5 need the context layer for the component set; item 4 the event layer for the crowded theme companies. An item is withheld when fewer than 80% of the companies it needs, by gross weight, are read on that layer |
| 2d | Earnings floor "set from the record" | The floor is 10% of gross book weight, set from the distribution of daily reporting weight over the history, not from the reversal record; the count of days it opens per year is an output |
| 2e | `catagent` capped at ten, comparator unbounded; label use unstated | The label is in the prompt and filters nothing; both lists are capped at ten, ranked by date; the approval share compares like with like |
| 2f | "The realised date is used only to score the page" | Delete; the realised earnings date is not used |
| 4l | $\sqrt{2}$ reason | "the component's ten-day sigma is scaled to 20 days" |
| 5b | GARCH retirement reason indicts the surviving model | Reason: "the rolling 126-day sigma does the same job as a fitted variance in the filtered simulation, with no parameters to estimate; a GARCH sigma is a one-line swap if the coverage test fails" |
| 5d | Blocks of six "longer than the horizon and the filing cycle" | "blocks of six months, two quarters, longer than any rolling window in the design" |
| 5e | 2,000 justified by a scoring standard error | "2,000 is the training set; its size is set by the classifier's learning curve on a held-out 200, and the scoring sample is the 100 hand labels" |
| 5f | Precision and recall by leg and by layer on 100 sentences | Reported once on the 100; the by-leg and by-layer split is dropped |
| 5g | Detection floor by simulation on eight against three | The premise share is descriptive: counts and shares, no test, no floor; `register` says floors apply to the registered tests only |
| 6a | "Alike" has no threshold | The theme machinery is demoted when the share on episodes minus the share on calm windows is below two of eight |
| 7a | "25 ... the smallest topic the page would print" | "25 members in a twelve-month window of statements entity-matched to the universe; the count of statements in the window is printed" |
| 7f | Two names for the market slope | One regression, $b_i$ throughout |
| 1e (part) | Bear-state breach cell empty since 2013 | The breach-by-bear-state line is dropped from `severity`; $B_t$ stays as a page field and as the analogue aptness rule, with the count of bear months in the sample printed |

## B. Design changes (5), with the recommendation

| # | Finding | Options | Recommendation |
|---|---|---|---|
| B1 (4a, 6f) | The hedge is sized from the instrument-on-component slope, which over-hedges by $1/R^2$ | (i) keep and multiply by $R^2$; (ii) regress the component on the instrument, $f_{kt} = a + b_k u_{Ht} + e_t$, and size $n = 100\text{m}\cdot g_k b_k$ | (ii). It is the minimum-variance hedge, one regression, no correction factor, and the unexplained-share line goes; the instrument is still chosen by $R^2$. The worked example becomes $g_k = 0.5$, $b_k = 0.5$, $n = 25\text{m}$. `bridge`, `themescore`, symbol table, `g_decompose`, `g_output`, POC-BRIEF correction 1 |
| B2 (3k, 6d) | The threshold trigger reads $\mathrm{VS}_k$ of the named component, so the hit-rate test inherits the encoder look-ahead | (i) keep and drop the hit-rate test; (ii) trigger on the maximum $\mathrm{VS}_k$ over components above noise, whichever is named | (ii). The trigger becomes clean, the hit-rate test is honest, and `eventrule` and `thepage` are as-of. The named component still decides what the page says, not whether it fires |
| B3 (5c, 1e) | Mahalanobis on eight dimensions with a near-constant binary | (i) keep; (ii) distance on the seven continuous dimensions, bear state as the aptness rule only | (ii). One sentence in `analogue` |
| B4 (4e) | $d^*$, a statement-to-centroid radius, is used centroid to centroid in `taxonomy` and `themevalidation` | (i) keep one radius; (ii) a second radius $d^*_c$, the 90th percentile of nearest-neighbour distance between cluster centroids in the same window | (ii). Two radii, each on its own scale, both calibrated once per window |
| B5 (1a) | `gathertext` gathers what `riskextract` already extracts and `pca` already sends | (i) keep; (ii) fold into `cluster`: the classifier's cached statements for the set companies are read there | (ii). One fewer node; the legend's count changes |

## C. Not applied (10)

| # | Finding | Reason |
|---|---|---|
| 1b | Squeeze state informs no decision | It is the loser-leg counterpart of the vulnerable list, and the event study in `bombtest` scores the list it gates. Kept; its edge is fixed in A |
| 1c | Drop $P_t$ | Element 6 asks for probability or severity; the line costs nothing and is now scored (A, 4f). Kept |
| 1d | Drop the keyword run downstream of the labels | The two runs are the design's comparator for where the language model adds value; agreement is printed, not tested. Kept |
| 1f | Runner-up, second label, change-since-last | Each is one line and the fixed conclusion says what to act on. Kept |
| 4i | Early quantiles rest on few observations | The count is printed; the first scored month is a stated limitation. No gate |
| 4k | Live windows have no history | Stated limitation in `severity`; the proof of concept measures it on the historical catalysts. Unchanged |
| 5a | HDBSCAN then a ball | Raised on draft 12 and decided: HDBSCAN is kept for the noise set, the ball is the assignment rule. Unchanged |
| 6b | The known-theme note admits the premise may fail | It is the design's stated limitation and the demotion rule now has a threshold (A, 6a). Unchanged |
| 6c | "The footer says so" seventeen times | Register; each footer names the missing input. Unchanged |
| 6e, 7d, 7g | Repetition of "not confirmatory"; every option kept; analogue labelled model | Style, and the label follows the inheritance rule. Unchanged |
