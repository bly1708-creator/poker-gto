#!/usr/bin/env python3
"""Convert a YAML spot definition into a TexasSolver config, run the solver,
and parse the output into the site's JSON schema.

Usage:
    python run_solver.py spots/my-spot.yaml \
        --solver-bin /path/to/console_solver \
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


def build_config(spot, dump_path):
    lines = [
        f"set_pot {spot['pot_bb']}",
        f"set_effective_stack {spot['stacks_bb']}",
        f"set_board {spot['board']}",
        f"set_range_oop {spot['oop_range']}",
        f"set_range_ip {spot['ip_range']}",
    ]
    bs = spot["bet_sizes"]
    def fmt(arr):
        return ",".join(str(int(x * 100)) for x in arr)
    lines += [
        f"set_bet_sizes oop,flop,bet,{fmt(bs['flop'])}",
        f"set_bet_sizes ip,flop,bet,{fmt(bs['flop'])}",
        f"set_bet_sizes oop,turn,bet,{fmt(bs['turn'])}",
        f"set_bet_sizes ip,turn,bet,{fmt(bs['turn'])}",
        f"set_bet_sizes oop,river,bet,{fmt(bs['river'])}",
        f"set_bet_sizes ip,river,bet,{fmt(bs['river'])}",
        f"set_allin_threshold {spot['allin_threshold']}",
        f"set_raise_limit {spot['raise_limit']}",
        f"set_use_isomorphism {str(spot.get('use_isomorphism', True)).lower()}",
        "build_tree",
        f"set_thread_number 8",
        f"set_accuracy 0.005",
        f"set_max_iteration {spot['iterations']}",
        "set_print_interval 10",
        "set_logfile solver.log",
        "start_solve",
        f"dump_result {dump_path}",
    ]
    return "\n".join(lines) + "\n"


def parse_solver_output(raw_path, spot, solver_version):
    """TexasSolver dumps a JSON tree. Extract the root-node strategy per hand."""
    with open(raw_path) as f:
        tree = json.load(f)
    root = tree.get("childrens") or tree.get("strategy") or tree
    actions = []
    by_hand = {}
    if "strategy" in tree:
        strat = tree["strategy"]
        actions = strat.get("actions", [])
        for hand, probs in strat.get("strategy", {}).items():
            by_hand[hand] = probs
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
    ap.add_argument("--solver-bin", required=True, help="Path to TexasSolver console binary")
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

    print(f"Config written to {cfg_path}")
    print(f"Running: {args.solver_bin} --mode console --config {cfg_path}")
    subprocess.check_call(
        [args.solver_bin, "--mode", "console", "--config", cfg_path]
    )

    parsed = parse_solver_output(raw_out, spot, args.solver_version)
    with open(args.out, "w") as f:
        json.dump(parsed, f, indent=2)
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
