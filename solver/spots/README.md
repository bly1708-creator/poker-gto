# Solver spots

Each `*.yaml` file in this directory defines one postflop spot to solve
with TexasSolver. The CI workflow (`.github/workflows/solve.yml`)
builds TexasSolver from source, converts each YAML spot into a
TexasSolver config file, runs the solver, and writes the output to
`data/postflop/<id>.json`.

## Spot schema (YAML)

```yaml
id: 6max-srp-sb-vs-bb-a72r-cbet
title: "SB opens, BB calls, flop A72 rainbow — SB c-bet decision"
stacks_bb: 97.5                     # effective stacks after open+call
pot_bb: 5.5                         # pot after preflop action
board: "As 7h 2c"                   # space-separated cards
oop_range_file: "ranges/bb-defend-vs-sb-open.txt"  # Pio-format range string
ip_range_file: "ranges/sb-open-continue.txt"
bet_sizes:
  flop: [0.33, 0.75]                # fractions of pot
  turn: [0.5, 1.0]
  river: [0.5, 1.5]
allin_threshold: 0.67               # collapse to allin above this stack ratio
raise_limit: 3                      # max raises per street
iterations: 200                     # target exploitability chips
use_isomorphism: true
```

## Output schema

`data/postflop/<id>.json`:

```json
{
  "id": "6max-srp-sb-vs-bb-a72r-cbet",
  "title": "...",
  "source": {
    "tier": "verified",
    "solver": "TexasSolver <version>",
    "params": { "stacks_bb": 97.5, "pot_bb": 5.5, "board": "As 7h 2c" },
    "run_date": "2026-04-19",
    "run_file": "solver/runs/<id>.log.txt"
  },
  "root_strategy": {
    "actions": ["check", "bet_0.33_pot", "bet_0.75_pot"],
    "by_hand": {
      "AhAc": [0.0, 0.1, 0.9],
      "7d7s": [0.2, 0.4, 0.4]
    }
  }
}
```

## Running locally (without CI)

```bash
cd solver
pip install pyyaml
python run_solver.py spots/my-spot.yaml \
  --solver-bin /path/to/console_solver \
  --out ../data/postflop/my-spot.json
```
