"""Consistency checks for the design files. Run from the repo root:

    uv run python docs/design/check.py

Exits non-zero on any structural failure; writing-rule findings are warnings. Checks spec.yaml (the full design), groups.yaml (the levels view) and
simple.yaml (the simplified map). Language-only edits should leave every check green.
"""
import re
import sys
from pathlib import Path

import yaml

D = Path(__file__).parent
ORDER = {"clean": 0, "as-of": 1, "model": 2, "live-only": 3, "human": 4}
fails = []
warns = []


def fail(msg):
    fails.append(msg)
    print("FAIL", msg)


def warn(msg):
    """Writing-rule findings: reported, counted, and not fatal. The language pass drives them to zero."""
    warns.append(msg)
    print("WARN", msg)


def producers(doc):
    prod = {}
    for n in doc["nodes"]:
        for o in n.get("outputs") or []:
            prod.setdefault(o, []).append(n["id"])
    return prod


def check_graph(doc, name, edge_field):
    nodes = {n["id"]: n for n in doc["nodes"]}
    prod = producers(doc)
    for n in doc["nodes"]:
        for i in n.get("inputs") or []:
            if i not in prod:
                fail(f"{name}: {n['id']} input has no producer: {i!r}")
            elif not any(e["from"] in prod[i] and e["to"] == n["id"] for e in doc["edges"]):
                fail(f"{name}: {n['id']} input {i!r} has no edge from its producer")
    for e in doc["edges"]:
        if e["from"] not in nodes or e["to"] not in nodes:
            fail(f"{name}: edge to unknown id {e}")
            continue
        if e.get("hidden"):
            continue
        src, dst = nodes[e["from"]], nodes[e["to"]]
        if not any(o in (dst.get("inputs") or []) for o in (src.get("outputs") or [])):
            fail(f"{name}: edge {e['from']}->{e['to']} matches no input on the consumer")
        if edge_field not in e:
            fail(f"{name}: edge {e['from']}->{e['to']} lacks the {edge_field!r} field")
    # look-ahead inheritance (human is not inherited)
    for n in doc["nodes"]:
        if n.get("status") == "retired":
            continue
        ins = [e for e in doc["edges"] if e["to"] == n["id"] and e.get("mode") != "live only"
               and not e.get("hidden") and nodes[e["from"]]["lookahead"] != "human"]
        strongest = max([ORDER[nodes[e["from"]]["lookahead"]] for e in ins], default=0)
        if n["lookahead"] != "human" and ORDER[n["lookahead"]] < strongest:
            fail(f"{name}: {n['id']} is {n['lookahead']} but an input is stronger")
    vals = {n["lookahead"] for n in doc["nodes"]}
    if not vals <= set(ORDER):
        fail(f"{name}: unknown lookahead values {vals - set(ORDER)}")
    return nodes


def check_writing(doc, name):
    for n in doc["nodes"]:
        # a line on its own with an '=' or an 'iff', or a display formula ($$ or \[), is not a sentence and is skipped
        prose = [l for l in (n.get("rule") or "").split("\n") if not re.search(r"=|\biff\b|^\s*step \d|^\s*(\$\$|\\\[)", l)]
        for sent in re.split(r"(?<=[.;:])\s+", " ".join(prose)):
            if len(sent.split()) > 45:
                warn(f"{name}: {n['id']} sentence over 45 words: {sent[:60]!r}")
    txt = yaml.safe_dump(doc)
    for pat, why in [
        (r"page (states|says|names|marks|tells|knows)", "speech verb for the page (rule 1)"),
        (r"\b(baseline|model|rule) (that )?knows\b", "a model does not know (rule 7)"),
        (r"\bcarrier", "carrier (rule 2)"),
        (r"leads the page", "coinage: leads the page"),
        (r"\b(Direction|Control|Calendar|Threshold|Case flag):\s", "label-colon fragment (rule 3)"),
        (r"There are (two|three|four|five) ", "announced count (rule 4)"),
        (r"model-unmitigable", "old look-ahead vocabulary"),
    ]:
        for m in re.finditer(pat, txt):
            warn(f"{name}: {why}: {m.group(0)!r}")


spec = yaml.safe_load((D / "spec.yaml").read_text())
groups = yaml.safe_load((D / "groups.yaml").read_text())
simple = yaml.safe_load((D / "simple.yaml").read_text())
yaml.safe_load((D / "changelog.yaml").read_text())

nodes = check_graph(spec, "spec", "carries")
check_writing(spec, "spec")

# proof-of-concept statuses: every node exactly one of path / deferred / described_only / retired
P = spec["meta"]["proof_of_concept"]
st = {}
for k in ("path", "deferred", "described_only"):
    for i in P.get(k) or []:
        st.setdefault(i, []).append(k)
for n in spec["nodes"]:
    if n["status"] == "retired":
        st.setdefault(n["id"], []).append("retired")
for k, v in st.items():
    if len(v) > 1:
        fail(f"spec: {k} has two proof-of-concept statuses {v}")
    if k not in nodes:
        fail(f"spec: proof-of-concept status names unknown id {k}")
for i in nodes:
    if i not in st:
        fail(f"spec: {i} has no proof-of-concept status")

# groups: every live node in exactly one group, every child exists
seen = {}


def walk(g):
    for c in g["children"]:
        if isinstance(c, dict):
            walk(c)
        else:
            seen.setdefault(c, []).append(g["id"])
            if c not in nodes:
                fail(f"groups: child {c} not in spec")


for g in groups["groups"]:
    walk(g)
for i in nodes:
    if i not in seen:
        fail(f"groups: {i} in no group")
    elif len(seen[i]) > 1:
        fail(f"groups: {i} in two groups {seen[i]}")

# simple: graph, writing, and absorbs cover every live node exactly once
check_graph(simple, "simple", "sends")
check_writing(simple, "simple")
ab = {}
for b in simple["nodes"]:
    for a in b.get("absorbs") or []:
        ab.setdefault(a, []).append(b["id"])
        if a not in nodes:
            fail(f"simple: {b['id']} absorbs unknown id {a}")
for i, n in nodes.items():
    if n["status"] != "retired" and i not in ab:
        fail(f"simple: live node {i} absorbed by no box")
for a, v in ab.items():
    if len(v) > 1:
        fail(f"simple: {a} absorbed by two boxes {v}")

print(f"spec: {len(spec['nodes'])} nodes, {len(spec['edges'])} edges; simple: {len(simple['nodes'])} boxes, {len(simple['edges'])} edges")
print(f"structure: {'OK' if not fails else str(len(fails)) + ' failures'}; writing: {len(warns)} warnings (target 0)")
sys.exit(1 if fails else 0)
