#!/usr/bin/env python3
"""Convert a YAML spot definition into a TexasSolver config, run the solver,
and parse the output into the site's JSON schema.

Usage:
    python run_solver.py spots/my-spot.yaml \\
        --solver-bin /path/to/console_solver \\
        --resource-dir /path/to/TexasSolver/resources \\
        --out ../data/postflop/my-spot.json
"""
import argparse
import datetime
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.stderr.write("pip install pyyaml\n")
    sys.exit(2)


def normalize_board(board_str):
    """Accept 'As 7h 2c' or 'As,7h,2c' -> 'As,7h,2c'."""
    parts = board_str.replace(",", " ").split()
    return ",".join(parts)


RANKS = "23456789TJQKA"
RANK_IDX = {r: i for i, r in enumerate(RANKS)}


def expand_range(range_str):
    """Expand a Pio-style range string into the explicit-hand format that
    TexasSolver's PrivateRangeConverter accepts (AA, AKs, AKo — no '+', no
    dashes). Optional :weight suffixes are preserved per expanded hand.

    Supported inputs (comma-separated):
        AA                   -> AA
        22+                  -> 22,33,...,AA
        AKs                  -> AKs
        A2s+                 -> A2s,A3s,...,AKs
        A2s-A5s              -> A2s,A3s,A4s,A5s
        KQo+                 -> KQo (only KQo, since nothing higher)
        AQo-AJo              -> AQo,AJo
        AQ                   -> AQs,AQo
        AQ+                  -> AKs,AQs,AKo,AQo (both suited & offsuit, incl. pair AKs? no — AQ+ means AQs+,AQo+)
    A trailing ":0.5" weight suffix is supported and propagated.
    """
    out = []
    for tok in range_str.split(","):
        tok = tok.strip()
        if not tok:
            continue
        # split weight
        if ":" in tok:
            body, wt = tok.split(":", 1)
            suffix = ":" + wt.strip()
        else:
            body, suffix = tok, ""

        # Detect dash-range like A2s-A5s
        if "-" in body:
            lo, hi = body.split("-", 1)
            out.extend(_expand_dash_range(lo, hi, suffix))
            continue

        # Plus notation
        if body.endswith("+"):
            base = body[:-1]
            out.extend(_expand_plus_range(base, suffix))
            continue

        # Length-2 with no s/o (e.g. "AQ") -> expand both suited + offsuit
        if len(body) == 2 and body[0] != body[1]:
            out.append(body + "s" + suffix)
            out.append(body + "o" + suffix)
            continue

        # Plain pair (AA) or explicit (AKs, AKo)
        out.append(body + suffix)

    return ",".join(out)


def _expand_plus_range(base, suffix):
    """Handle tokens like 22+, A2s+, AKo+, AQ+."""
    # Pair plus: 22+
    if len(base) == 2 and base[0] == base[1]:
        r = base[0]
        start = RANK_IDX[r]
        return [RANKS[i] + RANKS[i] + suffix for i in range(start, len(RANKS))]

    # Unsuited plus (no s/o), e.g. AQ+ -> expand suited + offsuit of all higher kickers
    if len(base) == 2:
        hi, lo = base[0], base[1]
        if RANK_IDX[hi] < RANK_IDX[lo]:
            hi, lo = lo, hi
        result = []
        for i in range(RANK_IDX[lo], RANK_IDX[hi]):
            k = RANKS[i]
            result.append(hi + k + "s" + suffix)
            result.append(hi + k + "o" + suffix)
        return result

    # Suited or offsuit plus: A2s+ / KQo+
    if len(base) == 3 and base[2] in ("s", "o"):
        hi, lo, kind = base[0], base[1], base[2]
        if RANK_IDX[hi] < RANK_IDX[lo]:
            hi, lo = lo, hi
        result = []
        for i in range(RANK_IDX[lo], RANK_IDX[hi]):
            result.append(hi + RANKS[i] + kind + suffix)
        return result

    raise ValueError(f"unrecognized plus range: {base}+")


def _expand_dash_range(lo_tok, hi_tok, suffix):
    """Handle A2s-A5s, 22-99, AJo-AQo."""
    # Pair dash: 22-99
    if len(lo_tok) == 2 and lo_tok[0] == lo_tok[1]:
        a = RANK_IDX[lo_tok[0]]
        b = RANK_IDX[hi_tok[0]]
        if a > b:
            a, b = b, a
        return [RANKS[i] + RANKS[i] + suffix for i in range(a, b + 1)]

    # Suited/offsuit dash: share top card, kicker varies
    if len(lo_tok) == 3 and len(hi_tok) == 3 and lo_tok[0] == hi_tok[0] and lo_tok[2] == hi_tok[2]:
        top, kind = lo_tok[0], lo_tok[2]
        a = RANK_IDX[lo_tok[1]]
        b = RANK_IDX[hi_tok[1]]
        if a > b:
            a, b = b, a
        return [top + RANKS[i] + kind + suffix for i in range(a, b + 1)]

    raise ValueError(f"unrecognized dash range: {lo_tok}-{hi_tok}")


def build_config(spot, dump_path):
    lines = [
        f"set_pot {spot['pot_bb']}",
        f"set_effective_stack {spot['stacks_bb']}",
        f"set_board {normalize_board(spot['board'])}",
        f"set_range_oop {expand_range(spot['oop_range'])}",
        f"set_range_ip {expand_range(spot['ip_range'])}",
    ]
    bs = spot["bet_sizes"]

    def sizes(arr):
        # arr entries are pot fractions (0.5 = 50% pot).
        return ",".join(str(int(round(x * 100))) for x in arr)

    for pos in ("oop", "ip"):
        for street in ("flop", "turn", "river"):
            arr = bs.get(street, [])
            if arr:
                lines.append(f"set_bet_sizes {pos},{street},bet,{sizes(arr)}")
            lines.append(f"set_bet_sizes {pos},{street},allin")

    lines += [
        f"set_allin_threshold {spot['allin_threshold']}",
        "build_tree",
        f"set_thread_num {spot.get('threads', 8)}",
        f"set_accuracy {spot.get('accuracy', 0.5)}",
        f"set_max_iteration {spot['iterations']}",
        "set_print_interval 10",
        f"set_use_isomorphism {1 if spot.get('use_isomorphism', True) else 0}",
        "start_solve",
        f"set_dump_rounds {spot.get('dump_rounds', 2)}",
        f"dump_result {dump_path}",
    ]
    return "\n".join(lines) + "\n"


def extract_root_strategy(tree):
    """The dump is a nested tree. The root action node's strategy is what the
    site displays. Walk into the first action_node found that carries a
    `strategy` block."""
    def find_first_strategy(node):
        if isinstance(node, dict):
            if node.get("node_type") == "action_node" and "strategy" in node:
                return node["strategy"]
            # The top level itself is often an action node (no node_type set)
            # carrying `actions` + `childrens`. Its strategy lives under
            # one level deep on the action it takes.
            if "strategy" in node and isinstance(node["strategy"], dict):
                return node["strategy"]
            for v in node.values():
                r = find_first_strategy(v)
                if r:
                    return r
        return None

    return find_first_strategy(tree)


def parse_solver_output(raw_path, spot, solver_version):
    with open(raw_path) as f:
        tree = json.load(f)
    actions = tree.get("actions", [])
    strat = extract_root_strategy(tree) or {}
    by_hand = strat.get("strategy", {}) if isinstance(strat, dict) else {}
    # If the root itself has no strategy block, fall back to actions list alone.
    if not by_hand and "strategy" in tree and isinstance(tree["strategy"], dict):
        by_hand = tree["strategy"].get("strategy", {})
        actions = tree["strategy"].get("actions", actions)

    return {
        "id": spot["id"],
        "title": spot["title"],
        "source": {
            "tier": "verified",
            "solver": solver_version,
            "params": {
                "stacks_bb": spot["stacks_bb"],
                "pot_bb": spot["pot_bb"],
                "board": spot["board"],
                "bet_sizes": spot["bet_sizes"],
                "iterations": spot["iterations"],
            },
            "citation": None,
            "run_date": datetime.date.today().isoformat(),
            "run_file": f"solver/runs/{spot['id']}.raw.json",
        },
        "root_strategy": {
            "actions": actions,
            "by_hand": by_hand,
        },
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spot_file")
    ap.add_argument("--solver-bin", required=True, help="Path to console_solver binary")
    ap.add_argument("--resource-dir", required=True, help="Path to TexasSolver resources dir")
    ap.add_argument("--solver-version", default="TexasSolver HEAD")
    ap.add_argument("--out", required=True)
    ap.add_argument("--raw-out")
    args = ap.parse_args()

    with open(args.spot_file) as f:
        spot = yaml.safe_load(f)

    raw_out = args.raw_out or str(Path(args.out).with_suffix(".raw.json"))
    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    os.makedirs(os.path.dirname(raw_out) or ".", exist_ok=True)

    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as cfg:
        cfg.write(build_config(spot, raw_out))
        cfg_path = cfg.name

    print(f"Config:\n{open(cfg_path).read()}")
    # TexasSolver's console returns non-zero for trailing parse noise even when
    # the solve succeeded. Trust the dump file: if it exists and is valid JSON,
    # the run was successful.
    proc = subprocess.run([
        args.solver_bin,
        "--input_file", cfg_path,
        "--resource_dir", args.resource_dir,
        "--mode", "holdem",
    ])
    if not os.path.exists(raw_out) or os.path.getsize(raw_out) < 100:
        sys.stderr.write(f"Solver exited {proc.returncode} and produced no usable dump.\n")
        sys.exit(proc.returncode or 1)

    parsed = parse_solver_output(raw_out, spot, args.solver_version)
    with open(args.out, "w") as f:
        json.dump(parsed, f, indent=2)
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
