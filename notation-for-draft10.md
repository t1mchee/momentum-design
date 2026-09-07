# Notation for draft 10: every place proposed, with the prose it replaces

Scope: `spec.yaml` only. The syntheses in `groups.yaml` and the boxes in `simple.yaml` stay in prose; the
memo's methods section takes the lines from the spec. Notation is plain ASCII in the spec so the viewers
render it as written; the memo typesets it.

The test applied to each node: a line is added where prose is carrying a sum over a set, a product of
signs, a regression (what on what, over which window, reporting what), or a threshold built from other
numbers. A name is enough for a standard estimator or test. Nothing is added to procedures, human tasks,
the page, or the syntheses.

Tiers: **core** = the line removes an ambiguity a reader has already stumbled on (per the clarity
reports); **optional** = the line is shorter than the prose but the prose was not misread.

---

## 1. Symbol table (legend, new key `symbols`)

Twelve symbols, each used by at least two nodes. Every node that uses one refers to the table rather
than redefining it.

| symbol | meaning | used by |
|---|---|---|
| `W`, `L` | the winner and loser legs | sort, sensitivities, pca, cluster, themescore, poscluster |
| `w_i` | company i's position weight: `w_i = cap_i / sum_W cap` for i in W, and `-cap_i / sum_L cap` for i in L; `sum_W w_i = 1`, `sum_L w_i = -1` | sort, pca, themescore, poscluster, route2 |
| `s_i` | leg sign: +1 in W, -1 in L | cluster, themescore, timebombs |
| `r_it`, `m_t`, `x_st` | company i's daily return; the S&P 500 return; reference series s, with `x_1t = m_t` | sensitivities, covariance, bridge, posdata |
| `u_it` | company i's market-residual return, from the first stage in sensitivities | sensitivities, covariance |
| `Sigma`, `lambda_k`, `v_k`, `v_ik` | the shrunk covariance of `u`; its k-th eigenvalue and eigenvector; company i's loading on component k | pca, cluster, themescore, pc1text |
| `f_kt`, `sigma_k` | component k's daily return `f_kt = sum_i v_ik u_it`; its ten-day sigma, `sqrt(10) * sd(f_k)` over the window | pca, bridge, themescore, timebombs |
| `beta_ik` | company i's 126-day beta to component k, for companies outside the set | themescore, timebombs |
| `c_q` | the company sign of quote q: -1 if the company loses when the risk hits, +1 if it gains | cluster |
| `e` | a worry-list entry or residual cluster | cluster, themescore, embedspace |
| `p_kt` | statistic k's percentile against its own history on day t | zscore, eventrule |
| `r_{t,t+10}`, `Q_tau` | the book's ten-day forward return; its tau-quantile | severity, eventrule, volvalidation |

---

## 2. The lines, node by node

| node | tier | replaces | proposed line(s) |
|---|---|---|---|
| refseries | optional | "above the 99.2nd percentile of its own history, which is the 95th adjusted for six series" | "(1 - 0.05/6 = 0.992)" as a parenthesis; the sentence stays |
| posdata | optional | "on returns residual to the market and the six reference series" | `r_it = a_i + b_i m_t + sum_s g_is x_st + u'_it`; comomentum is the mean over j in i's leg of `corr(u'_i, u'_j)` over 126 days. Note that `u'` differs from `u` in sensitivities, which residualises on the market only |
| options | core | "the square root of the earnings move squared plus nine times the 30-day implied variance per day" and "loading-weighted mean over the named component's set" | `m10_i = sqrt(m_e,i^2 + 9 * sigma30_i^2 / 252)`; set move `= sum_{i in set} abs(v_ik) m10_i / sum_{i in set} abs(v_ik)` |
| sort | core | "Within each leg companies are value-weighted, the legs are dollar-neutral" | the `w_i` definition from the symbol table, stated here once |
| sensitivities | core | the whole slope paragraph, which the skeptic asked two questions about | first stage `r_it = a_i + b_i m_t + u_it` over `[t-126, t]`; slopes `u_it = a + beta_is x_st + e` for s = 2..6 and `r_it = a + beta_i1 m_t + e` for the market; spread `S_s = sum_W w_i beta_is - sum_L abs(w_i) beta_is`; conferred = window ending at formation t, carried = the same window ending at t+21 on the same companies |
| zscore | optional | "the slope times the book's NAV is the notional of that series the book is exposed to" | `H_s = S_s * NAV`, then the unit conversions in words |
| route2 | optional | "ranked by position weight times slope" | "(ranked by `w_i beta_is`)" |
| covariance | core | "regress each company's return on the market and keep the residual, and estimate the covariance with Ledoit-Wolf shrinkage" | `Sigma = LedoitWolf(u)` with `u` from the sensitivities first stage, so the reader sees it is the same regression |
| pca | core | "keep components whose eigenvalue exceeds the noise threshold"; "The threshold is the Marchenko-Pastur upper edge ..."; "The component's sign is that of w'v_k"; "each leg's mean loading, weighted by absolute position weight, and compare it with the root-mean-square loading"; "whose 126-day correlation with the component exceeds the lowest correlation among the set's companies" | `Sigma v_k = lambda_k v_k`; keep k with `lambda_k > (1 + sqrt(N/T))^2` on the correlation matrix, at most three; variance share `VS_k = lambda_k (w'v_k)^2 / (w' Sigma w)` (already present); sign fixed so `w'v_k > 0`; set `= top quartile by abs(v_ik)`; leg means `m_W = sum_W abs(w_i) v_ik / sum_W abs(w_i)`, same for L; factor iff `sign(m_W) != sign(m_L)` and `min(abs(m_W), abs(m_L)) > 0.5 * rms(v_k)`; price-correlated iff `corr(r_i, f_k) > min_{j in set} corr(r_j, f_k)` |
| bridge | core | "We regress each component's daily return on the six reference series over the same window" | `f_kt = a + sum_s g_ks x_st + e_t` over `[t-126, t]`; `R2_k` is this regression's R-squared |
| cluster | core | the two-tag paragraph (the sentence both pattern reports ranked worst), the weights, the placebo and the theme rule | book effect `b_q = s_i * c_q` (-1: the book loses); aligned iff `c_q * sign(v_ik) = -1`; `Q_e = sum of abs(v_ik) over aligned quotes assigned to e`, by leg; `P_e = mean over random sets of the same`; `E_e = Q_e - P_e`; theme `= argmax_e E_e` if `E_e > q95(max_e E_e over random sets)`, else none; both printed if the runner-up is within 10% |
| themescore | core | the 70-word loss-share sentence and the bp-loss sentence | `L_leg = sum abs(w_i)` over set companies with `s_i sign(v_ik) > 0`, plus found in-book companies with `s_j sign(beta_jk) > 0`; `bp loss = -2 sigma_k (sum_{i in set} w_i v_ik + sum_{j found} w_j beta_jk)` |
| poscluster | optional | "the share of the theme companies' book weight that is heavily positioned, by leg; the non-overlap is the share of heavily positioned weight that is not on the theme" | `O = sum_{i in T and C} abs(w_i) / sum_{i in T} abs(w_i)`; `N = sum_{i in C not T} abs(w_i) / sum_{i in C} abs(w_i)`, with T the theme companies and C the crowded quintile, per leg |
| timebombs | optional | the two list definitions, whose referent the skeptic said was lost | pre-catalyst: `r_i,20 * sign(v_ik) * sign(f_k,20) > sd20_i`; post-unwind: `abs(r_i,20) < sd20_i` and `abs(f_k,20) > sd20_k`, with `sd20` the standard deviation of rolling 20-day returns over the trailing year |
| severity | core | "The regressors are trailing volatility; the bear state ..." (the 76-word list) and "fitted on every day up to the formation date" | `Q_0.05(r_{t,t+10} given x_t) = x_t' theta`; `theta = argmin sum_{u <= t} rho(r_{u,u+10} - x_u' theta)`, `rho(z) = z (0.05 - 1[z < 0])`; catalyst window `[T-5, T+5)` in sessions; increase `= VaR(x_t) - VaR(x_t with window indicator 0)`. The regressor list becomes a five-row table: step 0 vol, bear state and its interaction, case flag, window indicator and days-to-catalyst, GARCH and calendar controls; step 1 adds `VS_k` and the price-correlated weight share; step 2a adds `E_e` by leg and the found-company weight share on the keyword run; step 2b the same on the model run; step 3 adds `O` |
| analogue | optional | "The state of a date is a vector of the six exposures, the book's variance share on the named component, the positioning overlap, trailing realised volatility, and the bear state" | `z_t = (S_1..S_6, VS_k, O, vol_t, B_t)`; distance stays named |
| eventrule | core | "when the maximum of eight time-series percentiles ... exceeds the 95th percentile of its own history"; "A hit is a realised loss beyond the unconditional 5% quantile" | trigger iff `max_k p_kt > 95` over k in {VaR, VS_k, S_1..S_6}; hit iff `r_{t,t+10} < Q_0.05` (unconditional, trailing history) after a page |
| volvalidation | optional | "Pinball loss is the scoring rule for a quantile forecast: a breach costs 0.95 times its size, and a non-breach costs 0.05 times the distance" | breach `= 1[r_{t,t+10} < VaR_t]`; pinball loss is the mean of `rho` from severity; the Kupiec test stays named |

**Not proposed**, with the reason: prices, filings, news, french (feeds and thresholds in words); random,
controls (procedures); newsagent, taxonomy, embedspace, pmworries, pc1text, riskextract, namecluster,
propagate (text procedures, a rubric, and named methods: HDBSCAN, BM25, c-TF-IDF); garch, eventbaseline
(a named model and a resampling recipe); catagent, catapprove, composer, thepage, responselog, signoff
(human and output nodes); register, labels, bombtest, themevalidation (words already exact; the event
study's 200bp and four-of-five are thresholds, not formulas); the retired nodes.

---

## 3. Count and cost

Core: options, sort, sensitivities, covariance, pca, bridge, cluster, themescore, severity, eventrule;
about 24 lines plus the ablation table. Optional: refseries, posdata, zscore, route2, poscluster,
timebombs, analogue, volvalidation; about 11 lines. The symbol table is twelve entries.

What the reader pays: one table to hold in mind, and one convention (`abs`, `sum`, `sign`, `1[.]` in
ASCII). What the reader gets: the four passages that the clarity reports quoted as unreadable (the two
tags, the loss share, the case flag, the slope windows) become one line each, and every regression
states what is regressed on what, over which window, reporting what.

Rule added to the writing standard: every regression gets one line in this form; residualisation is
its own first-stage line; named estimators and tests are named, not derived.
