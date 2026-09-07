# Triage of the draft-12 catch-out read

Source: `docs/reviews/pm-catchout-v2-draft-12.md`. Every numbered finding is classified:

- **A, fix**: no tradeoff; applied in draft 13 as stated.
- **B, decide**: changes the design; options given, with a recommendation.
- **C, leave**: not applied, with the reason.

## 1. Redundant complexity

| # | finding | class | action |
|---|---|---|---|
| 1.1 | `drivingseries` duplicates `percentiles` | A | Merge: `percentiles` outputs the driving series with the leg that holds more of it and the top contributors. One node fewer. |
| 1.2 | leg-mean loadings, no rule attaches | A | Drop the line from the page and the output from `pca`. |
| 1.3 | non-overlap $N$ computed, unused | A | Drop $N$. |
| 1.4 | pre/post-cutoff split has no leakage mechanism for a redacted binary label | A | Drop the split from `labels` and `riskextract`; keep the redaction. The remaining text look-ahead is the encoder, handled under 5.2. |
| 1.5 | February-against-August check sits in a node filings do not enter | A | Move it to `cluster`. |
| 1.6 | wrong-theme control prints a base rate and nothing uses it | A | Drop it. |
| 1.7 | three human nodes for one person's two actions | A | Fold `pmworries` into `taxonomy`; remove the duplicate sentences from `signoff`. |
| 1.8 | $P_t$ is the VaR restated, unscored, against a different threshold | B | Options: (a) drop it; (b) keep it against the problem block's own threshold, stated as the VaR restated as a probability and covered by the same coverage test. Recommend (b): the brief asks for probability or severity, and a PM reads a probability faster than a quantile. The cost is one sentence saying it adds no information beyond the VaR. |
| 1.9 | analogue's apt set is usually empty because candidates need a theme | B | Options: (a) drop the node; (b) the state is the eight price dimensions only (six exposures, sigma, bear state), candidates are every formation date since 2013, aptness is the bear state, and the theme is shown beside each analogue when one exists. Recommend (b): Tim wants the section, and it is description; the theme requirement made it empty. |
| 1.10 | catalyst-window VaR arrives at scoring and no test touches it | A | Score coverage inside and outside windows separately; that is the test of the state. |
| 1.11 | catalyst comparator needs suppliers and customers, which no feed carries | A | The comparator matches component companies only. |

## 2. Unclear what something does

| # | finding | class | action |
|---|---|---|---|
| 2.1 | two reference sets on the live date; union or each | B | Options: (a) assign once across the union; (b) assign to news clusters only on every date, and let the worry list label clusters: an entry labels the cluster whose centroid is nearest its reference point within $d^*$. Recommend (b): one mechanism live and in backtest, which also closes 3.4 (the backtest and the live page score the same object). |
| 2.2 | HDBSCAN clusters treated as centroid balls | B | With 5.1. Options: (a) k-means; (b) keep HDBSCAN for discovery (it finds the number of topics and a noise set, which k-means does not), state the ball approximation for later membership, and exclude noise points from the $d^*$ calibration. Recommend (b), stated in one sentence. |
| 2.3 | threshold pages fire on every day above the level; the hit test has no treatment of runs | A | A page fires on the crossing day only; the hit-rate test counts one outcome per crossing, non-overlapping, binomial against 5%. |
| 2.4 | matching joint or marginal; book companies in the draw or not | A | Marginals, drawn sequentially (leg size, then capitalisation decile counts, then sector counts); book companies are in the pool. |
| 2.5 | the squeeze state's sign | A | Defined on the loser-leg companies' value-weighted return; a rally is positive. |
| 2.6 | the control across archive builds | A | Moot after 1.6. |
| 2.7 | "recomputed weekly from the event layer" in a node the event layer does not enter | A | Delete the sentence. |
| 2.8 | stratum re-weighting unspecified | A | Delete; production detail. |

## 3. Unclear how things connect

| # | finding | class | action |
|---|---|---|---|
| 3.1 | `timebombs` needs the set of crowded theme companies, which nothing outputs | A | `poscluster` outputs the crowded theme companies by leg; the edge carries them. |
| 3.2 | the squeeze state has no path to the page | A | `timebombs` outputs it; edge to the page. |
| 3.3 | the look-ahead rule cannot be met: the keyword run shares the encoder | B | Options: (a) build an encoder-free comparator end to end (keyword extraction, term-overlap assignment), which needs a list and so cannot run in the backtest; (b) drop the legend rule, state that the encoder is the one unbounded look-ahead in the text pipeline and every text statistic inherits it, and note that no registered test uses a text statistic once the breach sort goes (4.17). Recommend (b). It is the honest statement and it removes a rule the design could not keep. |
| 3.4 | the backtest scores residual clusters, the PM sees a list | A | Closed by 2.1(b). |
| 3.5 | two catalyst sets under one word | A | Window catalysts (FOMC, heavy earnings days, approved catalysts) open windows and calendar pages; listed events (CPI, payrolls, rebalances) print on the page only. Calendar pages fire for window catalysts only; the yearly count is printed. |
| 3.6 | `sensitivities` runs daily on a window that ends monthly | A | The 126-day window rolls daily; formation fixes the book, not the slope window. |
| 3.7 | the bridge's reference distribution uses random first components for a named second or third | A | Compare with the random portfolios' component of the same rank. |
| 3.8 | "supported when the median gap is above zero" passes half the time under the null | A | Drop the claim. The overlap is printed with its null and feeds the lists; no claim about funds is made. |
| 3.9 | a baseline no node judges against | A | Delete the sentence in `taxonomy`. |
| 3.10 | theme agreement is printed, not measured | A | Say "printed". |
| 3.11 | the response-log proxy compares against a baseline that has no theme | A | Rewrite: on the formation date before each recorded unwind, whether the page named a theme, sized a hedge, and whether its VaR was breached. |
| 3.12 | five unwinds that are six | A | "The recorded unwinds since 2020, listed by date in the register" everywhere; no count. |
| 3.13 | `signoff` output feeds nothing | A | Edge `signoff -> responselog`, the acknowledgement log. |
| 3.14 | the VaR with the hedge on is never computed | B | Options: (a) leave the page with the unhedged VaR and the notional; (b) print the hedged VaR: the same quantile applied to the hedged return, $R - n\,r_H$, with sigma from the current window, labelled as an approximation because the hedge is today's. Recommend (b): "how much to hedge" is the decision the problem block names, and before-and-after is the number that answers it. |
| 3.15 | bear state in the distance and in the filter | A | Filter only. |

## 4. Arithmetic, signs, units

| # | finding | class | action |
|---|---|---|---|
| 4.1 | the calendar state is on the wrong day | A | A start is inside a window when its ten-day span contains a window catalyst day. |
| 4.2 | a delta-one short priced as a put, on a raw ETF | B | Options: (a) keep the short, drop the premium and the options node; residualise the instrument on the market in the first stage and say the market part of the hedge is the index line; (b) keep a put, price it, and print its delta-adjusted notional. Recommend (a): a short is what a macro desk does with an ETF, the premium was the last reason for an options feed that ends in 2024, and the worked example is already the short's. |
| 4.3 | "neither input is computed from returns" is false | A | Reword: the inputs are holdings counts and short interest, not the residual covariance, so under the null the crowded set is independent of the loadings; the filer definition uses the 12-1 rank that every book company shares by construction. |
| 4.4 | $\mathrm{sd20}_k$ has no year of history | A | $\mathrm{sd20}_k = \sqrt{2}\,\sigma_k$; $\mathrm{sd20}_i$ from the company's own trailing year. |
| 4.5 | Jaccard gloss | A | "below 0.5, a third or more of the set has changed". |
| 4.6 | cluster-size arithmetic | A | "about two headlines a month". |
| 4.7 | $n/20$ overstates the observations behind an overlapping-start quantile | A | Print the count of non-overlapping starts, $n/10$, and the tail count $n/200$. |
| 4.8 | a spread has no notional | A | CS01-equivalent dollars per basis point for credit; DV01 for the ten-year; notional for WTI and the dollar. |
| 4.9 | $\mathrm{VS}_k$ is a share of the residual book's variance | A | Say so; the market exposure is item 6. |
| 4.10 | nearest-within and any-within are two rules | A | One rule everywhere: a company counts when its nearest statement to the reference point is within $d^*$. |
| 4.11 | $d^*$ calibrated on headlines, applied to filing sentences | B | Options: (a) two thresholds, one per source; (b) cluster news and filing risk statements together, so themes are clusters of the union, news weight counts the news members, the book's weight counts its companies' members, and one $d^*$ applies to one population. Recommend (b): it removes the scale mismatch, makes 4.13 natural (a cluster with fewer than 25 news members is company-specific), and costs nothing the classifier does not already produce. |
| 4.12 | a calendar page resolves at the catalyst, five sessions after it is produced | A | Every page resolves ten sessions after it is produced. |
| 4.13 | the company-specific rule is circular | A | Closed by 4.11(b): company-specific means fewer than 25 news members in the cluster. |
| 4.14 | symbol collisions and missing symbols | A | $s_i$ becomes $\ell_i$; the bridge coefficients become $\gamma_{ks}$; $N$ for the non-overlap goes (1.3); the table gains $T, C, Q_e, P_e, p_{kt}, M_t, h_k, H, z_u, q_c, \mathrm{sd20}, f_{k,20}$. |
| 4.15 | "zero by construction" is univariate | A | The market is excluded because it was removed at the first stage; no other reason given. |
| 4.16 | precision standard error on the wrong denominator | A | "about ten points on precision at 100 sentences, of which perhaps 30 are predicted positive". |
| 4.17 | the breach sort resolves on a coin flip | A | Drop it. |

## 5. Borrowed rigour

| # | finding | class | action |
|---|---|---|---|
| 5.1 | HDBSCAN then balls | B | As 2.2. |
| 5.2 | BM25 beside the encoder does not mitigate the encoder | B | Options: (a) keep BM25 as a printed agreement and stop calling it a mitigation; (b) drop BM25. Recommend (b): after 3.3(b) the encoder's look-ahead is stated as unbounded and the vintage family is the production fix; BM25 then adds a number with no rule, which is 6.1. |
| 5.3 | "no estimation" on eigenvectors of an estimated matrix | A | Mitigation reads "arithmetic on the shrunk covariance; the estimation is in the covariance node". |
| 5.4 | = 1.4 | A | |
| 5.5 | Euclidean on co-moving exposures | A | Mahalanobis on the eight price dimensions, covariance from the candidate history. The checkability reason goes. |
| 5.6 | floors for tests that cannot fail | A | Closed by 4.17 and 6.2. |
| 5.7 | 200-portfolio machinery for exposure percentiles that go to the appendix | A | Random portfolios serve $\mathrm{VS}_k$ and $E_e$ only; `sensitivities` no longer runs on them, and the exposure's random-book percentile goes. |

## 6. Hedging and over-labelling

| # | finding | class | action |
|---|---|---|---|
| 6.1 | sixty "printed" diagnostics with no rule | A | Each printed number either gates something or goes. Kept with a gate: coverage (withholds items in the footer), condition number (withholds the decomposition), Jaccard (marks the component unstable and withholds naming that month), state counts (printed with the VaR as its denominator), approval share (feeds nothing yet; kept as the live catalyst step's only record). Dropped: BM25 agreement (5.2), the wrong-theme rate (1.6), month-to-month stability of the assignment (redundant with Jaccard), the positioning lag as a separate line (it stays beside the score), the R-squared reference distribution (the bridge's threshold is 0.5 and does not use it). |
| 6.2 | the lists' gate is that the test has run, not passed | A | The lists print only if the event study passes: mean excess above its floor and the same sign in four of five, both required. |
| 6.3 | "illustrative" as an exit | A | Closed by 4.17. |
| 6.4 | median gap above zero | A | Closed by 3.8. |
| 6.5 | "inherited from the theme" six times | A | The mitigation field is left empty on nodes that add nothing; the legend says an empty field means inherited. |
| 6.6 | thirteen nodes sit on an assumption measured on eight against three | C | The assumption is the design's premise and is stated as such with its failure case; the measurement is what the data on disk allow, and the tail model does not depend on it. The memo says all three things. No change. |
| 6.7 | the conclusion line is never specified | A | The conclusion is a fixed template: risk (theme label, via component); loss at minus two sigma by leg; hedge (short, notional, instrument); VaR before and after the hedge (3.14). |

## 7. Other signatures

| # | finding | class | action |
|---|---|---|---|
| 7.1 | the spec narrates its review history | A | Cut from the header; retired reasons rewritten as design reasons; the history stays in the change log. |
| 7.2 | invented precision | A | The 10% earnings floor becomes "set at registration from the record"; "fewer than ten a week" becomes "at most ten are shown"; "a few days" becomes "measured and printed"; "about two headlines a week" corrected; "three is the most the page can carry" and "five is what fits" stay, since page space is a decision. |
| 7.3 | every option kept | C | The pairs are comparators (both runs, both labels), which the brief asks for, or ablation lines (two baselines); the runner-up is a decision aid. The one genuine duplication, two theme sources, is removed by 2.1(b). |
| 7.4 | symmetry imposed on asymmetric legs | C | The legs' mechanisms are mirror images in sign and not in timing, and the design says so where it matters (the lags in `posdata`, the squeeze state). The formulas are mirrors because the sign rule is. No change beyond stating the lags in the same sentence as the inputs. |
| 7.5 | uniform register | C | A specification is uniform by construction. The memo is not. |
| 7.6 | thirteen nodes to name a risk that does not change the VaR | C on the premise, A on the count | The brief requires a text source and asks where AI adds value; naming the risk, its companies and its crowding is the answer, and the memo says plainly that the VaR is price and calendar. The node count falls with 1.1, 1.7, and the drops above. |

## Summary

A: 51 findings, applied in draft 13 as written.
B: eight decisions, each with a recommendation: $P_t$ kept against the event threshold (1.8); analogues on price dimensions only (1.9); the worry list labels clusters rather than forming a second reference set (2.1); HDBSCAN kept with the ball approximation stated (2.2); the look-ahead rule dropped and the encoder's look-ahead stated as unbounded (3.3); the hedged VaR printed (3.14); the short kept, the premium and the options node dropped, the instrument residualised (4.2); news and filing statements clustered together (4.11); BM25 dropped (5.2).
C: five findings left, with reasons: the premise's measurement (6.6), the kept pairs (7.3), the mirror formulas (7.4), the uniform register (7.5), the proportion of text machinery (7.6).
