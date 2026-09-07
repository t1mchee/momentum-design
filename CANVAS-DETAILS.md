# System Canvas: Implementation Rules, Estimators, and Parameter Registry

This document records the exact mathematical estimators, algorithmic parameters, statistical thresholds, and implementation rules corresponding to the seven processing steps of the equity momentum reversal risk monitoring architecture. 

It serves as the technical companion to the research memo, preserving builder-level specifications relocated from the narrative text during the density pass.

---

## Problem Definition and Event Specification

### Event Indicator Formula
The ten-day reversal event indicator $\text{event}_t$ at formation date $t$ is defined as:
$$\text{event}_t = \mathbf{1}\left[R_{t,t+10} \le Q_{0.05}\left(R_{u,u+10},\ \text{Dec 2013} \le u \le t-10\right)\right]$$
where:
- $R_{t,t+10}$ is the realized ten-trading-day cumulative return of the reconstructed 12-1 momentum factor.
- $Q_{0.05}(\cdot)$ denotes the empirical 5th percentile evaluated over the expanding historical sample of non-overlapping or block-sampled ten-day returns of the reconstructed factor from inception (December 2013) to date $t-10$.
- The Kenneth French published momentum factor threshold of $-432$\,bp represents the unconditional 5th percentile across 25,288 ten-day returns over 1926--2022.

---

## Step 1: Universe and Book Construction (Canvas, Step 1)

- **Universe**: Russell 3000 index constituents, reconstructed point-in-time from monthly ETF holdings files (December 2013 to present).
- **Sorting Rule**: 12-1 momentum formation sort. Stocks are ranked on cumulative return from month $t-12$ to month $t-2$ (skipping the immediate prior month $t-1$ to avoid short-term microstructure reversal).
- **Leg Construction**: Top decile forms the winner leg ($w_i > 0$); bottom decile forms the loser leg ($w_i < 0$).
- **Weighting**: Value-weighted by market capitalization within each decile, dollar-neutral:
  $$\sum_{i \in \text{winner}} w_i = +0.50, \qquad \sum_{i \in \text{loser}} w_i = -0.50, \qquad \sum_i |w_i| = 1.00$$
- **Rebalance Frequency**: Monthly at the final trading close of each month.
- **Look-Ahead Discipline**: Effective rebalance date; delistings terminate rather than flatten.

---

## Step 2: Macro Factor Residualisation and Exposure Units (Canvas, Step 2)

- **Residualisation Regression**: For each constituent stock $i$, daily excess returns $r_{it}$ are regressed on the S&P 500 index return $m_t$ over a trailing 126-trading-day window:
  $$r_{it} = \alpha_i + b_i m_t + u_{it}$$
  Every downstream rolling exposure and covariance decomposition operates strictly on market residuals $u_{it}$.
- **Macro Factor Loadings**: Residual returns $u_{it}$ are regressed on the six orthogonalized macro reference series $x_{st}$ ($s = 2, \dots, 6$):
  1. Market index ($m_t$, S&P 500 excess return)
  2. Ten-year Treasury yield change ($\Delta y_{10\text{Y}}$, DV01-equivalent dollars per \$100m notional)
  3. WTI crude oil prompt futures return ($\Delta \text{oil}$)
  4. US Dollar trade-weighted index return ($\Delta \text{USD}$)
  5. Investment-grade credit spread change ($\Delta \text{IG}$)
  6. Mega-cap spread return ($x_6$, top 50 mega-cap vs Russell 3000 equal-weighted)
- **Book Exposure Aggregation**:
  $$S_s = \sum_i w_i \beta_{is}$$
  reported in hedgeable units (DV01 for yields, beta for market, notional dollars for commodity, FX, and credit spreads).
- **Noise Thresholding**: 200 random portfolios matched to the book's decile sector allocations are drawn at each date. The 95th percentile noise cutoff is the tenth largest draw of the 200 permutations.

---

## Step 3: Co-Movement Clustering, Theme Classifier, and Alignment (Canvas, Step 3)

- **Covariance Estimation**: Ledoit-Wolf analytical shrinkage applied to the sample covariance matrix of single-stock market residuals $u_{it}$ over the trailing 126-trading-day window:
  $$\Sigma_{\text{LW}} = \delta F + (1-\delta) S$$
- **Spectral Decomposition**: Retain the first three principal components of $\Sigma_{\text{LW}}$:
  $$u_{it} \approx \sum_{k=1}^3 v_{ik} f_{kt}$$
- **Variance Share**: For component $k$, the variance share $\mathrm{VS}_k$ is the fraction of total residual portfolio variance explained by component $k$:
  $$\mathrm{VS}_k = \frac{\lambda_k}{\sum_j \lambda_j}$$
  evaluated against the 200 sector-matched random books. A component is active only if $\mathrm{VS}_k > P_{95}(\mathrm{VS}_{k,\text{placebo}})$.
- **Bridge Regression**: For each component $k$, the component return $f_{kt}$ is regressed on the six macro reference series:
  $$f_{kt} = \sum_{s=1}^6 \beta_{ks} x_{st} + \epsilon_{kt}$$
  The bridge $R^2_k$ determines whether the component is macro-explained ($R^2_k \ge 0.50$, in which case the leading macro series opens the page) or thematic/residual ($R^2_k < 0.50$).
- **Filing and News Risk Extraction**:
  - Sentences extracted from Item 1A (Risk Factors) of 10-K/10-Q filings and 8-K event disclosures.
  - Sentence classifier trained on 2,000 regulatory sentences annotated under strict entity anonymization (redacting tickers, names, and dates).
- **Joint Embedding and HDBSCAN Clustering**:
  - News headlines and filing sentences embedded using a frozen language encoder checkpoint.
  - Clustered jointly via HDBSCAN (hierarchical density-based spatial clustering of applications with noise).
  - Minimum cluster size for news-grounded themes: $\ge 25$ news headline members. Clusters with $< 25$ news members are marked company-specific.
  - Cluster assignment distance threshold: $d^*$ calibrated at the 90th percentile of statement-to-centroid distances across the pooled baseline population.
- **Theme Assignment and Loss Alignment**: A company $i$ counts toward theme $k$ if:
  1. Its nearest risk statement embedding is within Euclidean distance $d^*$ of the theme centroid.
  2. Its loading aligns with portfolio loss in a reversal:
     $$\ell_i v_{ik} > 0$$
     where $\ell_i = \text{sign}(w_i)$ is the leg sign ($+1$ for winners, $-1$ for losers), and $v_{ik}$ is the stock's loading on component $k$. This requires $v_{ik} > 0$ for winners and $v_{ik} < 0$ for losers.
- **Excess Weight**:
  $$E_e = \frac{\sum_{i \in \text{theme}} |v_{ik}|}{\sum_{i \in \text{component}} |v_{ik}|}$$
- **Deterministic Comparator**: Class-based TF-IDF (c-TF-IDF) keywords extracted concurrently across cluster documents to generate a parallel keyword label.

---

## Step 4: Crowding Metrics and Candidate Watch Lists (Canvas, Step 4)

- **Positioning Inputs**:
  - Winner leg: 13F institutional holder count (reported quarterly with statutory 45-day lag).
  - Loser leg: Exchange short interest as a percentage of float (reported bi-weekly with 14-day lag).
- **Crowding Quintiles**: Top 20\% of winner leg by institutional holder count; top 20\% of loser leg by short interest.
- **Overlap Metric**:
  $$O = \sum_{i \in \text{theme} \cap \text{crowded}} |w_i|$$
- **Weight-Share Null**: Actual gross weight share of the crowded quintile within that leg for the formation month:
  $$\text{null} = \sum_{i \in \text{crowded}} |w_i|$$
  The test evaluates whether the median excess overlap $O - \text{null} > 0$.
- **Candidate Watch Lists**:
  - **Pre-catalyst list**: Theme companies whose trailing 20-day cumulative return exceeds the book's leg mean by $> 1.0$ standard deviation.
  - **Post-unwind list**: Theme companies whose trailing 20-day cumulative return lags the book's leg mean by $> 1.0$ standard deviation.
- **Release Condition (`bombtest`)**: Both watch lists are withheld from publication until verified by an event study over recorded historical unwinds since 2020:
  $$\mathbb{E}[R_{\text{list}, t+10} - R_{\text{peer}, t+10} \mid \text{loss direction}] < 0$$
  testing whether listed companies move further in the loss direction than sector-matched non-list peers over the ten trading sessions following the freeze date.

---

## Step 5: Tail Severity, Catalyst States, and Proxy Hedge Sizing (Canvas, Step 5)

- **Calendar State $c(t)$**: Binary indicator for whether sessions $t+1$ to $t+10$ contain a window catalyst:
  - FOMC rate decision.
  - Heavy earnings reporting day where reporting companies exceed $10\%$ of gross book weight.
  - An approved catalyst from live monitoring.
  *(Scheduled CPI and employment releases are listed on the monitor page but do not define the calendar state).*
- **Volatility Scaling**: Trailing 126-trading-day sample standard deviation of factor returns:
  $$\sigma_t = \sqrt{\frac{1}{125} \sum_{u=t-125}^t (R_u - \bar{R})^2}$$
- **Tail Quantile Sizing**:
  $$\text{VaR}_{0.05}(t) = \sigma_t \cdot Q_{0.05}\left(\left\{\frac{R_{u,u+10}}{\sigma_u} \;\middle|\; c(u) = c(t)\right\}\right)$$
- **Expected Shortfall**:
  $$\text{ES}_{0.05}(t) = \sigma_t \cdot \mathbb{E}\left[\frac{R_{u,u+10}}{\sigma_u} \;\middle|\; \frac{R_{u,u+10}}{\sigma_u} \le Q_{0.05},\ c(u) = c(t)\right]$$
- **Event Probability $P_t$**:
  $$P_t = \frac{1}{|U_{c(t)}|} \sum_{u \in U_{c(t)}} \mathbf{1}\left[\frac{R_{u,u+10}}{\sigma_u} \le \frac{Q_{0.05}^{\text{unc}}}{\sigma_t}\right]$$
- **Hedge Sizing**: Minimum-variance hedge ratio $b_k$ obtained by regressing the component return $f_{kt}$ on the liquid proxy instrument's market-residual return $u_{Ht}$ over the trailing 126 days:
  $$f_{kt} = b_k u_{Ht} + \eta_{kt}, \qquad b_k = \frac{\text{Cov}(f_k, u_H)}{\text{Var}(u_H)}$$
  Hedge notional for a \$100m book:
  $$\text{Notional} = \$100\text{m} \cdot g_k b_k$$
  where $g_k = \sum_i w_i v_{ik}$ is the book's net loading on component $k$.
- **Historical Analogues**:
  - Distance metric: Mahalanobis distance across seven standardized dimensions: six macro factor exposures ($S_1, \dots, S_6$) and volatility $\sigma_t$.
  - Candidate pool: All monthly formation dates since December 2013, excluding the trailing 12 months.
  - Selection: Five nearest dates, flagged as *apt* when historical bear state $B_u$ matches current bear state $B_t$.

---

## Step 6: Monitor Page Dispatch and Threshold Triggers (Canvas, Step 6)

- **Dispatch Triggers**:
  1. Scheduled weekly publication.
  2. Event-driven trigger: active component variance share $\mathrm{VS}_k$ crosses the 95th percentile noise floor.
  3. Catalyst window trigger: entry into sessions $t+1$ to $t+10$ of an FOMC meeting or heavy earnings day ($> 10\%$ gross weight).
- **Nine Standardized Page Elements**:
  1. *Theme and labels*: Component variance share, percentile vs random books, excess weight, news weight, language-model label, and deterministic c-TF-IDF keyword label.
  2. *Stress loss*: Estimated loss in basis points by leg if the active component experiences a $-2\sigma$ return shock.
  3. *Tail risk and hedge*: 5% ten-day VaR, expected shortfall, event probability $P_t$, catalyst-window VaR, proxy hedge instrument, minimum-variance hedge notional, and VaR before/after hedge.
  4. *Positioning*: Winner institutional holder count overlap, loser short interest overlap, weight-share nulls, squeeze state, and input lags. Pre-catalyst and post-unwind lists printed only if release conditions are met.
  5. *Catalysts*: Upcoming FOMC decisions, earnings dates exceeding 10% weight floor, and approved catalyst events.
  6. *Factor exposures*: Book market beta and six macro series exposures, leading with the driving series if bridge $R^2_k \ge 0.50$.
  7. *Historical analogues*: Five nearest formation dates by Mahalanobis distance, with realized forward ten-day returns and aptness tags.
  8. *Changes since prior page*: Exposure shifts, variance share deltas, and catalyst revisions.
  9. *Diagnostic footer*: Text coverage percentage by leg, active model checkpoint IDs, and data lag disclosures.

---

## Step 7: Production Operations and Review Protocol (Canvas, Step 7)

- **Daily Automation**: Ingestion of trade-date closing prices, daily news headline feeds, corporate 8-K filings, and projected macro calendars. Pre-market automated batch run.
- **Review Protocol (`catapprove`)**:
  - Portfolio manager reviews proposed unscheduled catalysts at most once daily.
  - Portfolio manager reviews thematic keyword watch terms weekly (estimated time: under fifteen minutes).
- **Validation Quality Auditing (`labels`)**:
  - Periodic human annotation of stratified sample of regulatory and news statements.
  - Baseline validation: 100 sentences annotated once by researcher (standard error $\approx 10$ percentage points on precision).
- **Decision-Value Testing (`responselog`)**:
  - Ingestion of live portfolio holdings under discretionary manager agreement.
  - Evaluation of whether manager exposure adjustments or proxy hedges correlate with published monitor pages over an extended prospective sample.
