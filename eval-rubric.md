# Evaluation rubric for the momentum reversal-risk design

Purpose: let any evaluator instance score the design the same way, against what the brief actually asks
for. The rubric is derived from the brief's seven evaluation criteria and seven required elements. Every
score must be earned by cited evidence from the design files; a score without node ids is invalid.

## 0. Source of the categories

The brief says it will evaluate: clarity of the research framing; originality and judgment on an open-ended
problem; creativity and quality of the design; how thoughtfully and effectively AI tools are used;
credibility of the validation; usefulness of the example output; how clearly tradeoffs and limitations are
communicated. It says explicitly: "A focused design with clear reasoning is preferred to a broad but shallow
implementation", "whether AI materially improves the research or risk-monitoring process", "Polish and
implementation volume are not substitutes for sound reasoning", and it caps the project at about twenty
hours. Nine categories follow. Parsimony and feasibility are not named criteria but are the brief's stated
preferences, so they are scored.

## 1. The nine categories, each on a 1 to 5 anchored scale

Score the design as it is written, not as it could be. Half points are not allowed.

### C1. Research framing
What is monitored, what counts as the reversal event, over what horizon, for whom, and what decision it
informs.
- 1: one of the five is missing or contradicts another.
- 2: all five present but the decision informed is generic ("manage risk") or the event has two definitions.
- 3: all five present and consistent; the decision is specific; a reader can restate them in one sentence.
- 4: as 3, and the framing is owned as a choice with the alternative framings named and the reason for this one.
- 5: as 4, and the framing makes a claim that could be wrong and says what would show it wrong.

### C2. Originality and judgement
Whether the design makes non-obvious choices and shows the reasoning, including dead ends and reversals.
- 1: a standard pipeline with no choice explained.
- 2: choices are listed without alternatives.
- 3: the main choices carry alternatives and a reason; at least one reversal or dead end is recorded.
- 4: as 3, and at least one idea is genuinely new to the reader (name it) and is falsifiable.
- 5: as 4, and the new idea is placed against the literature or standard practice with its risk stated.

### C3. Genuine use of AI
Whether each model step does something a deterministic method cannot, is auditable, and is bounded for
look-ahead. Count the model steps; score the set.
- 1: model steps are decorative, or their contribution is asserted.
- 2: model steps do real work but have no comparator or no audit trail.
- 3: every model step has a deterministic comparator printed beside it and its outputs are traceable to source spans.
- 4: as 3, and every model step carries a look-ahead classification with a stated mitigation, and the steps that cannot be mitigated are excluded from validation claims.
- 5: as 4, and the design contains a test that would show the model steps add nothing, with the consequence stated.

### C4. Parsimony
Whether every component earns its place and the design can be explained in a small number of steps.
- 1: many components with overlapping jobs; the reader cannot say what most boxes are for.
- 2: some redundancy; validation and logging drawn as pipeline stages.
- 3: each component has one job; the system can be told in under ten steps.
- 4: as 3, and components that exist only to test other components are separated from the flow.
- 5: as 4, and nothing could be removed without losing a claim the design makes.

### C5. Credibility of validation
Baselines, ablations, leakage controls, registration, power, and the distinction between plan and evidence.
- 1: no baseline or no leakage control.
- 2: baselines and controls named but not the statistic, the sample, or what would count as failure.
- 3: for each test: the statistic, the sample size, the baseline, the failure condition; plan and evidence are distinguished.
- 4: as 3, and the baselines are the ones a sceptic would pick (calendar-aware, not naive); look-ahead is bounded by a measurement, not a claim.
- 5: as 4, and a negative result would be reported at the same volume as a positive one, with the design saying what changes under each.

### C6. Usefulness of the output to a PM
The page: horizon, severity or probability, drivers, evidence, and what to do.
- 1: no output specified, or numbers without a horizon.
- 2: horizon and a risk number, but no drivers or evidence.
- 3: horizon, severity, drivers and evidence, in units the PM uses.
- 4: as 3, and the page states a direction and the instrument and cost of the hedge, and maps the paper book to the reader's book.
- 5: as 4, and the page says what changed since last time and what would resolve or refute the reading, with a date.

### C7. Clarity of exposition
Whether a cold reader can follow the design end to end without guessing.
- 1: private vocabulary throughout; the flow cannot be restated.
- 2: the spine can be restated but most components need a second read.
- 3: every term is defined at first use; every component can be restated in one sentence; numbers carry units.
- 4: as 3, and each step's synthesis alone would let a PM understand what it does and why.
- 5: as 4, and there is no sentence a reader would have to reread.

### C8. Honesty about tradeoffs and limitations
Direction of bias on every limitation; what is not available; what has not run; what cannot be tested.
- 1: limitations absent or generic.
- 2: limitations listed without direction of bias or consequence.
- 3: each limitation carries its direction of bias and its consequence for the reading.
- 4: as 3, and unrun tests, unavailable data and untestable components are labelled as such where the reader meets them.
- 5: as 4, and the design names the case in which its own headline claim fails.

### C9. Feasibility within scope
Whether a proof of concept can run on public data inside about twenty hours, and whether the design says which part.
- 1: nothing could run on public data.
- 2: parts could run but the design does not say which.
- 3: the design identifies the components that run on public, as-of data today.
- 4: as 3, and a proof-of-concept path through those components is stated, with the tests it can produce.
- 5: as 4, and the path is small enough for the hours and produces at least one registered test.

## 2. Procedure, to be followed in this order by every instance

1. Read `groups.yaml` in full. Write the one-paragraph restatement of the system before opening the spec.
2. Read `spec.yaml` in full, node by node, then edges.
3. For each category, collect evidence first: at least three cited node ids or quoted phrases, including at
   least one that argues against a high score. Then assign the score. Never score before collecting.
4. For each category, name the single strongest point and the single weakest point.
5. Fill the scoring sheet in section 3 exactly. No extra categories, no half points.
6. State overall confidence (high, medium, low) and the two categories where another evaluator would most
   likely differ from you, with the reason.

## 3. Scoring sheet (copy exactly)

```yaml
evaluator: <instance label>
design_version: <meta.version>
restatement: <one paragraph written after groups.yaml, before spec.yaml>
scores:
  C1_framing:      {score: , evidence: [node ids or quotes], strongest: , weakest: }
  C2_originality:  {score: , evidence: [], strongest: , weakest: , new_idea: }
  C3_ai_use:       {score: , evidence: [], strongest: , weakest: , model_steps: [ids]}
  C4_parsimony:    {score: , evidence: [], strongest: , weakest: , removable: [ids]}
  C5_validation:   {score: , evidence: [], strongest: , weakest: , run_vs_planned: }
  C6_output:       {score: , evidence: [], strongest: , weakest: }
  C7_clarity:      {score: , evidence: [], strongest: , weakest: , undefined_terms: []}
  C8_honesty:      {score: , evidence: [], strongest: , weakest: }
  C9_feasibility:  {score: , evidence: [], strongest: , weakest: , poc_path: [ids]}
total: <sum of nine>
confidence: <high|medium|low>
likely_disagreement: [<category>: <reason>, <category>: <reason>]
three_changes_that_would_raise_the_total_most: [ , , ]
```

## 4. Rules that keep instances consistent

- Score what is on the page. Do not credit intentions in `open` fields or the change log.
- Volume earns nothing. A category does not rise because there are more nodes, tests or words.
- A private term used without a definition at first use counts against C7 even if the reader can guess it.
- An unrun test counts as a plan under C5, not as evidence. A test that has run counts only if its number is
  in the design.
- A model step whose output is printed or enters a claim needs a printed comparator; without one C3 is capped at 2. A live-only step needs a comparator from the day it goes live. A model step with no look-ahead label caps C3 at 3.
- A limitation is any caveat on a number the page prints, including a labelled look-ahead and a coverage gap. A limitation without a direction of bias caps C8 at 2.
- A registered pass band that a correctly calibrated model would fail more than 10% of the time counts as no band under C5.
- If two categories seem to reward the same fact, credit it in the one where the brief names it and note
  the overlap.
- When torn between two scores, take the lower one and say why in `weakest`.

## 5. Calibration anchors

- A design with a clean spine, defined terms, one tail model with an ablation, and three unrun tests should
  score around C5 = 3, C7 = 3 or 4, C4 = 3.
- A design where every LLM step has a comparator, a quote gate and a look-ahead label, and one step is
  declared live-only, should score C3 = 4 unless a test exists that could show the models add nothing, in
  which case 5.
- A page with horizon, VaR in bp, drivers with quotes, hedge instrument and cost, and a beta mapping, but
  without a dated resolution, scores C6 = 4.

## 6. Writing standard, from the draft-6 LLM-pattern report

The register is plain, unemotive, precise and sober. A sentence that would read as salesmanship, drama
or jargon to a risk manager fails on that ground alone.

Every draft is checked against these ten rules before it is scored. A rule broken in a rule or synthesis
counts against C7.

1. Give the page, the record and the rule no verbs of speech or thought. Write "with a note on the page",
   not "the page states it".
2. One meaning per word. "Carry" belongs to the conferred/carried pair and nowhere else.
3. No label-colon fragments; write the label into the sentence.
4. Do not announce a count and then list; list.
5. A definition goes in the legend or in its own sentence, never in a relative clause mid-sentence.
6. No aphorisms; state the mechanism in the order it happens.
7. Baselines and models are given information or use it; they do not know it.
8. Say what has not run once, in a full sentence, not as a tag.
9. Keep one fact per sentence, but supply the connective when one fact causes another.
10. Do not narrate the document's own history inside a rule; the change log holds it.

### Notation

Notation is plain ASCII in the spec and typeset in the memo. A line is added only where prose was
carrying a sum over a set, a product of signs, a regression, or a threshold built from other numbers.
Every regression is written once, stating what is regressed on what, over which observations, and what
is reported. A forward-return target is fitted only on observations whose target is realised on the
forecast date. The system has one residualisation; a second would need its own letter and a stated
reason. Named estimators and tests (Ledoit-Wolf, GARCH, HDBSCAN, BM25, Kupiec, Mahalanobis, quantile
regression) are named, not derived; the scoring rule is defined once, where the reader meets it. The
symbol table in the legend holds only symbols used by two or more nodes, and favours the statistics the
page prints over the arithmetic's inputs.
