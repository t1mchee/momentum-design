# Handover: the design canvas, as of 2026-09-07

Written for the next agent, whose task is a language pass. It says what exists, what is settled, what
may be changed, what must not be, and how to check and publish. Read it before touching any file here.

## 1. What this is

A versioned design for the system Jim's brief asks for (the brief, verbatim, is in
`docs/drafting/CLAUDE.md`; the digest is in the repo's `CLAUDE.md`). The design is the intended system,
with no split between what the proof of concept runs and what production would run; look-ahead and
access labels carry that distinction instead. The design is **frozen at draft 8** on substance. From here
the work is writing: the memo, the proof of concept, the example page.

Three views render the same design, all from YAML polled once a second, so edits show as they are saved:

| view | file | data | role |
|---|---|---|---|
| full | `index.html` | `spec.yaml` (51 nodes, 110 edges) | the record; every component, edge, check and fallback |
| by level | `levels.html` | `groups.yaml` over `spec.yaml` | the seven reading-order steps with drill-down and a one-paragraph synthesis per step |
| simplified | `simple.html` | `simple.yaml` (22 boxes, 68 edges) | the memo's section and paragraph plan; each box absorbs named full-view nodes |

Live copies: https://t1mchee.github.io/momentum-design/ (index), `/levels.html`, `/simple.html`. Repo
`t1mchee/momentum-design`, public, main branch, a plain copy of this directory.

## 2. Decisions that govern the next pass

1. **`spec.yaml` is the single source of truth.** Any change of substance is made there and nowhere
   else. Tim's decision after the comparison report: the simplified map keeps its grouping, not its
   prose. Its per-box rules were written fresh and drifted from the full spec in twelve places in one
   pass (`docs/reviews/compare-full-vs-simple-draft-8.md`, section 5).
2. **The simplified map's prose becomes the memo's abridging paragraphs.** Each box's `rule` is to be
   rewritten as one paragraph that abridges and aggregates the rules of the nodes it absorbs, carrying
   the sentences the comparison names in its section 6. That paragraph is the memo text for that box.
   Until that is done, treat `simple.yaml` rules as a draft with twelve known defects (section 5 of the
   comparison), not as the design.
3. **No further design rounds.** Tim's call: the remaining items in `fixes-for-draft8.md` sections A12,
   A13, C and D are memo sentences, not spec changes. The twenty-hour framing in the
   proof-of-concept block is stale and should be dropped; element 4 still needs a statement of what
   the artifact is and what it runs on.
4. **Language edits bump the version.** A language-only pass on `spec.yaml` is saved as
   `versions/v2-draft-9.yaml`, with a `changelog.yaml` entry whose summary says "language only" and
   whose changes list what classes of sentence were touched. Draft 8's entry becomes `status: done`.
   Do not change node ids, edge endpoints, inputs, outputs, numbers, thresholds, comparators,
   mitigations, `on_failure` fallbacks, look-ahead or access labels, or the proof-of-concept lists.
5. **Vocabulary is fixed.** One meaning per word, per the pattern reports:

   | word | reserved meaning | say instead |
   |---|---|---|
   | carry / carried | the conferred/carried exposure pair only | "sends" for edges; "contains" for text; "has" for pages |
   | company (or "name" only in "vulnerable names") | a stock in the universe | never "name" for a company elsewhere |
   | theme label | the words given to a theme | never "theme name" |
   | step | an ablation step only | "node" or "box" for pipeline parts |
   | keyword run / model run | the two end-to-end text pipelines | never "series" for these |
   | reference series | the six macro series | never "the list" |
   | worry list | the PM's registered list | "the two vulnerable-name lists" for the others |
   | bear state | the Daniel-Moskowitz indicator only | "kept current" for the page |
   | sign | always qualified: leg sign, loading sign, company sign | the PM "acknowledges", never "signs" |
   | window | always qualified: ranking, catalyst, 126-day, twelve-month | |
   | clean / as-of / model / live-only / human | the look-ahead labels | never none / data / model-unmitigable |

## 3. Writing rules and anti-examples

- The register is plain, unemotive, precise and sober. The first language pass (draft 9) met the checker
  but introduced nominalisations (comprise, categorize, protocol, feature vector) and changed meaning in
  eight places; a second pass undid both. Check meaning against the previous snapshot, not only the checker.
- The standard: `eval-rubric.md` section 6 (ten rules). The twelve further rules are in
  `docs/reviews/slop-v2-draft-7.md` section 7; apply them too.
- Anti-examples, quoted with rewrites, are in the two pattern reports: `docs/reviews/slop-v2-draft-6.md`
  (the tables in "Spec rules, node by node" and "Edges and short fields") and
  `docs/reviews/slop-v2-draft-7.md` (the census with itemised sub-tables, the three sentences a PM would
  stop at, the coinage keep/drop table). The habits that survived two passes and are still in draft 8:
  speech verbs for the page (22 left), "carry" outside its pair (6), label-colon fragments (12),
  document history inside rules (8), mid-sentence definitions (9), sentences over 45 words (15).
- The skeptic's reports (`clarity-v2-draft-6.md`, `clarity-v2-draft-7.md`) list, per node, the phrases a
  cold reader could not follow. Those are the sentences to simplify first.
- `check.py` enforces a subset mechanically: sentence length, speech verbs, "carrier", label colons,
  announced counts, the old look-ahead words, plus every structural check. Run it before and after:

  ```bash
  uv run python docs/design/check.py
  ```

  Structural findings are failures and must be zero. Writing-rule findings are warnings; draft 8 has 19
  in `spec.yaml` (15 sentences over 45 words, three speech verbs, one announced count), and the language
  pass should bring that to zero without changing structure. It reads `spec.yaml`, `groups.yaml`,
  `simple.yaml` and `changelog.yaml`.

## 3a. Notation (draft 10)

Draft 10 added a symbol table (`meta.symbols`) and one-line formulas in twelve nodes, written in LaTeX
(`$$...$$` on its own line for a display formula, `$...$` inline; `meta.legend.notation` states the conventions), per
`notation-for-draft10.md` as amended by `docs/reviews/notation-review-draft-10.md`. The rule for further
notation is in `eval-rubric.md` section 6 under "Notation". Writing the lines exposed four faults in
draft 9's rules, corrected in draft 10: the price-correlated rule needed absolute correlations; the
Marchenko-Pastur edge is applied to the correlation matrix's eigenvalues, not the covariance's; the tail
model is fitted on days u <= t-10 so every target is realised; the calendar baseline no longer adds a
book-level macro return on top of company draws. Comomentum now uses the one market residual u, and the
bridge regresses on series 2 to 6 only, since the market is removed at the first stage.

## 3b. Draft 11, the simplification

Draft 11 applied `fixes-for-draft11-proposal.md`, the answer to `docs/reviews/pm-catchout-v2-draft-10.md`.
The design is 45 live nodes; three were retired (controls, garch, composer) and three renamed (zscore to
percentiles, pc1text to gathertext, route2 to drivingseries). The tail model is an empirical quantile, the
case flag is gone, the hedge is sized from the component, the text pipeline has one object and one
distance, and the loser leg has its own positioning input. `simple.yaml`'s box rules are now the memo's
abridging paragraphs and are consistent with the spec. The design is frozen again at draft 11 pending the
fresh catch-out read.

## 3c. Drafts 12 and 13

Draft 12 corrected the arithmetic the draft-11 read found (hedge ratio, loser-leg sign, overlap null,
calendar state, cluster identity). Draft 13 applied the triage of the design-only read of draft 12
(`triage-draft12-review.md`): 51 fixes, 9 decisions taken toward the simpler mechanism, 5 findings left
with reasons. The design is 38 live nodes and 13 retired. The main changes: a short as the hedge with the
VaR before and after it, no options feed; news and filing statements clustered together with one
distance; the worry list labels clusters; the calendar state on the ten-day span; crossing-day threshold
pages; the excess weight as a share; every printed diagnostic gates something or is gone. The spec's
header no longer narrates its review history; the change log holds it.

## 3d. Draft 14

Draft 14 applied the triage of the design-only read of draft 13 (`triage-draft13-review.md`): 36 fixes, 5
decisions, 10 findings left with reasons. The design is 37 live nodes and 14 retired. The main changes: the
hedge is sized by the slope of the component on the instrument's market-residual return (the minimum-variance
ratio; the previous instrument-on-component slope over-hedged by the inverse of its R-squared); the threshold
trigger reads the largest variance share among components above noise, so the trigger is clean; the page
decides its own order; theme companies are the set members that state the theme plus the propagated ones;
four ablation lines; a centroid distance beside the assignment distance; the gather-text node folded into
the assignment node. Lesson from this round: when a node is rewritten, rewrite the synthesis paragraph in
`groups.yaml` in the same patch; three stale paragraphs cost more in the read than any single error.

## 3e. Draft 15 and the end of the read-and-fix loop

Draft 15 closed the draft-14 read without a fresh read after it. Scores over the design-only reads were 26,
26, 25 out of 40 for drafts 12, 13 and 14, with "author understands" at 3 each time; each read found a
different layer and each patch introduced a few errors of its own (draft 14: the market line without a
producer, the trigger's seventh statistic without a producer, an unpassable premise threshold, a false
sentence about block length). Draft 15 fixed those and the cheap pre-existing ones. The reader's standing
objection, that the text nodes change no number on the hedge line, is the design's position: text names
the risk, chooses the component and gates the lists; the tail model is text-free by design; switch the text
off and the named component, so the instrument and the notional, change. The remaining doubts are
thresholds a run settles (the R-squared gate, the size of the loading, the filer count), which E1 to E5
produce. Do not run another design-only read before the proof of concept.

## 3f. Draft 16, the first draft shaped by numbers

The executor (session "Execution", experiments exp-084 to exp-091 in `project/experiments.yaml`) ran the
tail model on the published factor and on the reconstructed book, the extractor comparisons, and the first
pass of the theme pipeline. Draft 16 takes three decisions from those runs: no conditioning state in the
tail model (three variables tested, none adds anything measurable); value-weighting stays, with the
concentration it produces printed; the proof of concept is three artifacts. It also adds the UMAP reduction
before HDBSCAN, which the first theme pass showed is necessary. Numbers from the runs enter the spec only
as reasons, never as results; results live in the experiments file and the memo.

## 4. Files in this directory

| file | what |
|---|---|
| `spec.yaml` | the full design, draft 8; header comment lists the fields |
| `groups.yaml` | the seven steps, their syntheses and children, for the levels view |
| `simple.yaml` | the 22-box map; `absorbs` lists per box; `sends` on edges |
| `changelog.yaml` | one entry per draft, newest first: summary, changes, reasoning, status |
| `versions/` | a snapshot per draft; `v1-baseline.yaml` is the first design as populated from the memo |
| `index.html`, `levels.html`, `simple.html` | the viewers; CDN-loaded dagre, js-yaml and KaTeX; no build step |
| `math.js` | typesets the LaTeX formulas in the panels (`$$...$$` display, `$...$` inline); without KaTeX the raw text stands |
| `eval-rubric.md` | the nine-category rubric with caps, procedure, sheet, calibration anchors and the writing standard |
| `decisions-for-draft4.md`, `fixes-for-draft5.md`, `fixes-for-draft7.md`, `fixes-for-draft8.md` | the decision and fix lists that produced each draft; draft 8's header says what was and was not applied |
| `check.py` | the consistency checker: structure fails, writing warns |
| `README.md` | viewer notes |

Reviews, all in `docs/reviews/` and all on the design unless named otherwise: `panel-v2-*` (the
three-role panel on draft 2), `parsimony-v2-draft-4.md` (the tight map that became the simplified view),
`clarity-v2-draft-4/6/7.md`, `slop-v2-draft-4/6/7.md`, `eval-v2-draft-5-A/B.md`, `eval-v2-draft-6-C.md`,
`eval-v2-draft-7-D.md`, `compare-full-vs-simple-draft-8.md`. On the memo: `jim-cold-read-2026-09-06.md`,
`fix-proposals-2026-09-06.md`, `bloat-pass-2026-09-06.md`, `ml-review-text-pipeline-2026-09-06.md`.

Rubric scores so far: draft 5 scored 30 and 28; draft 6 scored 33; draft 7 scored 28. The draft-7 drop is
two caps (comparator on the catalyst proposer; direction of bias on the worry list) that draft 8 satisfied
and whose wording in the rubric was tightened. No evaluator has scored draft 8.

## 5. Placeholders the package must fill

Every `open` item beginning `EMPIRICS:` is a number or name that must come from the empirics repo before
the memo cites it: the French correlation; the retired crash-day threshold; the free transcript feeds and
their coverage; GDELT's first usable date; the momentum-style filer count; the extractor model and its
cutoff, and the post-cutoff month count; the encoder family and its yearly cutoffs; the first year with
enough news labels; the power calculations; the five unwind dates; and whether 42.6% is the driving-series
statistic. Do not invent these.

## 6. How to work and publish

- Dev server: `~/.claude/launch.json` has an entry `design` that serves this directory on port 8766
  (`python3 -m http.server 8766 --directory docs/design`). Open `index.html`, `levels.html`, `simple.html`.
- Edge labels show on hover and pin on click; the header note is dismissable; "fit" and "flip" are in
  the top bar; "history" (full view) and "about" (simplified) open the legend, problem block and
  proof-of-concept path.
- Publishing: clone `https://github.com/t1mchee/momentum-design.git`, `rsync -a --delete --exclude .git
  docs/design/ <clone>/`, commit, push to main. GitHub Pages builds within about a minute; confirm with
  `curl -s https://t1mchee.github.io/momentum-design/spec.yaml | grep version:`. Publish the directory
  as it is; Tim's instruction is never to scrub or remove content when sharing.
- Commit to the empirics repo (`/Users/Tim/unstructured_momentum`, not a git remote you push; 233+
  commits ahead of origin, pushing is Tim's call) with a message that names the draft. Untracked files
  there that are not this work and should be left alone: `.vscode/`, `paper/`, and the modified
  `reports/xray/2026-08-19.*`.

## 7. Standing instructions from Tim

- The spec is the intended system; no demo/production split inside it.
- Components not discussed on the advisor call stay as they were in v1, rewritten only in language.
- All production feeds are included, labelled PUBLIC, LICENSED or DESK-ONLY, with "not available to us
  now" where that is the case.
- When publishing or sharing, ship content exactly as it is.
- Edge labels hidden unless hovered or clicked; validation steps marked with their own shape.
- Maintain `docs/drafting/CONCERNS.md` (the memo ledger, items through 80) each memo round, and verify
  every number against the empirics repo before the memo carries it.

## 8. What comes after the language pass

In order: rewrite the 22 abridging paragraphs in `simple.yaml` from the absorbed nodes (carrying the
sentences the comparison names); write the memo from them, seven sections, at 6 to 10 pages, from the
memo repo `docs/drafting` (nested git, synced to Overleaf through GitHub `t1mchee/momentum-reversal-memo`);
build the proof of concept (the theme step with the keyword-versus-model comparison and the placebo,
feeding the tail model) and the example page with numbers; turn the review agents (skeptic, pattern
detector, rubric) on the memo rather than the spec.
