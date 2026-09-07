# Proposed fixes for draft 11, answering the draft-10 review

Read: the brief (docs/drafting/CLAUDE.md), the review (docs/reviews/pm-catchout-v2-draft-10.md), groups.yaml and spec.yaml (draft 10), and section 6 of eval-rubric.md for the writing rules. Nothing else. Node ids in backticks. Review quotes are marked "review:"; current rule text is marked "now:"; proposed text is marked "proposed:".

Governing principle applied throughout: where there is a decision, simplify and clarify. A mechanism that can be walked through on a whiteboard with one example beats one that cannot; removing a component beats caveating it; a fix that adds machinery states why nothing simpler works.

Numbers computed for this proposal, used below:

* Kupiec unconditional-coverage test, n = 130, p = 0.05, 10% level: the acceptance region is 3 to 10 breaches (2.3% to 7.7%). Eleven breaches (8.5%) rejects (LR = 2.74 against 2.71); two breaches rejects (LR = 4.45). At n = 24 the region is 0 to 3 breaches; at n = 60 it is 1 to 6.
* First scored date under draft 10 (December 2015): formation months December 2013 to November 2015 give 24 fitting observations; step 3 has 17 parameters (step 0: eight regressors and an intercept; step 1 adds two; step 2 adds four, two by leg twice; step 3 adds two by leg); the expected number of observations below the fitted 5% line is 1.2 at the start and 6.5 at 130 observations.
* Pinball-loss margins at 130 monthly observations, by simulation: with a state in which volatility doubles in one month in five, a forecast that knows the state beats the unconditional quantile by 7% on average with a standard deviation of 8 percentage points (90% band -6% to +20%); with volatility 1.5 times in three months in ten, by 3% with a standard deviation of 5 points; with 1.25 times, by 1% with a standard deviation of 3 points. A 2% margin between two forecasts is inside one standard deviation in every case; a margin detectable nine times in ten is of the order of 10 to 15 points.
* Daily overlapping ten-day starts on the reconstructed book: about 500 by December 2015 and about 3,200 by the memo date; about one tenth of each count is independent.

The draft-11 design the fixes add up to, in one paragraph, so that each fix can be read against it: the tail model is a state-conditional, volatility-scaled empirical quantile with no fitted parameters and two states (inside or outside a catalyst window); text and positioning do not enter it as regressors and are tested as sorts on the breach record; the case flag, the GARCH baseline, the control sorts, the carried exposure, the cap-only null, the composer, the naming calibration, the paraphrase, the language-model reranker, the Bonferroni family and the price-correlated regressor are removed; one object type (a risk sentence) is embedded with one named encoder, and one assignment distance applies to one kind of comparison; one record stream (the classifier's) supplies weights and quotes; the hedge instrument is chosen and sized from the named component through the bridge regression; the positioning score has one input per leg, with short interest on the loser leg; the analogue search is restricted to dates on which the reconstructed book exists.

---

## Section 1. Redundant complexity

### Fix 1. `controls`: remove the node

Finding, review: "Remove the node: the page is unchanged, the tail model is unchanged. What is lost is one sentence in an appendix."

Now, `controls`: "Two other return sorts on the same date, 6-1 and 24-13, test whether an exposure is specific to the 12-1 rule or generic to sorting on past returns; in v1 the 12-1 sort had the largest absolute exposure to the driving series of the three on 42.6% of 108 dates, against the 33% expected by chance. That comparison is kept in the appendix. The 12-1 book formed 24 months ago and held to today controls for persistent company characteristics."

Proposed: delete the node and its two edges (`prices -> controls`, `controls -> sensitivities`). Delete "the book ranked 24 months earlier" from `sensitivities` inputs and from its rule. Move the v1 cross-sort result, if the number is confirmed, to the memo's appendix as one sentence labelled a v1 result; if it is not confirmed by the memo date, it is not cited.

Removes: one node, two edges, one input, the open item about 42.6% and 108 dates. Adds: nothing.

Tag: SIMPLIFY.

### Fix 2. `sensitivities`: measure the exposure once

Finding, review: "The carried exposure of this month's book is known at next formation, so on the page today it can only be last month's book's. No node uses it."

Now, `sensitivities`: "S_s is measured twice: over the window ending at formation (the conferred exposure) and over the same window ending at the next formation, on the same companies (the carried exposure). If an exposure is conferred but not carried, the ranking selected it and the book lost it during the holding period."

Proposed, `sensitivities` rule: "One first-stage regression gives the residual used throughout the design, and one slope per company and series gives the exposure, both over the 126 trading days ending at formation: r_it = a_i + b_i m_t + u_it; u_it = a + beta_is x_st + e_it for s = 2..6; r_it = a + beta_i1 m_t + e_it for the market; S_s = sum_i w_i beta_is. The same slopes are computed on each random portfolio." Rename the node "Exposure to the six series". Remove "conferred" and "carried" from the symbol table, the legend rule on "carry", `zscore` ("The carried spread is printed beside it") and g_book's synthesis.

Removes: one measurement, one output, the conferred/carried vocabulary. Adds: nothing.

Tag: SIMPLIFY.

### Fix 3. `random`: one null set, kept, with its cost stated

Finding, review: "The design runs Ledoit-Wolf, PCA, text gathering, a distilled classifier, quote assignment and the bridge regression on 200 random portfolios at every rebalance, and then declares the resulting percentiles decorative. ... A universe base rate per list entry would do that job at one two-hundredth of the cost."

Now, `random`: "The cap-matched set is the main null for the exposure statistics. A second set also matched on sector is the main null for the text statistics ... Every statistic the design prints for the book is computed on each random portfolio."

Proposed, `random` rule: "For each formation date the rule draws N = 200 portfolios from the point-in-time universe with the book's leg sizes, capitalisation deciles and sector counts, so that the only difference from the book is that they were not ranked on past returns. N is 200 so that the 95th percentile of any statistic over the random portfolios rests on ten draws. The first-drawn leg of each plays the winner leg. The random portfolios serve three statistics: the exposure S_s, the variance share VS_k and the quote weight Q_e; each is computed on every random portfolio by the node that computes it for the book. The exposure and variance-share percentiles are context, printed in the appendix; the quote-weight placebo P_e defines the theme and is on the page. Once every filing in the universe has been classified and cached, Q_e on a random portfolio is a lookup, and the covariance and decomposition of 200 portfolios of 600 names over 126 days run in seconds; the cost the reviewer names is the classifier run over the universe, which is made once."

Why not a universe base rate: a base rate per entry does not match the book's size, sector mix or loading profile, and the excess weight E_e would then measure the sector tilt of the sort rather than the theme. The sector-matched random set is the simplest null that removes the sector tilt; the cap-only set adds nothing and goes.

Removes: the cap-only set, one output, the "printed beside the first" comparison, the `random -> sensitivities` edge's cap-only label. Adds: the reason for N.

Tag: SIMPLIFY (one set) and KEEP (the null itself, for the reason given).

### Fix 4. `refseries`: remove the Bonferroni family

Finding, review: "'Unusual' appears in no output, no input, no page item. `eventrule` handles the same multiplicity a second way ... Two corrections for one problem; one wired, one not."

Now, `refseries`: "Its six percentiles are one family: a series is called unusual only above the 99.2nd percentile of its own history (1 - 0.05/6 = 0.992), which is the 95th adjusted for six series. Adding a series requires re-registering the family."

Proposed: delete those three sentences and the check "the family adjustment is applied to every percentile printed for the six". The multiplicity across the eight monitored percentiles is handled once, in `eventrule`, by the maximum against its own 95th percentile.

Removes: one rule, one check, the word "unusual". Adds: nothing.

Tag: SIMPLIFY.

### Fix 5. `pca`: remove price-correlated names

Finding, review: "It is `VS_k` measured on a wider set. It costs a regressor in a model that (section 4) has about 130 observations and 6 or 7 of them below the quantile."

Now, `pca`: "Price-correlated companies are companies outside the component set with abs(corr(u_i, f_k)) > min over j in the set of abs(corr(u_j, f_k)) over the window; the share of book weight in them is a regressor in the tail model."

Proposed: delete the sentence and the output "price-correlated names"; the tail model under Fix 27 has no regressors. The eigenvector v_k is over every book company, so a company just below the quartile cut already contributes w_i v_ik to the book's loading on the component; nothing is lost.

Removes: one output, one regressor, one edge label. Adds: nothing.

Tag: SIMPLIFY.

### Fix 6. `composer`: remove; the template is the page

Finding, review: "The author already knows the answer: the numbers are the page. Choose the template; the whole node and register row 13 go."

Now, `composer`: "A language model writes the prose over the fixed fields. A check rejects the page if any number in the prose fails to match the field it came from ... A blind comparison has two readers score the prose page and the template without knowing which is which."

Proposed: delete `composer`, its two edges, register row 13, the numeral check in `thepage`, and g_output's sentence "A language model writes the prose over fixed fields, and a check rejects the page if any number in the prose fails to match the field it came from." `thepage` renders nine fixed items from stored outputs; the only free text on the page is the quotes, which pass the quote gate, and the theme name, which is a label. Language-model prose is a production option, listed in the production path with the blind comparison as its acceptance test.

Removes: one model node, two edges, one register row, one daily test. Adds: one sentence in the production path.

Tag: SIMPLIFY.

### Fix 7. `namecluster`: remove the three-point calibration

Finding, review: "A person scoring whether an LLM's cluster name is 'more specific' than its name for a random cluster. Nothing uses the score."

Now, `namecluster`: "The naming is calibrated by running it on sector-matched random company sets: a label must be more specific on the real cluster than on a random one, rated on a three-point scale by the second reader."

Proposed: delete the sentence and the check "calibration on sector-matched random sets". The model's name is a label; the c-TF-IDF keyword label printed beside it is the reader's check, and the quotes under the name are the evidence. Remove the second reader's role from `themescore` (the agreement line goes under Fix 25).

Removes: one calibration, one check, one human task. Adds: nothing.

Tag: SIMPLIFY.

### Fix 8. `themescore`: two numbers, not three

Finding, review: "The page prints variance share, loss share and bp loss; the reader needs the bp loss."

Now, `themescore`: "Two statistics are printed, each beside its random-portfolio comparison. The first is VS_k for the named component, with its percentile. The second is the loss share ... and its value in basis points of book ... The loss share is a page statistic and not a tail-model regressor, because once the theme is fixed it is price arithmetic."

Proposed, `themescore` rule: "Two statistics are printed for the named component. The first is VS_k, the share of the book's variance the component explains, with its percentile against the random portfolios. The second is the loss in basis points of book if the component returns minus two sigma_k over ten days, by leg: bp loss_leg = -2 sigma_k sum_{i in leg} w_i v_ik, where the sum runs over every book company in the leg, because v_k is an eigenvector over all book companies and a company outside the component set contributes at its own loading. The two legs' losses and their sum are printed. Companies found by propagation are listed by name with their weight and quote; they are already inside the sum through their loadings. Neither statistic enters the tail model."

Removes: the loss share, the found-company beta term, the sentence about price arithmetic, the agreement line (Fix 25). Adds: nothing.

Tag: SIMPLIFY; also answers 3a and 4c's second point.

### Fix 9. The keyword run stops at the theme

Finding, review: "The whole second pipeline exists to produce one comparison, step 2b against step 2a, judged by a 2% pinball-loss margin on about 130 monthly observations ... machinery in service of a test that cannot speak."

Now, g_theme: "The comparators together form a second text run, and every text statistic is computed on both. One ablation step of the tail model replaces the model run with the keyword run."

Proposed, g_theme synthesis, last part: "Each language-model output has a comparator that does the same job without one: a keyword extractor for extraction and a keyword label for a residual cluster's name. The comparator's records are carried as far as the theme, so that the theme's excess weight and its label are computed on both runs and the two are printed together; that is the whole comparison, and propagation, the statistics and the page run on the model run only. The language model's contribution is measured where the sample can resolve it, on the hand-labelled extraction sample (precision and recall against the keyword rule) and on the theme agreement between the two runs; whether it changes the tail is tested as a sort on the breach record and reported as illustrative, because at about seven breaches no pinball margin can resolve." Delete "on both series" from `propagate`, `themescore`, `poscluster`, `severity` and the edges; delete ablation steps 2a and 2b (Fix 27). Keep the "both runs" outputs of `riskextract`, `newsagent` and `cluster`.

Why not remove the keyword run altogether: element 3 of the brief asks where AI adds value and where conventional methods do; the keyword run is the conventional method, and it is cheap up to the theme because the records exist from the same documents.

Removes: the second run downstream of `cluster`, two ablation steps, seventeen "both runs" phrases reduced to three nodes. Adds: nothing.

Tag: SIMPLIFY.

---

## Section 2. Unclear what something actually does

### Fix 10. `newsagent`: embed the sentence; no paraphrase; one classifier head

Finding, review: "the embedding space ... contains at most 2,000 distinct points, most of them repeated many times, and HDBSCAN with 'a minimum cluster size of 25' is clustering duplicates. If the nearest labelled example is found by embedding the raw sentence, the raw-sentence embedding already exists and the paraphrase step adds nothing but the language model."

Now, `newsagent`: "For each calendar year a classifier head is trained on that year's encoder using only labelled items dated before the year, and it labels each remaining sentence of the year as a risk statement or not; the paraphrase is taken from the nearest labelled example. ... The paraphrase is only used for embedding, so a near neighbour's paraphrase serves."

Proposed, `newsagent` rule: "The unit is a sentence. A language model reads a sample of 2,000 news sentences, stratified by year, with dates and company names redacted, and labels each as a risk statement or not; 2,000 gives a standard error near one percentage point on a precision near one half. A classifier head on the encoder is trained once on those labels and marks every sentence in the archive. A marked sentence is the record: its text is the span, and its embedding is the encoder's embedding of the sentence itself. There is no paraphrase. The comparator is a keyword rule on the registered term list applied to each sentence, and the two are scored on the same hand-labelled sample. The look-ahead is in the labels: the model that wrote them was trained after every date it read, and the redaction is the mitigation; a head trained on the same labels cannot add look-ahead beyond them." Remove the outputs' "short paraphrase" and the open item on the first year with enough labels.

Removes: the paraphrase, the per-year heads, the nearest-labelled-example step, one open item. Adds: the reason for 2,000. The yearly-encoder question is Fix 45.

Tag: SIMPLIFY.

### Fix 11. `riskextract`: one record stream

Finding, review: "The theme is chosen on the classifier's records; the quotes shown are the model's records; the 'distillation check' compares a stream of at most three per section to a stream of every risk sentence, which cannot agree in count. Which quote decided the theme?"

Now, `riskextract`: "The model reads the book's component-set documents directly, and its records supply the quotes and the naming. A classifier distilled from the model's labels on the pre-date encoder runs on every document in scope ... The theme weights and the placebo are computed from the classifier's records on both sides."

Proposed, `riskextract` rule: "The unit is a sentence of a risk-factor section (10-K Item 1A, the newer 10-Q Part II Item 1A) or of an 8-K item or transcript. A language model reads a sample of 2,000 filing sentences, stratified by year, leg and layer, with company identity, ticker and dates redacted, and labels each as a risk statement or not. A risk statement is a statement of a condition that would hurt the company; the sign is fixed at a loss by definition, and a statement that the company would benefit is not a risk statement. A classifier head on the encoder is trained once on those labels and marks every sentence of every filing in the universe, once, cached by document. The classifier's records are the only record stream: they set the theme weights, the placebo, the propagation search and the quotes shown, so the quote that decided the theme is a classifier record. The language model's direct labels are used for two things only, training the head and the held-out fifth of the sample on which the head's agreement with the model is printed. The comparator is the keyword rule on the registered term list, applied to the same sentences. Precision and recall of the model's labels and of the keyword rule are measured on the hand-labelled sample, split by whether the document is dated before or after the model's training cutoff; the gap bounds what the model may recall from training rather than read, and the head inherits that bound. Recall is measured on ten whole documents a quarter, labelled in full." Delete "up to three risks ... ranked by severity", the 6,000-token split, the sign output, "MD&A" from `filings` (the Overview subsection of Item 7 is dropped; without a sign it carries no information the risk section lacks), and the input "precision and recall by leg, era and cutoff side" (Fix 20).

Removes: the second stream, the sign, the paraphrase, MD&A, the three-per-section cap, the token split, the by-era stratum (the cutoff split does the work). Adds: nothing.

Tag: SIMPLIFY and CLARIFY.

### Fix 12. `garch`: remove; the baselines are two empirical quantiles

Finding, review: "Pinball loss needs a quantile forecast. Nowhere does the spec say how a daily GARCH variance becomes a ten-day 5% quantile ... The baseline the tail model must beat is undefined."

Now, `garch`: "The rule fits a GARCH(1,1) model on the book's daily returns, refit at each formation date. Its forecast enters the tail model as a control and the validation as the baseline that uses no calendar information."

Proposed: delete `garch` and its three edges. The two baselines, both defined in `eventbaseline` (Fix 14), are the unconditional 5% quantile of the book's past ten-day returns (no calendar, no volatility scaling) and the same quantile within the same calendar state (calendar, no volatility scaling). The tail model (Fix 27) is the second baseline with volatility scaling added, so the ablation from baseline to model is one step and reads on the page as one number.

Alternative, if a GARCH line is wanted because the reader expects it: keep the node with the rule "the ten-day 5% quantile is the square root of the sum of the ten daily variance forecasts, times the 5th percentile of the standardised residuals over the fit window", which is a volatility-scaled empirical quantile with a different volatility estimator; it would then differ from the model only in the estimator and the calendar, and adds a node for a comparison of two volatility estimators. I would drop it.

Removes: one node, three edges, an undefined baseline. Adds: nothing.

Tag: SIMPLIFY.

### Fix 13. `severity`: expected shortfall defined

Finding, review: "Outputs 'ten-day 5% VaR and expected shortfall'; the rule fits one quantile. ES is not a function of one quantile."

Now, `severity`: "Outputs are the ten-day VaR and expected shortfall in bp of book"; check: "expected shortfall is no milder than the VaR".

Proposed: under Fix 27 the model is an empirical quantile of standardised returns in the current state, so the expected shortfall is the mean of the standardised returns at or below that quantile, in the same state, times today's sigma: ES_t = sigma_t mean{ z_u : z_u <= q_c, c(u) = c(t), u <= t - 10 }. It is no milder than the VaR by construction and the check goes.

Removes: one check. Adds: one line.

Tag: CLARIFY (CORRECT under the old model, where it was undefined).

### Fix 14. `eventbaseline`: the book's own past window returns; no draws

Finding, review: "Are the ~600 company draws independent or on a common date? Independent: ... the baseline VaR is close to zero and any model beats it. Common date: there are eight (macro) or about 250 (trailing year) distinct outcomes and '1,000 draws' is a bootstrap of eight numbers."

Now, `eventbaseline`: "For each catalyst window it makes 1,000 draws d of the book's window return: R^(d) = sum_{i reporting} w_i r_i^ann,(d) + sum_{i other} w_i r_i^10,(d) where a reporting company contributes one of its last eight announcement returns, drawn at random, and every other company contributes one of its ten-day returns from the trailing year."

Proposed, `eventbaseline` rule, renamed "Two baselines": "A catalyst window is the ten sessions [T-5, T+5) around a scheduled macro release or around a day on which the companies reporting earnings hold at least 10% of the book's gross weight, sum_i abs(w_i). The state c(t) of a ten-day start t is inside or outside a window. The unconditional baseline is the 5th percentile of the book's ten-day returns over every daily start u <= t - 10 since December 2013. The calendar baseline is the 5th percentile of the same returns over the starts in the same state as t. Both are book-level returns on the dates they happened; there are no draws, and the cross-section is not averaged. Live, a PM-approved catalyst opens a window by the same rule."

Alternative: today's weights applied to past window dates, R^(d) = sum_i w_i r_i^(d) with d one of the last 24 windows of the same type, which holds the book fixed and varies the date. It gives at most 24 outcomes per type, needs return histories for names that were not then in the universe, and its 5th percentile at 24 outcomes is the second-worst date. The book's own past returns pool about 40 windows a year across types and answer the question the baseline is asked, "what has this strategy done through catalyst windows"; I would take them.

Removes: the draw, the one-day/ten-day mismatch, the per-company announcement returns, the eight-release windows. Adds: the state definition, which the tail model shares.

Tag: CORRECT and SIMPLIFY.

### Fix 15. `embedspace`: news weight is an assignment count

Finding, review: "The 50 seeds are near the centroid by construction. 'An entry with no news within the distance is printed as having no news weight' can only happen if all 50 nearest statements fall outside d*."

Now, `embedspace`: "the entry's phrase embedding seeds a search for its 50 nearest news statements, and their centroid replaces it ... NW_e = #{news statements q : d(q, ref_e) <= d*}".

Proposed: "Each list entry's reference point is the centroid of the 50 news statements nearest the entry's phrase; 50 is enough that one headline's wording does not move the point. The news weight of an entry is the number of news statements whose nearest reference point is the entry's and lies within d*, not counting the 50 seeds: NW_e = #{q not a seed of e : e = argmin_e' d(q, ref_e') and d(q, ref_e) <= d*}. Every entry has its seeds; entries are compared on the count above them. The same nearest-within-d* rule assigns filing statements to entries in `cluster`, so one assignment rule serves both." Delete "An entry with no news within the distance is printed as having no news weight." News weight is printed as context in item 1 ("the entry the news discusses most"); it is not a baseline (Fix 25).

Removes: the guaranteed floor, the "no news weight" case. Adds: one clause.

Tag: CLARIFY.

### Fix 16. `propagate`: retrieval over classified statements, no cap, no reranker

Finding, review: "Two hundred passages cannot reach most of them; the 'false-positive rate' printed beside it is a rate on a ceiling of 200. The reference point of a residual-cluster theme is never defined."

Now, `propagate`: "Every passage in scope is embedded once with the pre-date encoder and cached. Retrieval by the theme's reference point returns the 200 nearest passages. The language model scores each candidate company from 0 to 3 ..."

Proposed, `propagate` rule, kind deterministic: "Once a theme is named, the rule searches two sets of companies outside the component set: the rest of the book, and universe companies in the crowded quintiles (Fix 53). The objects searched are the classifier's risk statements from those companies' filings, already embedded and cached. The theme's reference point is the list entry's reference point, or the residual cluster's centroid. A company is marked as having the theme when at least one of its risk statements lies within d* of the reference point, and that statement is the quote kept with the result. There is no cap on the number of companies. As a control, the same search is run for a plausible but wrong theme, the list entry with the most news weight twelve months earlier (or the next entry if that is the current theme); the share of companies it marks is printed beside the share for the real theme as the false-positive rate."

Why no reranker: the retrieval rule already applies on every backtest date before the model's cutoff, so the reranker changed only post-cutoff months; with one object type and one distance (Fix 32) the retrieval rule is the same test the reranker was asked to refine, and the false-positive control measures its error. The language model's third job in the group goes; g_theme's count becomes two (Fix 26).

Removes: the 200 cap, the raw-paragraph embedding, the 0-3 score, the reranker, the model-version boilerplate, the "on both series" output. Adds: the reference-point definition.

Tag: SIMPLIFY and CLARIFY.

---

## Section 3. Unclear how things connect

### Fix 17. g_tail synthesis rewritten

Finding, review: "The memo-level statement and the component disagree on the model's inputs."

Now, g_tail: "It is a regression for the 5% quantile of the book's ten-day return, with the theme's variance share, the loss share, positioning overlap and timing of the next catalyst as regressors."

Proposed, g_tail synthesis: "One tail model gives the severity estimate. It is the 5% quantile of the book's past ten-day returns, each divided by the book's volatility at the time, taken over past starts in the same calendar state as today (inside or outside a catalyst window) and multiplied by today's volatility. Its outputs are a ten-day 5% VaR and expected shortfall in basis points of book, and how much worse both are inside a catalyst window. It is scored against two baselines, the same quantile with no volatility scaling and no calendar, and with the calendar only. Text and positioning do not enter the model; whether they sort the breaches is tested separately and reported as illustrative at the present sample. Scheduled catalysts come from calendars; unscheduled ones are proposed live by a model from news and approved by the PM. Analogues supply context by retrieval alone."

Tag: CORRECT (follows Fix 27).

### Fix 18. g_severity synthesis and the meta note

Finding, review: "g_severity: 'step 0 is prices and the calendar only'. `severity` step 0: 'the case flag'. ... The case flag comes from `pca`."

Now, meta note: "the tail model reports its step-0 form, which uses prices and the calendar only."

Proposed, g_severity synthesis: "The tail model uses prices and the calendar only: the book's own return history, its trailing volatility and the catalyst windows. Its ablation has three lines, the unconditional quantile, the calendar-state quantile and the volatility-scaled calendar-state quantile, which is the model. Every run prints all three." Meta note: "On such a day the page shows no theme, or the wrong one, and the VaR is unchanged, because the tail model does not take the theme." The case flag no longer exists (Fix 34).

Tag: CORRECT.

### Fix 19. `analogue`: inputs that reach its rule

Finding, review: "No edge carries the case flag (`pca`) or the theme label (`namecluster`). And 'Before 2014 aptness is judged on the bear state and the case flag only' — the case flag is computed on the reconstructed book, which does not exist before December 2013."

Now, `analogue`: "its bear state and case flag value (factor or theme) must match today's, and its theme must share the list entry."

Proposed: the aptness rule becomes "an analogue is apt when its bear state matches today's and its theme is the same list entry (or both dates have no theme)". Add the edge `cluster -> analogue`, carries "the theme entry", when "at rebalance". Restrict candidates to formation dates since December 2013 (Fix 33), so the pre-2014 branch goes.

Removes: the case flag from the rule, the pre-2014 branch. Adds: one edge.

Tag: CORRECT.

### Fix 20. `labels -> riskextract`: delete the edge

Finding, review: "Setting next month's sample weights is `labels`' job. The feedback edge `labels -> riskextract` points at the wrong node."

Now, `riskextract`: "The error rates from the hand-labelled sample set the stratum weights of the next month's sample and are used for nothing else."

Proposed: delete the sentence, the input "precision and recall by leg, era and cutoff side" and the edge. In `labels`: "The error rates by stratum set the next month's stratum weights." No new edge is needed: `labels` is itself a validation node and reports to the memo.

Tag: CORRECT.

### Fix 21. `themevalidation`: outputs it can compute

Finding, review: "Nothing carries which residual themes were surfaced when."

Now, `themevalidation`: "It measures whether the pipeline finds themes the PM had not listed, and whether the PM needs to add fewer entries over time."

Proposed, `themevalidation` rule: "Run quarterly, from two logs: the edit log (each entry the PM added, with its date) and the residual-cluster log (each residual cluster that was a component's theme, with its centroid and the date it was first named). For each added entry, the pipeline surfaced it first if a logged residual cluster lay within d* of the new entry's reference point before the edit date. For each logged residual cluster, the PM adopted it if an entry within d* of its centroid was added later. The two shares are the outputs. The first reading is four quarters after a PM starts editing the list." Inputs: "PM edits", "the residual-cluster log", the register row. Add the edge `cluster -> themevalidation`, carries "the residual-cluster log", when quarterly, mode live only. Delete the agreement-line input and edge.

Tag: CORRECT.

### Fix 22. `random` and `sensitivities` agree on one set

Finding, review: "`random`: 'A second set also matched on sector ... is printed beside the first for the exposures.' `sensitivities` inputs: 'N random portfolios per date, cap-matched' only."

Proposed: covered by Fix 3; every consumer takes the one cap-and-sector-matched set and every edge from `random` carries "the random portfolios".

Tag: CORRECT (by Fix 3).

### Fix 23. One node decides the hedge instrument

Finding, review: "`bridge` decides on R-squared of the named component on five series; `zscore` decides on the own-history percentile. ... Which instrument is on the hedge line is not determined."

Now, `options`: "The hedge line names the instrument: the sector ETF, or the driving series' instrument when the bridge puts macro exposure first." g_book: "Its exposure is the one a desk would hedge."

Proposed: the hedge line hedges the named component, and `bridge` chooses the instrument (Fix 35 gives the sizing). `bridge` rule, added: "The same regression is run one instrument at a time, f_kt = a + h_k r_Ht + e_t, over the eleven sector ETFs and the tradeable instruments of the five non-market series (the ten-year future, the front-month WTI future, the dollar index future, a high-yield credit ETF, and the mega-cap pair, long the ten largest and short the equal-weighted ETF); the hedge instrument is the one with the highest R-squared, and h_k is its slope." Output added: "the hedge instrument and h_k". Delete from g_book: "Its exposure is the one a desk would hedge"; replace with "The driving series is printed as the book's largest macro exposure relative to its own history; the hedge on the page is against the named component, and item 6 gives the driving-series exposure in hedgeable units for a desk that wants to hedge it instead." Delete from `options` the sentence quoted.

Removes: the two-way decision. Adds: one regression over sixteen instruments, in a node that already runs it over five series.

Tag: CORRECT.

### Fix 24. `poscluster`: the overlap against a null it does not contain

Finding, review: "A company's mean residual correlation with its leg and its loading on the leg's first component are close to the same number. ... The 'evidence' for 'hedge funds are mostly positioned on one theme' is an identity."

Now, `posdata`: "The score is the mean of the two ranks", comomentum and 13F crowding. `poscluster`: "random assignment gives O = 0.2, and the claim is supported if the median of O since 2014 is above it."

Proposed: remove comomentum from the score (Fix 53 gives the new score: 13F crowding on the winner leg, short interest on the loser leg). The overlap rule then stands as written, because neither input is a function of the residual covariance; "random assignment gives O = 0.2" is the correct null for a top-quintile set drawn independently of the loadings. Add to the rule: "Neither positioning input is computed from returns, so the crowded set is independent of the loadings under the null."

Alternative: keep comomentum and change the null to draw the crowded set by comomentum rank alone, which measures how much 13F adds beyond the loading. It keeps a second input, a second null and a subtler claim; the score with one input per leg is the one that can be walked through.

Removes: comomentum. Adds: one sentence.

Tag: CORRECT and SIMPLIFY.

### Fix 25. Outputs nothing uses

Finding, review: "`eventrule` 'hit, miss and silence counts' ... `options` 'per component name: implied earnings move'; `controls` 'the cross-sort comparison'; `refseries` 'unusual'; `pca` per-leg decomposition ...; `posdata` 'short interest per name' goes only to the page and enters nothing."

Proposed, item by item: hit, miss and silence counts are wired to `volvalidation` (new edge `eventrule -> volvalidation`, carries "page dates and their outcomes", monthly, backtest only), which prints the hit rate on threshold-page days against the 5% base rate as the trigger test. Per-name implied moves are deleted from `options` outputs; the set move stays. `controls` goes (Fix 1). "Unusual" goes (Fix 4). The per-leg decomposition sentence in `pca` is deleted. Short interest enters the loser leg's score (Fix 53). The agreement line is deleted from `themescore`, `thepage` and `themevalidation` (Fix 21); the news-weight leader is printed in item 1 as "the entry the news discusses most", context only.

Tag: SIMPLIFY (five deletions) and CORRECT (one wiring).

### Fix 26. Syntheses corrected to the nodes

Finding, review: "g_theme: 'The language model does four jobs in this group' ... Three are listed. g_crowding: 'companies that have not yet moved after an unwind has started'; `timebombs`: fires on a rally as well as an unwind. g_validation says the cutoff split bounds recall 'if the model does better on documents it may have seen in training'; the backtest statistics use 'the classifier's records', not the model's."

Proposed: g_theme: "The language model does two jobs in this group: it labels the sentences from which the risk-statement classifier is trained, for news and for filings, and it names a residual cluster that matches no list entry. Each has a comparator that does the job without a language model, a keyword rule and a keyword label." g_crowding: matches the corrected sign (Fix 40). g_validation: "Extraction error is measured on hand-labelled sentences, split by whether the document is dated before or after the labelling model's training cutoff; if the model's labels are better on documents it may have seen in training, the gap bounds what it recalls rather than reads, and the classifier trained on those labels inherits the bound. Every backtest statistic uses the classifier's records."

Tag: CORRECT.

---

## Section 4. Unclear how things work

### Fix 27 (the tail model). `severity`: a state-conditional, volatility-scaled empirical quantile

Finding, review: "A 17-parameter quantile regression whose fit is determined by one to six points. On the whiteboard: 'How many observations sit below your fitted 5% line on the first scored date?' There is no answer that keeps the model."

Now, `severity`: "The tail model is a quantile regression for the 5% quantile of the book's ten-day forward return: Q_0.05(R_{t,t+10} | x_t) = x_t' theta. theta is fitted by quantile regression on formation days u <= t - 10 ... step 0 trailing volatility; B_t and B_t times market variance; the case flag; the catalyst-window indicator and days to the nearest catalyst; the GARCH forecast and the calendar baseline as controls; step 1 adds VS_k and the share of book weight in price-correlated companies; step 2a adds E_e by leg and the found in-book company weight share, on the keyword run; step 2b the same two on the model run, in place of 2a; step 3 adds O; this is the full model."

Proposed, `severity` rule: "The tail model is the 5% quantile of the book's past ten-day returns, scaled by volatility and conditioned on the calendar state. For every daily start u since December 2013 with a realised target, u <= t - 10, the standardised return is z_u = R_{u,u+10} / sigma_u, with sigma_u the book's ten-day sigma from the 126 days ending at u, sqrt(10) times the standard deviation of daily book returns. The state c(u) is inside or outside a catalyst window, defined in the baselines node. Then
  q_c = Q_0.05{ z_u : c(u) = c(t) },   VaR_t = sigma_t q_c,   ES_t = sigma_t mean{ z_u : z_u <= q_c, c(u) = c(t) }.
The catalyst-window increase is sigma_t (q_inside - q_outside). There are no fitted parameters. The first scored date, December 2015, has about 500 daily starts, about 250 of them inside a window; a 5% quantile of 250 rests on twelve observations, and by the memo date on about 80. The ablation has three lines, printed on every run: the unconditional baseline (no scaling, no state), the calendar baseline (state, no scaling) and the model. Text and positioning do not enter the model. Whether they sort the breaches is measured in the scoring node. The breach rate of the model is also printed by bear state, B_t on or off, as a check that a state the model does not use does not concentrate its breaches. Live, a PM-approved catalyst opens a window by the same rule as a scheduled one, so the live model is the scored model with one more source of window dates."

Alternative: a quantile regression at tau = 0.05 on the daily overlapping starts, with four parameters (intercept, sigma_t, the window indicator, B_t), block-bootstrap intervals over ten-day blocks, and one text statistic added as a fifth regressor for the test. It fits about 50 independent-equivalent observations at the first scored date and 300 by the end, against four or five parameters, which is fittable; it produces a coefficient per text feature, which is what draft 10 wanted the regression for. It keeps a fit, an inference procedure for overlapping data and a parameter count to defend, and the coefficient it produces cannot be resolved at seven breaches either. I would take the empirical quantile: it can be walked through with one example ("take every ten-day start since 2014 inside a catalyst window, divide each return by the book's volatility at the time, take the fifth percentile, multiply by today's volatility"), it has no fit to fail, and it is the conventional method the brief asks the design to locate.

Removes: the regression, 17 parameters, four ablation steps, the GARCH and calendar controls, the case flag, the price-correlated share, E_e, the found share and O as regressors, and the on_failure fallback to step 0. Adds: one standardisation and one state.

Tag: CORRECT and SIMPLIFY.

### Fix 28. `eventbaseline` on the whiteboard

Finding, review: "`eventbaseline` (2e above) is a whiteboard failure in either reading."

Proposed: Fix 14. The whiteboard version: "The book has been through about 480 catalyst windows since 2014. Line up its ten-day return over each. The fifth-worst percentile is the calendar baseline. Divide each by the volatility at the time first, and multiply by today's, and it is the model."

Tag: CORRECT (by Fix 14).

### Fix 29 (the hedge line). `options`: size the hedge from the component

Finding, review: "The loss is the book's exposure to `f_k`, a market-residual component. The hedge notional is the book's beta to a sector ETF. A dollar-neutral book's beta to XLK can be near zero while its exposure to a semiconductor-memory component is large."

Now, `options`: "It gives the notional per $100m of book, from the book's 126-day beta to the instrument, and the ten-day at-the-money put premium in bp of book."

Proposed, `options` rule, hedge line: "The hedge line hedges the book's exposure to the named component. The book's loading on the component is g_k = w'v_k, the book's return per unit of f_k. The instrument H and its slope h_k, the instrument's return per unit of f_k, come from the bridge node. The notional is the short position in H that offsets g_k: notional per $100m = 100m g_k / h_k. On a move of minus two sigma_k the book loses 2 sigma_k g_k and the hedge returns 2 sigma_k g_k, so the hedge line and the bp loss two lines above it are the same number with opposite signs, and the page prints the residual, the share of the component's variance the instrument does not explain (1 - R-squared from the bridge). The ten-day at-the-money put premium on that notional is printed in bp of book (PUBLIC, delayed)." Delete "from the book's 126-day beta to the instrument".

Alternative: print no notional; give the instrument and the book's exposure g_k in units of f_k, and leave sizing to the desk. It removes h_k and the premium line; it also removes "how much to hedge" from the page, which is the decision the problem block says the page informs. I would take the sized line, since h_k is one slope in a regression the bridge already runs.

Removes: the beta-to-instrument sizing, the unrelated notional. Adds: one slope and one ratio.

Tag: CORRECT.

### Fix 30. `pca`: K fixed at three; a component is named when it beats the random books

Finding, review: "K is counted on the sample correlation matrix, the eigenvectors are taken from the shrunk covariance. With N about 600 and T = 126 the edge is about 10 ... K = 3 every month. The cap 'K <= 3' is the binding rule; Marchenko-Pastur does nothing."

Now, `pca`: "The number of components kept, K <= 3, is the number of eigenvalues of the sample correlation matrix of u that exceed the Marchenko-Pastur edge (1 + sqrt(N/T))^2 ... the components are the first K eigenvectors v_k of Sigma."

Proposed: "The first three eigenvectors v_k of Sigma are kept; three is the most the page can carry. A component is above noise when its variance share VS_k exceeds the 95th percentile of the same statistic on the random portfolios, and naming runs on components above noise only. If none is, item 1 reads that no co-movement rises above what a random book of this size and sector mix shows." Delete the Marchenko-Pastur sentence.

Removes: the random-matrix edge, the sample-correlation count, a threshold that never bound. Adds: nothing; the random-book percentile already existed.

Tag: SIMPLIFY and CORRECT.

### Fix 31 (the case flag). `pca`: retire the flag

Finding, review: "November 2020: winners are stay-at-home and growth, losers are travel and energy; the vaccine is the theme; the loading pattern is exactly opposite-signed across legs. The page ... would read 'the leading co-movement is the momentum factor itself' ... the case the flag throws away."

Now, `pca`: "factor iff sign(m_W) != sign(m_L) and min(abs(m_W), abs(m_L)) > 0.5 rms(v_k). A factor component enters the tail model as a state indicator; otherwise the component is a theme. A theme the sort has fully aligned with ... is treated as the factor."

Proposed: delete the flag, its formula, its output, its input to `pc1text`, `severity` and `analogue`, and item 1's factor branch in `thepage`. Naming runs on every component above noise; the named component is the highest-variance component whose theme rises above the placebo (E_e > q95 of the random sets), else none. The leg-mean loadings m_W and m_L are printed on one line of item 1 as "how the component sits across the legs", with no rule attached. What the flag protected against, the sort's own axis being named as a theme, is handled by the placebo: a component that is winners against losers with no shared condition has no entry with excess quote weight, and the theme is none.

Alternative: keep the flag as a printed diagnostic and let it decide nothing, which is the same page with one more label; or keep it deciding only the tail model, which under Fix 27 takes no flag. Neither leaves the flag a job; retire it.

Removes: the flag, one formula, one output, three inputs, one page branch. Adds: one printed line.

Tag: SIMPLIFY and CORRECT.

### Fix 32 (the assignment distance). One object, one distance

Finding, review: "`d*` is 'the 90th percentile of member-to-centroid distance across the news clusters' — clusters of short paraphrases. It is then used (i) to assign filing-quote paraphrases to entry centroids, (ii) in `propagate` to mark a company when 'its nearest passage is within the assignment distance', where passages are raw paragraphs ... and (iii) in `namecluster` for cluster-to-news-cluster distance."

Now, `embedspace`: "The assignment distance d* is the 90th percentile of member-to-centroid distance across the news clusters."

Proposed: every embedded object is a risk sentence (Fixes 10, 11, 16), news or filing, so a statement-to-reference-point distance is the only comparison the design makes, and d* is calibrated on that comparison: "d* is the 90th percentile of the distance from a news statement to the centroid of its own cluster, so that nine in ten members of a dense news topic count as within it. It is used for one comparison only, a risk sentence against a reference point (an entry's, or a residual cluster's centroid), in three places: news weight, quote assignment and propagation." In `namecluster`, replace the cluster-to-cluster distance: "A residual cluster is company-specific when fewer than 25 news statements, the HDBSCAN minimum, lie within d* of its centroid; otherwise the news cluster with the most such statements is printed beside it with the count."

Alternative: calibrate a distance per object pair (sentence-to-centroid, paragraph-to-centroid, centroid-to-centroid). It keeps three calibrations to explain and a paragraph embedding that Fix 16 no longer needs. One object is the fix.

Removes: two of three uses at different scales, the raw-paragraph scale. Adds: one sentence in `namecluster`.

Tag: CORRECT and SIMPLIFY.

### Fix 33. `analogue`: one era, one distance

Finding, review: "Pre-2014 candidates are measured in fewer dimensions than post-2014 candidates; fewer dimensions give smaller Mahalanobis distances; the five nearest will be pre-2014 dates by construction."

Now, `analogue`: "Before December 2013 the six exposures are the French factor's own 126-day slopes on available series ... The distance between states is the Mahalanobis distance, using a covariance estimated on dates before December 2013 for price dimensions and on the expanding window since 2014 for theme and positioning dimensions."

Proposed, `analogue` rule: "The state of a formation date is ten numbers: the six exposures S_s, VS_k of the named component, the overlap O, trailing ten-day sigma and B_t. Candidates are every formation date since December 2013, on which the reconstructed book and every dimension exist, excluding the twelve months before today. Each dimension is standardised by its own history to date, and the distance is Euclidean on the standardised values; with ten dimensions on about 130 dates a covariance adds little and a walk-through adds nothing. The five nearest dates are printed with the book's return over the following ten days. Quiet dates are candidates by construction, since every formation date is. An analogue is apt when its bear state matches today's and its theme is the same list entry, or both have none." The pre-2014 reversal record stays where it is used, in the long-run reference and the event count in `french`.

Removes: Mahalanobis, the two-era covariance, the factor-level branch, the quiet-date draw, the pre-2014 note. Adds: nothing.

Tag: SIMPLIFY and CORRECT.

### Fix 34. `volvalidation`: the Kupiec region computed, and what it tells

Finding, review: "At n = 130, p = 0.05, the 10% level, the likelihood-ratio acceptance region is 3 to 10 breaches (2.3% to 7.7%); 11 breaches (8.5%) rejects. '9%' is outside the region."

Now, `volvalidation`: "At each step the breach rate must pass Kupiec's unconditional-coverage test at the 10% level, with the count and the acceptance range printed in the row (roughly 2% to 9% at 130 observations)."

Proposed: "Coverage is scored on formation months from December 2015, one observation each, about 130 by the memo date. At 130 observations Kupiec's unconditional-coverage test at the 10% level accepts 3 to 10 breaches, 2.3% to 7.7%; eleven rejects. The test rules out gross miscalibration and does not choose between the model and a baseline that also passes; the choice between them is made on pinball loss, whose detection floor is stated in the row." The row prints the region for the observation count at run time (3 to 10 at 130; 1 to 6 at 60).

Tag: CORRECT.

### Fix 35. `timebombs`: the sign

Finding, review: "An unwind is `f_k,20 < 0` under the node's own sign convention ... The absolute value makes the list fire during a rally in the component."

Now, `timebombs`: "pre-catalyst list: r_i,20 sign(v_ik) sign(f_k,20) > sd20_i; post-unwind list: abs(r_i,20) < sd20_i and abs(f_k,20) > sd20_k".

Proposed: "pre-catalyst list: f_k,20 > 0 and r_i,20 sign(v_ik) > sd20_i (the component has risen and the company rose with it); post-unwind list: f_k,20 < -sd20_k and abs(r_i,20) < sd20_i (the component has fallen by more than one twenty-day sigma and the company has not yet moved)."

Tag: CORRECT.

### Fix 36. `cluster`: one company, one vote per entry

Finding, review: "No normalisation per company. A company with a long risk-factor section contributes more weight than one with a short section at the same loading."

Now, `cluster`: "Q_e = sum of abs(v_i(q)k) over aligned quotes q assigned to e, by leg".

Proposed: "Q_e = sum over companies i in the component set with v_ik > 0 and at least one risk statement assigned to e, of abs(v_ik), by leg. A company counts once per entry, whatever the length of its filing; the quote kept for it is its statement nearest the entry's reference point. Alignment is v_ik > 0: with the sign fixed at a loss (Fix 11), a company's stated risk moves it the way a reversal would only if it moves with the component. P_e is the mean of the same over the random portfolios' component sets; E_e = Q_e - P_e; theme = argmax_e E_e if E_e > q95(max_e E_e over the random sets), else none. The theme and the runner-up are printed with their excess weights." Delete c_q, the book-effect tag b_q and its split (with one sign, the split is the leg split, which the by-leg weights already show), and the "within 10%" rule.

Removes: the length effect, the sign machinery, one printed statistic, one threshold. Adds: nothing.

Tag: CORRECT and SIMPLIFY.

---

## Section 5. Borrowed rigour

### Fix 37. Ledoit-Wolf kept, Marchenko-Pastur removed

Finding, review: "The shrinkage is needed; the random-matrix edge is not, because the cap of three binds every month."

Proposed: Fix 30. Ledoit-Wolf stays with its reason already in `covariance` ("about 600 companies against 126 days would otherwise give a rank-deficient matrix").

Tag: SIMPLIFY (by Fix 30).

### Fix 38. Quantile regression replaced by the thing that works

Finding, review: "An empirical 5% quantile by state on daily overlapping ten-day returns has thousands of observations; the quantile regression has 130."

Proposed: Fix 27.

Tag: CORRECT (by Fix 27).

### Fix 39. Margins replaced by intervals; the floor stated

Finding, review: "The margins are fixed and the power is unknown. With 6 or 7 breach observations dominating a pinball loss, a 2% difference is inside the noise of one breach."

Now, `volvalidation`: "The pinball loss must be at least 5% below each baseline's. Step 2b must reduce the pinball loss of step 2a by at least 2% for the language model to be judged to add anything." Open: "EMPIRICS: the power calculation for the coverage test and the 2% and 5% margins at about 130 observations."

Proposed, `volvalidation` rule: "Pinball loss at tau = 0.05 is computed for the model and both baselines on the same 130 months. The ratio of the model's loss to each baseline's is reported with a 90% interval from a block bootstrap of the months in blocks of six; the memo says the model beats a baseline only when the interval excludes one. By simulation before the run, at 130 observations the ratio between two forecasts has a standard deviation of about 3 to 8 percentage points depending on how much the state moves the tail, so the smallest ratio detectable nine times in ten is about 10 to 15 points, and a 2% margin is not detectable; that floor is in the row. The text test is a sort, not a fit: months are split at the trailing median of the theme's excess weight E (model run), and the model's breach rate is printed in each half with Fisher's exact p; with six or seven breaches the sort resolves only if at least five fall in the high half, and the register labels the result illustrative unless it does. The same sort on the keyword run's E is printed beside it." Delete the 5% and 2% margins and the open item, which is now answered.

Removes: two margins, one open item, an unresolvable test presented as registered. Adds: one bootstrap and one sort, both stateable in a sentence.

Tag: CORRECT.

### Fix 40. Registration on the design sample, stated plainly

Finding, review: "Writing the outcome sentence in advance prevents outcome-dependent wording. It does not prevent in-sample fitting, which is what a register is for."

Now, `register`: "Every v2 test runs on the full sample from December 2013 and is labelled design tier; a forward seal from the memo date is the confirmatory sample."

Proposed, `register` rule, added: "Every v2 test runs on dates that were used to build the design. What the register fixes in advance is the threshold, the floor and the two outcome sentences; it does not make a result out-of-sample, and no v2 result in the memo is called confirmatory. The forward seal from the memo date holds zero observations today. The memo's framing for every v2 result is: in-sample, registered thresholds." g_validation synthesis: replace "Every test is registered before it runs" with that framing.

Tag: CLARIFY.

### Fix 41. `embedspace`: one named encoder

Finding, review: "Thirteen encoders, none named, in a proof of concept budgeted at twenty hours ... 'Live theme statistics are therefore higher than the backtest's for the same text' — labelled, not fixed."

Now, `embedspace`: "The encoder is a masked language model with one version per calendar year, each trained only on text before that year ... the current model is used for the live date. The bias is one-sided. Because the current model has learned associations unavailable to historical encoders, it assigns more live quotes to entries."

Proposed: "The encoder is one public sentence encoder with a published training cutoff, the same on every date, named in the package. Its look-ahead is not bounded: an encoder trained after 2020 places 'vaccine timing' near 'travel resumption' on a 2019 date because it read 2020. The mitigation is the BM25 run beside it on every date, which uses no learned associations; a theme statistic the BM25 run also produces is not an artefact of the encoder, and the share of assignments on which the two agree is printed. Live and backtest use the same encoder, so the live statistics are on the backtest's scale." Delete the yearly-encoder sentence, the one-sided-bias sentences and the open item on the encoder family; the package names the encoder.

Alternative: the yearly family, if a family with dated cutoffs is found; it bounds the look-ahead properly and costs thirteen models and a scale break at the live date. It is the production path's item, written as such, not the design.

Removes: thirteen encoders, the live/backtest scale break, one open item. Adds: one sentence on what the BM25 run bounds.

Tag: SIMPLIFY.

### Fix 42. The BERTopic stack, reduced

Finding, review: "Distillation, HDBSCAN, c-TF-IDF, BM25 — the BERTopic stack, reassembled piece by piece, plus a distilled classifier so that 'treatment and placebo use one instrument'. A keyword rule and a base rate would do the placebo."

Proposed: after Fixes 3, 10, 11 and 16 what remains is: a sentence classifier (the instrument on both sides, and the reason is stated: the language model cannot read 200 random books' filings monthly, and a keyword rule on one side against a model on the other would put the model-keyword difference inside E_e), HDBSCAN on news sentences (the only way a theme absent from the list can appear, which is the AI-value claim of the group), c-TF-IDF as the keyword label (the comparator for the model's name), and BM25 as the comparator for the encoder. Each survives because it is either the instrument or a comparator for one; none is there for its name. The keyword-and-base-rate alternative is declined for the reason in Fix 3.

Tag: KEEP, with the reasons stated in the nodes.

### Fix 43. Prediction-powered inference: delete the mention

Finding, review: "Prediction-powered inference, named in order to be declined."

Now, `labels`: "Confidence intervals are classical; prediction-powered inference is not used because the sample is too small for it."

Proposed: "Confidence intervals are binomial."

Tag: SIMPLIFY.

### Fix 44. Analogues by nearest neighbour where the dimensions exist

Finding, review: "Mahalanobis analogues (4g) where nearest-neighbour on two or three standardised dimensions, restricted to the era where the dimensions exist, would be honest."

Proposed: Fix 33.

Tag: SIMPLIFY (by Fix 33).

---

## Section 6. Hedging and over-labelling

### Fix 45. Caveats become rules or go

Finding, review: "Naming the direction of a bias is not a correction. `embedspace`: 'Live theme statistics are therefore higher than the backtest's for the same text' — labelled, not fixed. `taxonomy`: 'backtest theme weights are overstated because the initial list holds themes that later mattered' — labelled, not fixed. `options`: 'The VaR itself is unchanged, so nothing is biased.'"

Proposed: the encoder scale break is fixed (Fix 41). The `taxonomy` look-ahead is fixed by making the no-list run the backtest's run: "In the backtest, themes are the residual clusters only; the initial list, written on the memo date, is used on the live page and on the memo-date example, and is labelled as written with hindsight. The backtest therefore measures what the clustering finds without a list." That turns a caveat into a rule and removes the "run once with no list" doubling. `options`: delete "The VaR itself is unchanged, so nothing is biased." Delete the legend entry "direction" and the phrase "the bias is one-sided" everywhere; where a bias remains (`filings` coverage, `posdata` lag), the sentence states the mechanism and stops.

Removes: one legend rule, five "one-sided" sentences, one doubled run. Adds: one backtest rule for the list.

Tag: SIMPLIFY and CORRECT.

### Fix 46. The page does not print what it withholds

Finding, review: "A PM would receive a page whose main text is a list of what is missing."

Now, `thepage` item 4: "the pre-catalyst and post-unwind lists by leg once their event study has run; until then a line records that they are withheld."

Proposed: an item that has not run is not on the page. Item 9, the footer, carries one line: "Not on this page: [items], because [test] has not run." Delete "with a note on the page" from every on_failure that concerns a missing input and replace with the footer line; the on_failure field says what the page shows instead, in one clause.

Tag: SIMPLIFY.

### Fix 47. A proxy for the response log

Finding, review: "The design's own test of usefulness is deferred to production and no proxy is offered."

Now, `responselog`: "This log is the only way to measure whether a page changed a decision. It cannot exist until the reader's actual positions are an input to the system."

Proposed, `responselog` rule, added: "Until positions are an input, the proxy is the acknowledgement log and the PM's two logged actions, list edits and catalyst approvals, within five sessions of a page; a page that produces neither is counted as read and not acted on. Before any PM exists, the proof of concept measures the page against its own baseline: on the formation date before each of the five recorded unwinds, whether the page's VaR, theme and hedge line differed from the unconditional baseline's, and how; that is the usefulness evidence the memo can offer today."

Tag: CLARIFY.

### Fix 48. The premise, measured

Finding, review: "The candidate had the reversal record and the news archive and did not check whether the design's premise holds on the majority of episodes."

Now, meta note: "Whether a theme had appeared in the news before those episodes has not been measured."

Proposed: add to `volvalidation` outputs "the premise share: of the recorded episodes since GDELT's first usable date, the share on whose prior formation date a theme rose above the placebo", and to its rule: "The known-theme premise is measured, not assumed: for each recorded episode the monthly run already says whether a theme was named on the prior formation date, and the share is printed with the count. If it is below one half, the memo says the theme machinery describes the minority of episodes and the tail model, which does not use it, carries the page on the rest." Replace the meta note's last sentence with "The share of recorded episodes on which a theme was named beforehand is a registered output of the scoring node."

Tag: CORRECT (a claim becomes a measurement; no new machinery, the monthly run produces it).

### Fix 49. Look-ahead labels with a consequence

Finding, review: "The label says nothing about magnitude, so nothing is decided by it."

Now, legend: "A node's label is at least the strongest label among its backtest-mode inputs."

Proposed, legend: "The label decides one thing: a statistic with the label model may enter a registered test only beside its comparator run, which is clean or as-of, and the row reports both. Live-only nodes are excluded from every backtest; human nodes are the PM's tasks, which a backtest runs without." Keep the five labels; delete the inheritance sentence, since with the tail model taking no text the only model-labelled statistics that reach a test are E_e and the theme, and both have comparators by Fix 9.

Tag: CLARIFY.

### Fix 50. Version archaeology out

Finding, review: "`zscore`: 'The node keeps its v1 id ...' ... 'register row 13', 'row 10' ... refer to a document not in the spec."

Proposed: delete every "keeps its v1 id" sentence (rename `zscore` to `percentiles` and `pc1text` to `gathertext`, and `route2` to `drivingseries`), and every row number; a check reads "registered" without a number. The changelog holds the history, per rule 10 of the writing standard.

Tag: SIMPLIFY.

### Fix 51. The live model is the scored model

Finding, review: "The VaR on the live page has a regressor set that has never been scored."

Proposed: Fix 27's last sentence. An approved catalyst opens a window; the window state is the only thing the model reads from the calendar; live and backtest apply one rule. The edge `catapprove -> severity` carries "approved catalyst dates, which open windows".

Tag: CORRECT (by Fix 27).

---

## Section 7. Other signatures

### Fix 52. Every number that survives has an origin

Finding, review: "Not one has a stated origin. Pick any and ask why not half or double."

Proposed, for each number kept, the sentence that goes beside it in its node; numbers not listed here are deleted by earlier fixes (30 news records, 90 monthly records, 20 quotes, the 10% runner-up, 0.5 rms, R-squared 0.5, 200 passages, 6,000 tokens, 30 whole documents, the 99.2nd percentile, the 2% and 5% margins, 1,000 draws, the eight releases):
* N = 200 random portfolios: the 95th percentile rests on ten draws.
* 2,000 labelled sentences per source: a standard error near one percentage point on a precision near one half.
* 126 days: one window for every rolling statistic, half a year, the same as the covariance window, so no two statistics disagree on the window.
* d* at the 90th percentile: nine in ten members of a dense news topic count as within it.
* HDBSCAN minimum 25: about two headlines a week over the twelve-month window, the smallest topic the page would print.
* 50 seeds per reference point: enough that one headline's wording does not move the point.
* Jaccard 0.5: half the component set changed since last month.
* 10% of gross book weight reporting: the share above which earnings days move the book's ten-day return by more than a tenth of a sigma, to be confirmed on the record at registration; if the record says otherwise, the number moves.
* Five sessions before a catalyst: one week to put on a hedge.
* 21 days to collapse breach days into an episode: one month, the rebalance interval.
* Five analogues: what fits on the page.
* Bootstrap blocks of six months: longer than the ten-day horizon and the quarterly filing cycle.
* The event-study margin: set at registration as the median sd20 of book companies, a data-derived number, not 200bp; the sign-agreement count is reported and not required.
* 100 hand labels in the proof of concept: about two hours of the author's time, and a standard error of five points on precision.

Tag: CLARIFY.

### Fix 53 (the loser leg). One asymmetric rule

Finding, review: "Every formula is 'by leg'; every leg is treated identically; and the one asymmetric fact in the whole document ('77 of the 86 ... were loser-leg losses in a rising market') produces no asymmetric rule."

Now, `posdata`: "On the loser leg 13F crowding counts long holders, so it measures long crowding in a short; short interest (PUBLIC, two-week lag) is the short-side measure and is printed beside the score without entering it."

Proposed, `posdata` rule: "The positioning score has one input per leg. On the winner leg it is 13F crowding, the number of momentum-style filers holding the company (a momentum-style filer is one whose value-weighted holdings have an average 12-1 rank in the universe's top decile as of the filing quarter; PUBLIC, 45-day lag), ranked within the leg. On the loser leg it is short interest as a share of float (PUBLIC, two-week lag), ranked within the leg. Heavily positioned is the top quintile within each leg. For companies outside the book, the crowded quintiles are the universe's top quintile by 13F crowding and its top quintile by short interest; together they are the second search scope for propagation. The longest input lag is printed with the score." Add to `timebombs`, as the loser leg's own line: "squeeze state: the loser leg's trailing 20-day return exceeds its sd20 while the market's 20-day return is positive; when it holds, the page's state line reads 'squeeze in progress' and the post-unwind list on the loser leg is the list of heavily shorted theme companies that have not yet rallied." Add to `french`: "The reversal record is split by which leg carried the loss; the memo reports the split (77 of 86 unassigned episodes on the loser leg in v1) as the reason the loser leg has its own measure."

Alternative: keep one score for both legs with 13F and add short interest as a third input on the loser leg only. It keeps comomentum's identity problem and a three-input score; one input per leg is the rule a reader can repeat.

Removes: comomentum, the printed-but-unused short interest, the sign-inverted crowding on the short. Adds: one state line.

Tag: CORRECT and SIMPLIFY.

### Fix 54. Options closed

Finding, review: "Every option kept. Prose and template; model run and keyword run; cap-matched and sector-matched nulls; value-weighted and equal-weighted; joint and per-leg decomposition; three components; top three entries; two percentiles per number; two triggers; three text layers; two lists; five analogues plus quiet dates; both the driving series and the bridge deciding the hedge."

Proposed, one decision each: template (Fix 6); keyword run to the theme only (Fix 9); one null (Fix 3); value-weighted only, the equal-weighted appendix deleted from `sort`; joint decomposition only (Fix 25); three components kept, one named (Fix 30); theme and runner-up (Fix 36); one percentile on the page, own-history for exposures and random-book for VS_k and E_e, the other in the appendix (Fix 3); two triggers kept, because a calendar page and a threshold page answer different questions and share one scoring rule; two text layers now, the production layer moved to the production path; two lists kept with the sign corrected, because they serve different dates; analogues from all formation dates (Fix 33); the bridge decides the hedge (Fix 23). "Printed beside" survives where a comparator is printed beside a model output, which is what the legend defines it for, and nowhere else.

Tag: SIMPLIFY.

### Fix 55. Register proportional to difficulty

Finding, review: "`garch` is four lines with empty checks and 'on_failure: n/a'; `riskextract` is a wall. The tail model — the number on the page — gets less mechanism than the placebo for a text label."

Proposed: the tail model node carries the longest rule (Fix 27) and the baselines node the second (Fix 14); `riskextract` shrinks (Fix 11); `garch` goes. Where nothing can fail, the on_failure field is deleted rather than filled with "n/a"; where a check list is empty the field is deleted. The uniform skeleton is a rendering convenience, and the renderer tolerates missing fields.

Tag: CLARIFY.

### Fix 56. Formulas first

Finding, review: "Writing the formula exposed errors in the prose — the prose was written first, by something that does not compute."

Proposed: in draft 11 every rule that computes a number is written as its line first and its sentence second, and the header sentence about draft 9's corrections moves to the changelog. Fixes 14, 27, 29, 35 and 36 are the cases where the line is the fix.

Tag: CLARIFY.

### Fix 57. The hindsight illustration

Finding, review: "`catagent`: 'As a hand-written illustration: when the memory cycle was the theme in mid-2026, the two relevant catalysts were earnings of Broadcom and of SK Hynix, an off-universe company.'"

Proposed: delete the sentence. The memo-date page carries the model's actual proposals for the live theme, beside the comparator's, with the PM's approval column empty; that is the illustration, dated and without hindsight.

Tag: SIMPLIFY.

### Fix 58. Boilerplate to the legend

Finding, review: "'(DESK-ONLY, not available to us now)' four times; 'When the model version changes, every data stream this node feeds is recomputed and the page displays the level shift' twice, word for word."

Proposed: the legend's access entry defines DESK-ONLY once as "not available to us now", and the nodes carry the tag alone. The model-version sentence becomes one legend entry, "model version: when a model's version changes, every stream it feeds is recomputed and the page prints the level shift", and leaves the nodes.

Tag: SIMPLIFY.

### Fix 59 (proof-of-concept scope). Labels in, ablation out

Finding, review: "The PoC 'produces ... the keyword-versus-model ablation as the one registered test' with the extractor's precision unknown."

Now, `proof_of_concept`: "produces: the tail-model scoring, steps 0 to 2b, with the keyword-versus-model ablation as the one registered test, on the full sample from December 2013; the result is design tier"; deferred includes `labels`.

Proposed, `proof_of_concept`: "path: prices, refseries, french, sort, random, covariance, pca, bridge, filings, news, newsagent (keyword rule only), taxonomy (memo-date list, live page only), embedspace (one named encoder, BM25 beside it), gathertext, riskextract (the model labels 2,000 sentences once; the classifier runs on the universe), cluster, namecluster, propagate (retrieval, rest of the book only), themescore, eventbaseline, severity, labels (100 filing sentences, labelled once by the author), register, volvalidation. produces: (1) the tail model's coverage on about 130 months against both baselines, the one registered test that can resolve, in-sample with registered thresholds; (2) extraction precision of the model's labels and the keyword rule on 100 hand-labelled sentences, registered, resolvable at five points; (3) the theme pipeline on the memo date and on the formation date before each of the five recorded unwinds, with the premise share, illustrative; (4) the text sort of the breach record, illustrative with its floor stated; (5) the memo-date page. deferred: posdata, poscluster, timebombs, bombtest, options, catagent, catapprove, analogue. described_only: pmworries, eventrule, thepage, signoff, responselog, themevalidation." If the API key is not available by the time the classifier is trained, `riskextract` runs on the keyword rule alone and (2) reports the keyword rule's precision only, with the model's column empty and labelled as not run.

Alternative: the narrower scope, (1), (2) and (5) with the theme pipeline on the memo date only. It gives up the five-episode illustration and the premise share, which are the only evidence in the memo that the theme machinery describes past reversals; if hours run short, the four earlier episodes are the first cut, then the premise share, and the coverage test and the labels are never cut, because they are the two tests that can resolve.

Removes: the unresolvable ablation as the registered test, `labels` from deferred, `garch`, `controls`, `sensitivities`' second measurement, `zscore`, `composer`. Adds: 100 labels, about two hours.

Tag: SIMPLIFY and CORRECT.

---

## Interview answers

Each answer is what the corrected design gives; the fix that makes it true is in brackets.

**Q1 (November 2020, the case flag).** There is no flag: the vaccine component is the highest-variance component above the random-book noise, its winners load positive and its losers negative, and item 1 prints it with the entry its component companies' risk sentences fall nearest, with the leg-mean loadings on one line as description. The flag in draft 10 would have called it the factor and demoted the label, which was wrong for the reader. What the flag guarded against, the sort's own axis named as a theme, is handled by the placebo, since a component with no shared condition has no entry with excess quote weight. [Fix 31]

**Q2 (December 2015 fit).** Draft 10 fitted 17 parameters on 24 months with 1.2 expected below the line, which cannot be fitted; draft 11 fits nothing. The VaR is the 5th percentile of about 500 volatility-standardised daily ten-day starts in the same calendar state, about 250 inside windows, so twelve observations sit below the line on the first scored date and about 80 by the memo date. Text features do not enter; they are tested as a sort on the breach record and the memo calls that sort illustrative. [Fix 27]

**Q3 (`eventbaseline` draws).** Neither, because there are no draws: the calendar baseline is the 5th percentile of the book's own ten-day returns over past starts inside catalyst windows, about 480 windows since 2014, each a book-level return on the date it happened. Independent company draws would have averaged the cross-section to near zero; common-date draws over eight releases would have been a bootstrap of eight numbers. Every window return is ten days, reporting companies included, so there is no one-day/ten-day mismatch. [Fix 14]

**Q4 (bp loss against hedge notional).** The hedge is sized from the component: the book's loading g_k = w'v_k and the instrument's slope h_k on f_k from the bridge give a notional of 100m g_k / h_k, so on a minus-two-sigma move the hedge returns what the bp loss line loses, and the page prints the unexplained share 1 - R-squared beside it. Draft 10 sized from the book's beta to a sector ETF, which for a dollar-neutral book can be near zero while the component exposure is large. The instrument is the one, among sector ETFs and the five series' instruments, whose return best explains f_k. [Fixes 23 and 29]

**Q5 (`poscluster` under no crowding).** In draft 10 above 0.2 mechanically, because comomentum is the loading in another form. In draft 11 the score has one input per leg, 13F crowding on the winner leg and short interest on the loser leg, neither computed from returns, so under no crowding the crowded quintile is independent of the loadings and O is 0.2. [Fixes 24 and 53]

**Q6 (`newsagent` paraphrase).** There is no paraphrase: the embedded object is the sentence itself, and the space contains one point per risk sentence in the archive. The language model labels 2,000 sentences once and a classifier head marks the rest; the model's job is the labels, and the keyword rule is scored against it on the same hand-labelled sample. [Fix 10]

**Q7 (d*).** d* is the 90th percentile of the distance from a news sentence to its own cluster's centroid. It is valid in all three places because all three are now the same comparison, a risk sentence against a reference point: news sentences to entries for news weight, filing sentences to entries for quote weight, and scope companies' filing sentences to the theme's point for propagation; the paragraph and the cluster-to-cluster uses are gone. [Fixes 16 and 32]

**Q8 (Kupiec region).** Three to ten breaches at 130 observations, 2.3% to 7.7%; eleven rejects. Passing tells you the model and the baselines are not grossly miscalibrated and nothing about which to use; that comes from the pinball ratio with a bootstrap interval, whose floor at 130 months is about 10 to 15 points. [Fixes 34 and 39]

**Q9 (what the register protects).** The threshold, the floor and the two outcome sentences, not the inference: every v2 result is in-sample with registered thresholds and none is called confirmatory. The forward seal from the memo date has zero observations today. [Fix 40]

**Q10 (step 2b against 2a).** That test no longer exists, because six or seven breach months would have driven a 2% margin that sits inside one standard deviation of the ratio. Text is tested as a sort of the breach record at the median of the theme's excess weight; it resolves only if five of the six or seven breaches fall in the high half, and the register labels it illustrative otherwise. [Fix 39]

**Q11 (2008 against 2022 analogues).** In draft 10 the 2008 date, by construction, because four dimensions give smaller distances than eight. In draft 11 there are no pre-2014 candidates: every candidate is a formation date since December 2013 with all ten dimensions, standardised on their own history, and aptness needs the bear state and the theme entry, which the new edge from `cluster` supplies. [Fixes 19 and 33]

**Q12 (the loser leg).** The positioning score uses short interest on the loser leg and 13F crowding on the winner leg, because a 13F count on a short measures the wrong side. The loser leg has a squeeze state, its 20-day return above one sd20 with the market up, and the post-unwind list on that leg is the heavily shorted theme companies that have not yet rallied. The theme machinery still describes the minority of recorded episodes, and the premise share, the share of episodes with a theme named beforehand, is a registered output rather than a sentence. [Fixes 48 and 53]

---

## If only five fixes could be made

1. **Fix 27, the tail model.** Replace the 17-parameter quantile regression with the volatility-scaled, state-conditional empirical quantile; no fit, two states, expected shortfall defined from the same set, live and scored model identical. It answers Q2, Q8's second half, 4a, 5b, 5c and 6g, and it is the number on the page.
2. **Fix 14 with Fix 12, the baselines.** Replace the company-level draw with the book's own past window returns, and drop GARCH so that the ablation is one step from calendar baseline to model. It answers Q3, 2c, 2e and 4b, and without it the model's one resolvable test is against an undefined or trivial baseline.
3. **Fix 31, the case flag retired.** Naming runs on every component above noise, the placebo does the flag's job, and the leg-mean loadings are printed as description. It answers Q1, 4e and 3b, and it is the fix that lets the November 2020 page name the vaccine.
4. **Fix 29 with Fix 23, the hedge line.** Size the hedge from the component's loading through the bridge's instrument slope, and let the bridge choose the instrument. It answers Q4, 4c and 3g, and it is the line the PM acts on.
5. **Fixes 10, 11, 16 and 32 together, one object and one distance.** Embed the sentence, keep one record stream, propagate by retrieval over classified sentences, and calibrate d* on the one comparison that remains. It answers Q6, Q7, 2a, 2b, 2g and 4f, and it is what makes the text pipeline something that can be walked through with one example.

The sixth, if a sixth is allowed, is Fix 53, the loser leg, because it is the only fix that changes what the design says about the majority of the reversal record.
